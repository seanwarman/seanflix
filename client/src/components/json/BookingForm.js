import React, { Component } from 'react';
import BigglyJsonForm from './BigglyJsonForm';
import { API } from 'aws-amplify';
import color from '../libs/bigglyStatusColorPicker';
import jsonFormSanitiser from '../libs/jsonFormSanitiser';
import { 
  InputNumber,
  Skeleton,
  message,
  Layout,
  Card,
  Input,
  Col,
  Form,
  DatePicker,
  Row,
  Select,
  Icon,
  Divider,
  Drawer,
  Button
} from 'antd';
import moment from 'moment';
import BigglyGetMenu from './BigglyGetMenu';
import './BookingForm.css';
const { Option } = Select;
const { Content } = Layout;

export default class BookingForm extends Component {

  state = {
    template: {},
    jsonForm: [],
    formFields: {
      bookingName: '',
      dueDate: null,
      customerKey: null,
      partnerKey: null,

      // campaign form fields...
      productName: '',
      costPrice: 0,
      retailPrice: 0
    },
    templateSelection: [],
    quantity: 1,
    buttonDisabled: false,
    customers: [],

    // New customer...
    showDrawer: false,
    confirmLoading: false,

    customerName: '',
    partnerKey: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    emailAddress: '',
    postCode: '',
    telephone: '',
    townName: '',
    partnerAccMan: '',

    newCustomerKey: ''

  };

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  componentDidMount = async () => {
    this.props.changeHeader(...this.props.changeHeaderProps);
    this.loadDataAndSetState();
  }

  loadDataAndSetState = async(stateCopy) => {
    if(!stateCopy) stateCopy = { ...this.state };
    //TODO the items in templates needs to be formatted for the
    //cascader...
    stateCopy.showDrawer = false;
    stateCopy.confirmLoading = false;
    stateCopy.customers = await this.getCustomers();
    if(stateCopy.customers) this.setState(stateCopy);
  } 

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  getCustomers = async () => {
    let customers;
    try {
      customers = await API.get('biggly', `/console/key/${this.props.user.apiKey}/customers`);
    } catch (err) {
      console.log('There was an error getting the customer: ', err);
      return {};
    }
    return customers.map(customer => {
      return { value: customer.customerName, label: customer.customerName, ...customer }
    });

  }

  saveBookingAndAudit = async (initialStatus) => {
    let stateCopy = { ...this.state };
    stateCopy.buttonDisabled = true;
    let jsonForm = jsonFormSanitiser(stateCopy.jsonForm);
    let bookingResult;
    let auditResult;
    let bookingBody = {
      customerKey: stateCopy.formFields.customerKey,
      createdUserKey: this.props.user.userKey,
      bookingName: escape(stateCopy.formFields.bookingName),
      dueDate: stateCopy.formFields.dueDate,
      bookingDivKey: stateCopy.template.bookingDivKey,
      jsonStatus: jsonFormSanitiser(this.initialiseJsonStatus(stateCopy.template.jsonStatus, initialStatus)),
      currentStatus: initialStatus,
      tmpKey: stateCopy.template.tmpKey,
      partnerKey: stateCopy.formFields.partnerKey,
      jsonForm: jsonForm,
      colorLabel: stateCopy.template.colorLabel
    };

    try {
      bookingResult = await API.post('biggly', `/bookingpublic/key/${this.props.user.apiKey}/bookings/quantity/${stateCopy.quantity}`, {
        body: bookingBody
      });
    } catch (err) {
      console.log('There was an error posting the booking: ', err);
      message.error('There was an error saving your booking. Please try again.');
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
      return;
    }

    let auditBody = [];

    bookingResult.forEach(result => {
      auditBody.push({
        createdUserKey: this.props.user.userKey,
        bookingsKey: result.key,
        status: initialStatus,
        description: `This booking was created and set to ${initialStatus} status by ${this.props.user.firstName} ${this.props.user.lastName}.`
      });
    });

    try {
      auditResult = await API.post('biggly', `/bookingpublic/key/${this.props.user.apiKey}/audit`, {
        body: auditBody
      });
    } catch (err) {
      console.log('There was an error updating the audit: ', err);
      message.error('There was an error saving an audit for your booking.');
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
      return;
    }

    if (stateCopy.quantity === 1) {
      this.redirectToBooking(stateCopy, bookingResult, auditResult);
    } else if (stateCopy.quantity > 1) {
      this.redirectToBookingsTable(stateCopy, bookingResult, auditResult);
    }
  }


  // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  replacer = (key, value) => {
    if (typeof value === 'string') {
      value = value.replace(/\\/g, '');
      value = value.replace(/\t/g, '  ');
      return value.replace(/"/g, '\'');
    }
    return value;
  }

  redirectToBookingsTable = (stateCopy, bookingResult, auditResult) => {
    let errors = [];
    for (let result of bookingResult) {
      if (result.error) errors.push(result);
    }
    if (errors.length === 0) {
      message.success('Saved!', 2);
      message.loading('Redirecting you to the Bookings Table...', 2);
      // find the current path and replace the end with booking and the
      // bookingsKey
      const path = this.props.location.pathname.slice(0, this.props.location.pathname.lastIndexOf('/'));
      setTimeout(() => this.props.history.push(path), 2000);
    } else {
      message.error('There was an error saving some of your bookings.');
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
    }
  }

  redirectToBooking = (stateCopy, bookingResult, auditResult) => {
    if (bookingResult[0].affectedRows === 1 && auditResult[0].affectedRows === 1) {
      message.success('Saved!', 2);
      message.loading('Redirecting you to the booking...', 2);
      // find the current path and replace the end with booking and the
      // bookingsKey
      const path = this.props.location.pathname.slice(0, this.props.location.pathname.lastIndexOf('/')) + '/booking/' + bookingResult[0].key;
      setTimeout(() => this.props.history.push(path), 2000);
    } else {
      message.error('There was an error saving the form, please try again', 3);
      console.log('Form error bookingResult[0]: ', bookingResult[0]);
      console.log('bookingBody: ', stateCopy.bookingBody);
      console.log('Form error auditResult[0]: ', auditResult[0]);
      console.log('auditBody: ', stateCopy.auditBody);
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
    }
  }

  initialiseJsonStatus = (jsonStatus, initialStatus) => {
    if (initialStatus === 'Live') {

      return jsonStatus.map(item => (
        item.value === initialStatus ?
          { selected: true, value: 'Live', role: 'Anyone' }
          :
          item
      ));

    } else {

      return jsonStatus.map(item => (
        item.value === initialStatus ?
          { selected: true, value: 'Draft', role: 'Creator' }
          :
          item
      ));
    }
  }
  handleNum = (key, value) => {
    let stateCopy = { ...this.state };
    stateCopy.formFields[key] = value;
    this.setState(stateCopy);
  }
  handleDivChoice = (option, selectedOptions) => {
    let stateCopy = { ...this.state };
    stateCopy.formFields.bookingDivKey = option.bookingDivKey;
    this.setState(stateCopy);
  }

  inputChangeFunc = (option, selectedOptions) => {
    let stateCopy = { ...this.state };
    stateCopy.formFields.partnerKey = selectedOptions[0].partnerKey;
    stateCopy.formFields.customerKey = option.customerKey;
    this.setState(stateCopy);
  }

  momentValue = (value) => {
    if (value === null) return null;
    return new moment(value);
  };

  handleQuantity = number => {
    this.setState({ quantity: number });
  }

  handleTemplateSelection = (option, optionArray) => {
    let stateCopy = { ...this.state };
    stateCopy.templateSelection = optionArray;
    stateCopy.template = option;
    stateCopy.jsonForm = option.jsonForm;
    this.setState(stateCopy);
  }

  handleSearchableTemplateSelection = customer => {
    let stateCopy = { ...this.state };
    stateCopy.formFields.customerKey = customer.customerKey;
    stateCopy.formFields.partnerKey = customer.partnerKey;
    this.setState(stateCopy);
  }

  addCustomer = async () => {
    try {
      return await API.post('biggly', `/console/key/${this.props.user.apiKey}/customers`, {
        body: {
          userKey: this.props.user.userKey,
          customerName: this.state.customerName,
          partnerKey: this.props.user.partnerKey,
          addressLine1: this.state.addressLine1,
          addressLine2: this.state.addressLine2,
          addressLine3: this.state.addressLine3,
          emailAddress: this.state.emailAddress,
          postCode: this.state.postCode,
          telephone: this.state.telephone,
          partnerAccMan: this.state.partnerAccMan,
          townName: this.state.townName
        }
      });
    } catch (error) {
      console.log('add customer error :', error);
      return null;
    }
  }

  validateCustomerForm = () => {
    let valid = true;
    if(
      this.state.customerName.length === 0
    ) valid = false;
    return valid;
  }

  handleCustomerFormInput = (field, value) => {
    this.setState({[field]: value});
  }

  handleSubmitCustomerForm = async() => {
    if(!this.validateCustomerForm()) {
      message.error('Please fill in all required fields before saving.');
      return;
    }
    this.setState({confirmLoading: true});
    let result = await this.addCustomer();
    if(!result) {
      message.error('There was an error trying to save this customer.');
      return;
    }

    let stateCopy = {...this.state};

    stateCopy.formFields.customerKey = result;

    await this.loadDataAndSetState(stateCopy);
    message.success('Customer saved')
  }

  handleOpenAddCustomerDrawer = () => {
    this.setState({
      showDrawer: true,
      customerName: '',
      partnerKey: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      emailAddress: '',
      postCode: '',
      telephone: '',
      townName: '',
      partnerAccMan: '',
    });
  }

  // ░░▀ █▀▀ █▀▀█ █▀▀▄ █▀▀ █▀▀█ █▀▀█ █▀▄▀█
  // ░░█ ▀▀█ █░░█ █░░█ █▀▀ █░░█ █▄▄▀ █░▀░█
  // █▄█ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀░░ ▀▀▀▀ ▀░▀▀ ▀░░░▀

  changeField = (formObj, key, value) => {
    value = this.replacer(key, value);
    formObj[key] = value;
    this.setState(this.state);
  };

  submitForm = (initialStatus) => {
    if (!initialStatus) initialStatus = 'Draft';
    let stateCopy = { ...this.state };
    stateCopy.buttonDisabled = true;
    this.setState(stateCopy);
    if (!this.props.handleForm) {
      this.saveBookingAndAudit(initialStatus);
    } else {
      this.props.handleForm(this.state);
    }
  };

  flattenArr = (arr) => {
    return arr.reduce((flat, toFlatten) => {
      return this.flattenArr(flat).concat(toFlatten instanceof Array ? this.flattenArr(toFlatten) : toFlatten);
    }, []);
  }

  handleValidation = () => {
    const jsonForm = this.state.jsonForm.filter(item => (
      item.required === true && item.type !== 'multi'
    ));
    let multis = this.state.jsonForm.filter(item => (
      item.required === true && item.type === 'multi'
    ));
    multis = multis.reduce((arr, input) => {
      return this.flattenArr(arr).concat(this.flattenArr(input.children));
    }, []);

    const result = [
      ...multis,
      ...jsonForm,
      { value: this.state.formFields.bookingName },
      { value: this.state.formFields.dueDate },
      { value: this.state.formFields.customerKey },
      // This last option makes the button disable after clicking save
      { value: this.state.buttonDisabled }
    ];
    return result;
  }

  changeMulti = (field, fieldIndex) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonForm[fieldIndex] = field;
    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderAddCustomerDrawer = () => (
    <div>
      <Drawer
        width={620}
        title="Add a new Customer"
        visible={this.state.showDrawer}
        confirmLoading={this.state.confirmLoading}
        onClose={() => this.setState({showDrawer: false})}
      >
        <Form.Item required label="Customer Name">
          <Input
            onChange={e => this.handleCustomerFormInput('customerName', e.target.value)}
            value={this.state.customerName}
          />
        </Form.Item>
        <Form.Item label="Partner Account Manager">
          <Input
            onChange={e => this.handleCustomerFormInput('partnerAccMan', e.target.value)}
            value={this.state.partnerAccMan}
          />
        </Form.Item>
        <Form.Item label="Address">
          <Input
            onChange={e => this.handleCustomerFormInput('addressLine1', e.target.value)}
            value={this.state.addressLine1}
          />
        </Form.Item>
        <Form.Item>
          <Input
            onChange={e => this.handleCustomerFormInput('addressLine2', e.target.value)}
            value={this.state.addressLine2}
          />
        </Form.Item>
        <Form.Item>
          <Input
            onChange={e => this.handleCustomerFormInput('addressLine3', e.target.value)}
            value={this.state.addressLine3}
          />
        </Form.Item>
        <Form.Item label="Town">
          <Input
            onChange={e => this.handleCustomerFormInput('townName', e.target.value)}
            value={this.state.townName}
          />
        </Form.Item>
        <Form.Item label="Post Code">
          <Input
            onChange={e => this.handleCustomerFormInput('postCode', e.target.value)}
            value={this.state.postCode}
          />
        </Form.Item>
        <Form.Item label="Telephone">
          <Input
            onChange={e => this.handleCustomerFormInput('telephone', e.target.value)}
            value={this.state.telephone}
          />
        </Form.Item>
        <Form.Item label="Email">
          <Input
            onChange={e => this.handleCustomerFormInput('emailAddress', e.target.value)}
            value={this.state.emailAddress}
          />
        </Form.Item>
        <div 
          style={{textAlign: 'right'}}
        >
          <Button
            onClick={() => this.setState({showDrawer: false})}
          >Cancel</Button>
          <Button
            type="primary"
            disabled={!this.validateCustomerForm()}
            onClick={this.handleSubmitCustomerForm}
          >Save</Button>
        </div>
      </Drawer>
    </div>
  )

  render() {
    let date = null;
    const { template } = this.state;
    const templateColor = template.colorLabel ? color('template', 'colorLabel', template.colorLabel).color : null;
    return (
      <div>
        {this.renderAddCustomerDrawer()}
        <Content style={{
          margin: '94px 16px 24px', padding: 24, minHeight: 280,
        }}>
          <Row>
            <Col span={24}>
              <Card style={{ marginBottom: '16px' }}>
                <Row>
                  <Col span={12}>
                    {
                      this.state.template.tmpName ?
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '17px',
                            height: '17px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            backgroundColor: templateColor,
                          }}></div>
                          <h1 style={{ marginBottom: 0 }}>{this.state.template.tmpName}</h1>
                        </div>
                        :
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '17px',
                            height: '17px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            backgroundColor: '#d9d9d9',
                          }}></div>
                          <h1 style={{ marginBottom: 0, color: '#d9d9d9' }}>Template Name</h1>
                        </div>
                    }
                  </Col>

                </Row>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card style={{ marginBottom: '16px' }}>
                <Row gutter={16}>

                  {
                    this.props.campaignForm &&
                    <Col span={24}>
                      <Form.Item label="Product Name">
                        <Input
                          onChange={e => {
                            this.changeField(this.state.formFields, 'productName', e.target.value);
                          }}
                          value={this.state.formFields.productName}
                        />
                      </Form.Item>
                    </Col>
                  }

                  {
                    this.props.campaignForm &&
                    <Col span={3}>
                      <Form.Item label="Cost Price">
                        <InputNumber
                          //  formatter={value => `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          //  parser={value => value.replace(/\£\s?|(,*)/g, '')} 
                          //  step={0.1}
                          min={0}
                          onChange={value => this.handleNum('costPrice', value)}
                          value={this.state.formFields.costPrice}
                        />
                      </Form.Item>
                    </Col>
                  }

                  {
                    this.props.campaignForm &&
                    <Col span={3}>
                      <Form.Item label="Retail Price">
                        <InputNumber
                          // formatter={value => `£ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          // parser={value => value.replace(/\£\s?|(,*)/g, '')} 
                          // step={0.1} 
                          min={0}
                          onChange={value => this.handleNum('retailPrice', value)}
                          value={this.state.formFields.retailPrice}
                        />
                      </Form.Item>
                    </Col>
                  }

                  <Col span={24}>
                    <Form.Item label="Booking Name">
                      <Input
                        onChange={e => {
                          this.changeField(this.state.formFields, 'bookingName', e.target.value);
                        }}
                        value={this.state.formFields.bookingName}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Template">
                      {
                        !this.props.bookingDivKey ?
                          <BigglyGetMenu
                            cascaderAttr={{
                              placeholder: 'Choose a Template',
                              style: { textAlign: 'left' },
                              allowClear: false,
                              value: (
                                this.state.templateSelection &&
                                this.state.templateSelection.map(item => item.value)
                              )
                            }}
                            apiKey={this.props.user.apiKey}
                            menuSelectionFunction={this.handleTemplateSelection}
                            menuOptions={[
                              {
                                optionKey: 'bookingDivName',
                                typeDisplay: 'Divisions',
                                isLeaf: false,
                                async get(apiKey) {
                                  return await API.get('biggly', `/bookingadmin/key/${apiKey}/divisions`)
                                }
                              },
                              {
                                optionKey: 'tmpName',
                                typeDisplay: 'Templates',
                                isLeaf: true,
                                getKeys: ['bookingDivKey'],
                                async get(apiKey, getKey) {
                                  return await API.get('biggly', `/bookingadmin/key/${apiKey}/divisions/${getKey}/templates`);
                                }
                              }
                            ]}
                          />
                          :
                          <BigglyGetMenu
                            cascaderAttr={{
                              placeholder: 'Choose a template',
                              style: { textAlign: 'left' },
                              allowClear: false,
                              value: (
                                this.state.templateSelection &&
                                this.state.templateSelection.map(item => item.value)
                              )
                            }}
                            apiKey={this.props.user.apiKey}
                            menuSelectionFunction={this.handleTemplateSelection}
                            menuOptions={[
                              {
                                optionKey: 'tmpName',
                                typeDisplay: 'Templates',
                                isLeaf: true,
                                getKeys: [this.props.bookingDivKey],
                                async get(apiKey, getKey) {
                                  return await API.get('biggly', `/bookingadmin/key/${apiKey}/divisions/${getKey}/templates`);
                                }
                              }
                            ]}
                          />
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Quantity">
                      <InputNumber min={1} max={50} onChange={this.handleQuantity} value={this.state.quantity} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    {
                      this.props.user.accessLevel === 'Provider' ?
                        <Form.Item label="Customer">
                          {
                            this.state.customers &&
                            <Select
                              value={
                                this.state.formFields.customerKey && 
                                this.state.customers ?
                                this.state.customers.find(customer => customer.customerKey === this.state.formFields.customerKey).customerName
                                :
                                undefined
                              }
                              style={{ maxWidth: 202, width: '100%' }}
                              placeholder="Choose a Customer"
                              dropdownRender={menu => (
                                <div>
                                  {menu}
                                  <Divider style={{ margin: '4px 0' }} />
                                  <div
                                    style={{ padding: '4px 8px', cursor: 'pointer' }}
                                    onMouseDown={e => e.preventDefault()}
                                  >
                                    {
                                      this.state.savingCustomer ?
                                      <Icon type="loading" />
                                      :
                                      <div
                                        onClick={this.handleOpenAddCustomerDrawer}
                                      >
                                        <Icon
                                          type="plus"
                                        />Add Customer
                                      </div>
                                    }
                                  </div>
                                </div>
                              )}
                            >
                              {
                                this.state.customers.map((customer, i) => (
                                  <Option
                                    key={customer.customerKey}
                                    onClick={() => this.handleSearchableTemplateSelection(customer)}
                                  >{customer.customerName}</Option>
                                ))
                              }
                            </Select>

                          }
                        </Form.Item>
                        :
                        <Form.Item label="Customer">
                          <BigglyGetMenu
                            apiKey={this.props.user.apiKey}
                            menuSelectionFunction={this.inputChangeFunc}
                            menuOptions={[
                              {
                                typeDisplay: 'Partners',
                                optionKey: 'partnerName',
                                isLeaf: false,
                                async get(userApiKey) {
                                  return await API.get('biggly', `/partners/key/${userApiKey}/partners`);
                                }
                              },
                              {
                                typeDisplay: 'Customers',
                                optionKey: 'customerName',
                                isLeaf: true,
                                getKeys: ['apiKey'],
                                async get(userApiKey, apiKey) {
                                  return await API.get('biggly', `/console/key/${apiKey}/customers`);
                                }
                              }
                            ]}
                          />
                        </Form.Item>
                    }
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Due Date">
                      <DatePicker
                        disabledDate={current => (
                          current < moment().subtract(1, 'days')
                        )}
                        onChange={moment => {
                          if (moment) date = moment.toDate()
                          this.changeField(this.state.formFields, 'dueDate', date);
                        }}
                        value={this.momentValue(this.state.formFields.dueDate)}
                      ></DatePicker>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                {
                  (this.state.jsonForm || {}).length > 0 ?
                    <BigglyJsonForm
                      jsonForm={this.state.jsonForm}
                      changeMulti={this.changeMulti}
                      submitForm={this.submitForm}
                      changeField={this.changeField}
                      // The form validation looks for objects with a 'value' key.
                      // To add extra fields to validate just add them as extra objects
                      // with the field's value as the input field.
                      validateCondition={this.handleValidation()}
                      saveStatusButtons={this.props.saveStatusButtons}
                    ></BigglyJsonForm>
                    :
                    <Skeleton />
                }
              </Card>
            </Col>
          </Row>
        </Content>
      </div>
    )
  }
}
