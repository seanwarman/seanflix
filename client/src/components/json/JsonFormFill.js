import React, {Component} from 'react';
import '../../App.css';
import {Select, Form, Input, Icon, Button, Row, Col, DatePicker} from 'antd';
import './JsonFormFill.css';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';

const {Option} = Select;

export default class JsonFormFill extends Component {

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀ █▀▀ ░▀░ █▀▀▄ █▀▀▀ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █▄▄█ ▀▀█ ▀▀█ ▀█▀ █░░█ █░▀█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀░░▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░░▀ ▀▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  state = {
    saved: true,
    saving: false,
    loading: true,
    jsonForm: [],
    customFields: []
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  componentDidMount() {
    this.loadDataAndSetState()
  }

  loadDataAndSetState() {
    let jsonForm = [];
    let customFields = [];
    if(this.props.jsonForm) jsonForm = JSON.parse(JSON.stringify(this.props.jsonForm));
    if(this.props.customFields) customFields = JSON.parse(JSON.stringify(this.props.customFields));
    this.setState({jsonForm, customFields, loading: false, saved: true, saving: false});
  }

  // █▀▀ █▀▀█ █▀▀█ █▀▄▀█
  // █▀▀ █░░█ █▄▄▀ █░▀░█
  // ▀░░ ▀▀▀▀ ▀░▀▀ ▀░░░▀

  saved = () => {
    return this.state.saved;
  }

  flattenArr = (arr) => {
    return arr.reduce((flat, toFlatten) => {
      return this.flattenArr(flat).concat(toFlatten instanceof Array ? this.flattenArr(toFlatten) : toFlatten);
    }, []);
  }

  validateForm() {
    const {saved, jsonForm, customFields} = this.state;
    const form = [...jsonForm, ...customFields];
    if(saved) return false;
    let valid = true;
    let formCopy = form.filter( item => (
      item.required === true && item.type !== 'multi'
    ));
    let multis = form.filter( item => (
      item.required === true && item.type === 'multi'
    ));
    formCopy = multis.reduce( (arr, input) => {
      return this.flattenArr(arr).concat(this.flattenArr(input.children));
    }, formCopy);
    if(formCopy.find( item => (
      (typeof item.value === 'string' && item.value.length < 1)
      ||
      (typeof item.value === 'object' && item.value === null)
    ))) {
      valid = false;
    }
    return valid;
  }

  onChangeForm = (value, i, formType) => {
    let stateCopy = {...this.state};
    stateCopy[formType][i].value = value;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  // █▀▄▀█ █░░█ █░░ ▀▀█▀▀ ░▀░
  // █░▀░█ █░░█ █░░ ░░█░░ ▀█▀
  // ▀░░░▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀

  addMulti = (field, fieldIndex, formType) => {
    let template = [];
    field.template.forEach((item, index) => {
      template[index] = { ...item };
    });
    field.children.push(template);
    this.updateMulti(field, fieldIndex, formType);
  }
  
  removeMulti = (field, fieldIndex, childIndex, formType) => {
    field.children.splice(childIndex, 1);
    this.updateMulti(field, fieldIndex, formType);
  }

  updateMulti = (field, fieldIndex, formType) => {
    let stateCopy = {...this.state};
    stateCopy[formType][fieldIndex] = field;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  onChangeMulti = (value, jsonIndex, childIndex, templateIndex, formType) => {
    let stateCopy = { ...this.state };
    stateCopy[formType][jsonIndex].children[childIndex][templateIndex].value = value;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  // █▀▀ ░▀░ █▀▀ █░░ █▀▀▄   ▀▀█▀▀ █░░█ █▀▀█ █▀▀ █▀▀
  // █▀▀ ▀█▀ █▀▀ █░░ █░░█   ░░█░░ █▄▄█ █░░█ █▀▀ ▀▀█
  // ▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀░   ░░▀░░ ▄▄▄█ █▀▀▀ ▀▀▀ ▀▀▀

  input = (field, i, formType) => (
    <Form.Item key={i} label={field.label}>
      <Input
        value={field.value}
        label={field.label}
        className="bms-input-preview"
        onChange={e => this.onChangeForm(e.target.value, i, formType)}
      ></Input>
    </Form.Item>
  )

  multi = (field, jsonIndex, formType) => (
    <div
      key={jsonIndex}
      style={{
        background: '#f0f2f5',
        padding: '8px',
        borderRadius: '5px',
        marginBottom: '8px',
        position: 'relative'
      }}
    >
      {
        field.children.map((childField, childIndex) => (
          <div key={childIndex}>
            <Form.Item label={childField[0].label}>
              <Input
                value={childField[0].value}
                onChange={e => this.onChangeMulti(e.target.value, jsonIndex, childIndex, 0, formType)}
                className="bms-multi-preview"
              ></Input>
            </Form.Item>
            <Form.Item label={childField[1].label}>
              <TextArea
                value={childField[1].value}
                onChange={e => this.onChangeMulti(e.target.value, jsonIndex, childIndex, 1, formType)}
                className="bms-multi-preview"
              ></TextArea>
            </Form.Item>
            {
              this.renderMultiButtons(field, jsonIndex, childIndex, formType)
            }
          </div>
        ))
      }
    </div>
  )

  dropdown = (field, i, formType) => (
    <Form.Item key={i} label={field.label}>
      <Select
        style={{width: 200}}
        value={field.value}
        label={field.label}
        onChange={value => this.onChangeForm(value, i, formType)}
        className="bms-dropdown-preview"
      >
        {
          field.selections &&
          field.selections.split(',').map( (option, index) => (
            <Option value={option.trim()} key={index}>
                {option.trim()}
            </Option>
          ))
        }
      </Select>
    </Form.Item>
  )

  textarea = (field, i, formType) => (
    <Form.Item key={i} label={field.label}>
      <TextArea
        value={field.value}
        label={field.label}
        onChange={e => this.onChangeForm(e.target.value, i, formType)}
        className="bms-textarea-preview"
      ></TextArea>
    </Form.Item>
  )

  date = (field, i, formType) => (
    <Form.Item key={i} label={field.label}>
      <DatePicker
        value={field.value && moment(field.value)}
        label={field.label}
        onChange={moment => this.onChangeForm(moment, i, formType)}
        className="bms-date-preview"
      ></DatePicker>
    </Form.Item>
  )

  number = (field, i, formType) => (
    <Form.Item key={i} label={field.label}>
      <Input
        value={field.value}
        type="number"
        label={field.label}
        onChange={e => this.onChangeForm(e.target.value, i, formType)}
        className="bms-number-preview"
      ></Input>
    </Form.Item>
  )

  update = async() => {
    this.setState({saving: true, saved: true});
    await this.props.update(this.state);
    this.loadDataAndSetState();
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderMultiButtons = (field, fieldIndex, childIndex, formType) => (
    <div style={{ textAlign: 'center' }}>
      { 
        field.children.length === 1 ?
        <Icon
          style={{
            fontSize: '1.5rem',
            background: 'white',
            borderRadius: '50%',
          }}
          type="plus-circle"
          onClick={() => this.addMulti(field, fieldIndex, formType)}
        /> 
        :
        childIndex === field.children.length - 1 ?
        <div>
          <Icon
            style={{
              fontSize: '1.5rem',
              background: 'white',
              borderRadius: '50%',
              marginRight: '4px'
            }}
            type="plus-circle"
            onClick={() => this.addMulti(field, fieldIndex, formType)}
          /> 
          <Icon
            style={{
              fontSize: '1.5rem',
              background: 'white',
              borderRadius: '50%',
              marginLeft: '4px'
            }}
            type="minus-circle"
            onClick={() => this.removeMulti(field, fieldIndex, childIndex, formType)}
          /> 
        </div>
        :
        <Icon
          style={{
            fontSize: '1.5rem',
            background: 'white',
            borderRadius: '50%',
          }}
          type="minus-circle"
          onClick={() => this.removeMulti(field, fieldIndex, childIndex, formType)}
        /> 
      }
    </div>
  )
  
  render() {
    const {jsonForm, customFields} = this.state;
    return (
      <div>
        <Row>
          <Col span={24}>
            {
              customFields && customFields.map((field, index) => (
                this[field.type](field, index, 'customFields')
              ))
            }
          </Col>
          <Col span={24}>
            {
              jsonForm && jsonForm.map((field, index) => (
                this[field.type](field, index, 'jsonForm')
              ))
            }
          </Col>
        </Row>
        <Col style={{textAlign: 'right'}} span={24}>
          <Button
            loading={this.state.saving}
            disabled={!this.validateForm()}
            onClick={this.update}
          >Save</Button>
          <Button 
            disabled={this.saved()} 
            onClick={() => this.loadDataAndSetState()}
          >Cancel</Button>
        </Col>
      </div>
    );
  }
}
