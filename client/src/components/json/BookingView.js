import React, { Component, Fragment } from 'react';
import { Popconfirm, InputNumber, Tabs, Tooltip, Drawer, Input, Popover, Avatar, Button, Steps, message, Layout, Card, Col, Row, Icon, Timeline, Skeleton, Tag, Divider, Select, DatePicker, Typography, Form } from 'antd';
import { API } from 'aws-amplify';
import moment from 'moment';
import colors from '../mixins/BigglyColors';
import color from '../libs/bigglyStatusColorPicker';
import jsonFormSanitiser from '../libs/jsonFormSanitiser';
import { s3Upload } from '../libs/awsLib';
import './Booking.css';

const { Step } = Steps;
const { Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

let key = 0;

class Booking extends Component {
  state = {
    booking: [],
    bookingAudit: [],
    jsonForm: [],
    jsonStatus: [],
    statusIndex: 0,
    pendingStatus: false,
    pendingPageLoad: true,
    pendingAssignUser: false,
    currentStatus: null,
    statusOptionVisible: false,
    drawerVisible: false,
    form: {
      comment: null
    },

    comments: [],
    upload: null,
    uploads: [],
    uploading: false,
    uploadReady: false,
    pendingComment: false,
    file: null,
    url: null,
    bookingMonth: null,

    editMode: false,
    briefChanged: false,
    jsonFormCopy: [],
    dueDateCopy: null,
    bookingNameCopy: null,
    saving: false,

    queryOptionVisable: false,
    queryComment: null

  };

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  componentDidUpdate = () => {
    this.setTextareaHeight();
  }

  componentDidMount = () => {
    // We have to grab the url of the last link in the header tree here
    // because it's a variable url string.
    let changeHeaderProps = [...this.props.changeHeaderProps];
    changeHeaderProps[2].push({ name: 'Booking', url: this.props.match.url });
    this.props.changeHeader(...changeHeaderProps);

    this.loadInitialData();
    // this.loadDataAndSetState();
  };

  loadInitialData = async() => {
    let stateCopy = { ...this.state };
    let booking;

    try {
      booking = await API.get(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }`
      );
    } catch (err) {
      alert('There was a problem getting the data');
      console.log(err);
    }

    if (!booking) {
      this.props.history.push('/notfound');
      return;
    }

    // Set the booking object to the state and get the current status...
    stateCopy.booking = booking;
    stateCopy.jsonForm = booking.jsonForm;
    stateCopy.jsonStatus = booking.jsonStatus;
    stateCopy.statusIndex = stateCopy.jsonStatus.findIndex(
      item => item.selected
    );
    stateCopy.currentStatus = stateCopy.jsonStatus[stateCopy.statusIndex].value;

    // Get the comments
    try {
      stateCopy.comments = await API.get(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }/comments`
      );
    } catch (err) {
      console.log(
        'There was an error getting the comments by bookingsKey: ',
        err
      );
    }
    stateCopy.form.comment = null;
    stateCopy.briefChanged = false;
    stateCopy.editMode = false;
    stateCopy.saving = false;
    stateCopy.pendingStatus = false;
    stateCopy.pendingPageLoad = false;
    stateCopy.pendingAssignUser = false;
    stateCopy.pendingComment = false;
    stateCopy.uploading = false;
    stateCopy.uploadReady = false;
    stateCopy.upload = null;
    stateCopy.queryOptionVisable = false;
    stateCopy.queryComment = null;
    stateCopy.statusOptionVisible = false;
     
    this.setState(stateCopy);
  }

  loadAudit = async() => {
    let stateCopy = { ...this.state };
    try {
      stateCopy.bookingAudit = await API.get(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }/audit`
      );
    } catch (err) {
      console.log(err);
    }

    stateCopy.drawerVisible = true;
    this.setState(stateCopy);
  }

  loadUploads = async() => {
    let stateCopy = { ...this.state };
    // Get uploads
    try {
      stateCopy.uploads = await API.get(
        'biggly',
        `/biggly/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }/uploads`
      );
    } catch (err) {
      console.log('There was an error getting the uploads: ', err);
    }
    this.setState(stateCopy);
  }

  loadDataAndSetState = async stateCopy => {
    if (!stateCopy) stateCopy = { ...this.state };
    let booking;
    let bookingAudit;

    try {
      booking = await API.get(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }`
      );
    } catch (err) {
      alert('There was a problem getting the data');
      console.log(err);
    }

    if (!booking) {
      this.props.history.push('/notfound');
      return;
    }

    // Set the booking object to the state and get the current status...
    stateCopy.booking = booking;
    stateCopy.jsonForm = booking.jsonForm;
    stateCopy.jsonStatus = booking.jsonStatus;
    stateCopy.statusIndex = stateCopy.jsonStatus.findIndex(
      item => item.selected
    );
    stateCopy.currentStatus = stateCopy.jsonStatus[stateCopy.statusIndex].value;

    try {
      bookingAudit = await API.get(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }/audit`
      );
    } catch (err) {
      console.log(err);
    }

    stateCopy.bookingAudit = bookingAudit;

    // Get the comments
    try {
      stateCopy.comments = await API.get(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }/comments`
      );
    } catch (err) {
      console.log(
        'There was an error getting the comments by bookingsKey: ',
        err
      );
    }
    stateCopy.form.comment = null;

    // Get uploads
    try {
      stateCopy.uploads = await API.get(
        'biggly',
        `/biggly/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }/uploads`
      );
    } catch (err) {
      console.log('There was an error getting the uploads: ', err);
    }

    stateCopy.briefChanged = false;
    stateCopy.editMode = false;
    stateCopy.saving = false;
    stateCopy.pendingStatus = false;
    stateCopy.pendingPageLoad = false;
    stateCopy.pendingAssignUser = false;
    stateCopy.pendingComment = false;
    stateCopy.uploading = false;
    stateCopy.uploadReady = false;
    stateCopy.upload = null;
    stateCopy.queryOptionVisable = false;
    stateCopy.queryComment = null;
    stateCopy.statusOptionVisible = false;

    this.setState(stateCopy);
  };

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  saveComment = async commentBody => {
    this.setState({ pendingComment: true });
    let result;
    try {
      result = await API.post('biggly', `/bookingpublic/key/${this.props.user.apiKey}/comments`, {
        body: commentBody
      });
    } catch (err) {
      console.log('There was an error creating the comment: ', err);
      message.error('You\'re comment didn\'t save properly, please try again.');
      return null;
    }
    return result;
  }

  deleteBookingAndReferences = async() => {
    const apiKey = this.props.user.apiKey;
    const bookingsKey = this.state.booking.bookingsKey;
    const userKey = this.props.user.userKey;

    let error;

    try {
      await API.del('biggly', `/bookingpublic/key/${apiKey}/user/${userKey}/bookings/${bookingsKey}`)
    } catch (err) {
      error = err;
      console.log('There was an error attempting to delete this booking.');
      console.log(err);
    }

    message.destroy();
    if(error) {
      message.error('The Booking failed to properly delete.');
      return;
    }
    message.success('Booking deleted!');


    // Go back to the Bookings Table...
    let path = this.sliceBasePath(this.props.location.pathname);
    this.props.history.push(path);
  }

  // notifyOfStatus = async params => {
  //   const recipient = params.recipient;

  //   const bookingName = unescape(this.state.booking.bookingName);

  //   const notifyBody = {
  //     templateKey: '23c27030-a4b2-11e9-887b-29f7a7dd6d4a',
  //     fromName: 'Biggly Support',
  //     fromEmail: 'support@biggly.co.uk',
  //     emailTitle: 'Booking Update',
  //     emailSubject: params.emailSubject,
  //     toEmail: recipient.emailAddress,
  //     toName: `${recipient.firstName} ${recipient.lastName}`,
  //     parameters: JSON.stringify({
  //       bookingName: bookingName,
  //       userFirstName: recipient.firstName,
  //       userLastName: recipient.lastName,
  //       bookingUrl: config.baseUrl + this.props.location.pathname,
  //       description: params.description
  //     })
  //   };

  //   try {
  //     await API.post('biggly', `/notify/key/${this.props.user.apiKey}/emails`, {
  //       body: notifyBody
  //     });
  //   } catch (err) {
  //     console.log(
  //       'There was an error saving this object to the email queue: ',
  //       notifyBody,
  //       err
  //     );
  //   }
  // };

  // notify = async description => {
  //   let recipient = this.findRecipient();

  //   if(!recipient) {
  //     console.log('No recipient to notify.');
  //     return;
  //   }
  //   const bookingName = unescape(this.state.booking.bookingName);

  //   const notifyBody = {
  //     templateKey: '23c27030-a4b2-11e9-887b-29f7a7dd6d4a',
  //     fromName: 'Biggly Support',
  //     fromEmail: 'support@biggly.co.uk',
  //     emailTitle: 'Booking Update',
  //     emailSubject: `${unescape(this.state.booking.bookingName)} has been updated.`,
  //     toEmail: recipient.emailAddress,
  //     toName: `${recipient.firstName} ${recipient.lastName}`,
  //     parameters: JSON.stringify({
  //       bookingName: bookingName,
  //       userFirstName: recipient.firstName,
  //       userLastName: recipient.lastName,
  //       bookingUrl: config.baseUrl + this.props.location.pathname,
  //       description: description
  //     })
  //   };

  //   try {
  //     await API.post('biggly', `/notify/key/${this.props.user.apiKey}/emails`, {
  //       body: notifyBody
  //     });
  //   } catch (err) {
  //     console.log(
  //       'There was an error saving this object to the email queue: ',
  //       notifyBody,
  //       err
  //     );
  //   }
  // };

  saveAudit = async auditBody => {
    try {
      await API.post('biggly', `/bookingpublic/key/${this.props.user.apiKey}/audit`, {
        body: auditBody
      });
    } catch (err) {
      console.log(
        'There was an error saving the audit for the file upload: ',
        err
      );
    }
  };

  onChangeUrl = e => {
    e.preventDefault();

    let stateCopy = {...this.state};

    stateCopy.url = e.target.value;

    this.setState(stateCopy);
  }

  saveUrl = async (e) => {
    e.preventDefault();

    let stateCopy = { ...this.state };
    let { user } = this.props;

    stateCopy.upload = {
      urlName: escape(stateCopy.url),
      uploadedUserKey: this.props.user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      fileName: escape(stateCopy.url),
      customerKey: this.state.booking.customerKey
    };

    try {
      await API.post(
        'biggly',
        `/biggly/key/${user.apiKey}/uploads`,
        {
          body: stateCopy.upload
        }
      );
    } catch (err) {
      console.log('There was an error trying to save the upload record: ', err);
      console.log(stateCopy.upload)
      message.error('The upload failed to save :(');
      return;
    }

    let auditBody = {
      createdUserKey: user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      status: stateCopy.currentStatus,
      description: `${user.firstName} ${user.lastName} added the following link:
      ${unescape(stateCopy.upload.urlName)}`
    };

    await this.saveAudit(auditBody);

    message.success('URL added');

    this.setState({ url: '' });

    this.loadDataAndSetState();
  }

  saveUpload = async () => {
    let stateCopy = { ...this.state };
    let { user } = this.props;

    let s3UrlName;
    let s3Url = 'https://s3-eu-west-1.amazonaws.com/bms-console-services/public/';
    try {
      s3UrlName = await s3Upload(stateCopy.file);
    } catch (err) {
      console.log('There was an error uploading to the s3: ', err);
    }

    let recordResult;

    stateCopy.upload.urlName = s3Url + s3UrlName;

    stateCopy.upload = {
      urlName: escape(stateCopy.url),
      uploadedUserKey: this.props.user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      fileName: escape(stateCopy.url),
      customerKey: this.state.booking.customerKey
    };

    try {
      recordResult = await API.post(
        'biggly',
        `/biggly/key/${user.apiKey}/uploads`,
        {
          body: stateCopy.upload
        }
      );
    } catch (err) {
      console.log('There was an error trying to save the upload record: ', err);
      message.error('The upload failed to save :(');
    }

    if ((recordResult || {}).affectedRows > 0) {
      message.success('Upload saved!');
    } else {
      console.log(
        'There was an error saving to the uploads record: ',
        recordResult
      );
      message.error('There was a problem with this upload. Please try again.');
      this.loadDataAndSetState();
      return;
    }

    let auditBody = {
      createdUserKey: user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      status: stateCopy.currentStatus,
      description: `${user.firstName} ${user.lastName} uploaded a file called ${
        stateCopy.upload.fileName
      } to the booking.`
    };

    await this.saveAudit(auditBody);

    // if (this.state.booking.assignedUserKey) {
    //   this.notify(`${user.firstName} ${user.lastName} uploaded a file called ${ stateCopy.upload.fileName } to the booking: ${unescape(stateCopy.booking.bookingName)}.`);
    // }

    this.loadDataAndSetState();
  };

  createComment = async () => {
    // TODO make this faster by assuming it's going to work. Push this object
    // straight to the comment object on state. Do a setState rather than
    // loadDataAndSetState. Then do the API call afterwards.

    let stateCopy = { ...this.state };
    const comment = {
      comment: escape(stateCopy.form.comment),
      createdUserKey: this.props.user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      queried: stateCopy.booking.queried === 'queried' ? 'queried' : undefined
    };

    // if (this.state.booking.assignedUserKey) {
    //   this.notify(`${this.props.user.firstName} ${this.props.user.lastName } made the following comment: ${stateCopy.form.comment}.`);
    // }

    // clear the comment so it doesn't wait for the api call...
    stateCopy.form.comment = null;
    stateCopy.pendingComment = true;

    // add this latest comment to the comment list so it appears right
    // away.
    stateCopy.comments.push({ 
      ...comment, 
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      created: null 
    });

    this.setState(stateCopy);

    try {
      await API.post(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/comments`,
        {
          body: comment
        }
      );
    } catch (err) {
      console.log('There was an error trying to save a comment: ', err);
      message.error('There was a problem adding that comment.');
      this.loadDataAndSetState();
      return;
    }

    await this.saveAudit({
      createdUserKey: this.props.user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      status: stateCopy.currentStatus,
      description: `A comment was made by ${this.props.user.firstName} ${
        this.props.user.lastName
      } on this booking.`
    });

    this.loadDataAndSetState();
  };

  updateBookingBrief = async() => {
    let stateCopy = { ...this.state };
    const { user } = this.props;
    const bookingBody = {
      bookingName: escape(stateCopy.bookingNameCopy),
      dueDate: stateCopy.dueDateCopy,
      jsonForm: jsonFormSanitiser(stateCopy.jsonFormCopy),
    }
    let auditBody = {
      createdUserKey: user.userKey,
      status: stateCopy.currentStatus,
      description: `${user.firstName} ${user.lastName} updated the content of this booking.` 
    };
    let result;
    try {
      result = await API.put('biggly', `/bookingpublic/key/${this.props.user.apiKey}/bookings/${stateCopy.booking.bookingsKey}/audit/notify`, {
        body: { bookingBody, auditBody } 
      })
    } catch (err) {
      message.error('There was an error trying to save your updates please try again.');
      console.log('There was an error with the booking endpoint: ', err);
    }
    if(result) {
      message.success('Saved!');
    }

    this.loadDataAndSetState();
  }

  saveBookingStatus = async stateCopy => {
    const { user } = this.props;
    let error;

    let body = {};

    if(stateCopy.currentStatus === 'Complete') {
      body.completedDate = moment().toDate();
    }

    body.currentStatus = stateCopy.currentStatus;
    body.jsonStatus = jsonFormSanitiser(stateCopy.jsonStatus);

    try {
      await API.put(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${this.props.match.params.bookingsKey}`, 
        {
          body 
        }
      );
    } catch (err) {
      alert(err);
      error = err;
    }

    if (error) {
      message.error('Booking didn\'t update, please try again.');
    } else {
      let auditBody = {
        createdUserKey: user.userKey,
        bookingsKey: this.props.match.params.bookingsKey,
        status: stateCopy.currentStatus,
        description: `This booking was changed to ${
          stateCopy.currentStatus
        } by ${user.firstName} ${user.lastName}.`
      };

      // If this user is an Admin but not assignee or creator of this
      // booking we want to notify both.
      // let recipient;
      // let userType;

      // if(user.accessLevel === 'Admin') {
      //   userType = 'Admin'
      // }

      // if(user.userKey === assignedUserKey && user.accessLevel === 'Admin') {
      //   userType = 'Assignee Admin';
      // } else if(user.userKey === createdUserKey && user.accessLevel === 'Admin') {
      //   userType = 'Creator Admin';
      // } else if(user.userKey === assignedUserKey && user.accessLevel !== 'Admin') {
      //   userType = 'Assignee';
      // } else if(user.userKey === createdUserKey && user.accessLevel !== 'Admin') {
      //   userType = 'Creator';
      // }
      
      // if(userType === 'Admin' || userType === 'Creator' || userType === 'Creator Admin') {
      //   if(assignedUserKey) {
      //     console.log('Send to assigned...');
      //     recipient = {
      //       firstName: this.state.booking.assignedFirstName,
      //       lastName: this.state.booking.assignedLastName,
      //       emailAddress: this.state.booking.assignedEmailAddress
      //     };
      //     await this.notifyOfStatus({
      //       description: `${user.firstName} ${user.lastName} progressed the following booking to ${stateCopy.currentStatus}: ${unescape(stateCopy.booking.bookingName)}`,
      //       recipient: recipient,
      //       emailSubject: 'Booking Progress'
      //     });
      //   }
      // }
      // if(userType === 'Admin' || userType === 'Assignee' || userType === 'Assignee Admin') {
      //   console.log('send to creator...');
      //   recipient = {
      //     firstName: this.state.booking.createdByFirstName,
      //     lastName: this.state.booking.createdByLastName,
      //     emailAddress: this.state.booking.createdByEmailAddress
      //   };
      //   await this.notifyOfStatus({
      //     description: `${user.firstName} ${user.lastName} progressed the following booking to ${stateCopy.currentStatus}: ${unescape(stateCopy.booking.bookingName)}`,
      //     recipient: recipient,
      //     emailSubject: 'Booking Progress'
      //   });
      // }

      await this.saveAudit(auditBody);
    }

    this.loadDataAndSetState();
  };

  // █░░█ ▀▀█▀▀ ░▀░ █░░ ░▀░ ▀▀█▀▀ ░▀░ █▀▀ █▀▀
  // █░░█ ░░█░░ ▀█▀ █░░ ▀█▀ ░░█░░ ▀█▀ █▀▀ ▀▀█
  // ░▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀

  sliceBasePath = path => {
    let index = 0;
    let count = 0;
    for(let value of path) {
      if(value === '/') count++;
      if(count === 3) break;
      index++;
    }
    return path.slice(0, index);
  }

  proceedJsonStatus = jsonStatus => {
    const { statusIndex } = this.state;
    return jsonStatus.map((item, index) => (
      index === statusIndex ? 
      { selected: false, value: item.value, role: item.role }
      : 
      index === statusIndex + 1 ? 
      { selected: true, value: item.value, role: item.role }
      : 
      item
    ));
  };

  formatDuplicateBookingName = (oldName) => {
    oldName = unescape(oldName);
    const regex = /\d+$/;
    if(oldName.search(regex) < 0) {
      return escape(oldName + ' 2');
    }
    return escape(oldName.replace(/\d+$/, n => ++n));
  }

  newJsonStatus = async() => {
    const { user } = this.props;
    const { booking } = this.state;
    let template;
    try {
      template = await API.get('biggly', `/bookingadmin/key/${user.apiKey}/templates/${booking.tmpKey}`);
    } catch (err) {
      console.log('There was an error with the template endpoint.', err);
    }
    if((template || {}).affectedRows === 1) {
      return undefined;
    }
    let jsonStatus = template.jsonStatus;
    jsonStatus.forEach( item => {
      if(item.value === 'Draft') item.selected = true;
    })
    return JSON.stringify(jsonStatus);
  }

  findRecipient = () => {
    let { booking } = this.state;
    let { user } = this.props;
    let result = null;
    if (user.userKey === booking.assignedUserKey) {
      console.log('user is assigned', booking);
      result = {
        firstName: booking.createdByFirstName,
        lastName: booking.createdByLastName,
        userKey: booking.createdUserKey,
        emailAddress: booking.createdByEmailAddress
      };
    }
    if (user.userKey === booking.createdUserKey) {
      console.log('user is creator', booking);
      result = {
        firstName: booking.assignedFirstName,
        lastName: booking.assignedLastName,
        userKey: booking.assignedUserKey,
        emailAddress: booking.assignedEmailAddress
      };
    }
    for (let i in result) {
      if(!result[i]) { result = null; break; }
    }
    return result;
  };

// █▀▀▄ █▀▀█ ░▀░ █▀▀ █▀▀   █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
// █▀▀▄ █▄▄▀ ▀█▀ █▀▀ █▀▀   █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
// ▀▀▀░ ▀░▀▀ ▀▀▀ ▀▀▀ ▀░░   ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀ 

  changeMulti = (field, fieldIndex) => {
    let stateCopy = { ...this.state };
    stateCopy.briefChanged = true;
    stateCopy.jsonFormCopy[fieldIndex] = field;
    this.setState(stateCopy);
  }

  setTextareaHeight = async() => {
    let elements = await document.getElementsByClassName('formjson-textarea');
    for(let i = 0; i < elements.length; i++) {
      elements[i].rows = (elements[i].innerHTML.match(/[\n\r]/g) || []).length + 1;
    }
    // The await above is waiting for setState to complete so we need to
    // call it again to update the element.
    this.setState();
  }

  handleActivateEditMode = () => {
    let stateCopy = { ...this.state };
    if(stateCopy.editMode) return;
    stateCopy.jsonFormCopy = JSON.parse(JSON.stringify(stateCopy.jsonForm));
    stateCopy.bookingNameCopy = unescape(stateCopy.booking.bookingName);
    stateCopy.dueDateCopy = JSON.parse(JSON.stringify(stateCopy.booking.dueDate));
    stateCopy.editMode = true;
    this.setState(stateCopy);
  }

  handleDuplicateBooking = async() => {
    const hideLoader = message.loading('Copying the booking...', 0);
    const { booking } = this.state;
    const { user } = this.props;
    const bookingBody = {
      customerKey: booking.customerKey,
      createdUserKey: this.props.user.userKey,
      bookingName: this.formatDuplicateBookingName(booking.bookingName),
      dueDate: booking.dueDate,
      bookingDivKey: booking.bookingDivKey,
      jsonStatus: await this.newJsonStatus(),
      tmpKey: booking.tmpKey,
      colorLabel: booking.colorLabel,
      partnerKey: booking.partnerKey,
      jsonForm: booking.jsonForm,
    };
    const auditBody = {
      createdUserKey: user.userKey,
      status: 'Draft',
      description: `This booking was duplicated from ${unescape(booking.bookingName)} by ${user.firstName} ${user.lastName}.`
    }
    let result;
    try {
      result = await API.put('biggly', `/bookingpublic/key/${this.props.user.apiKey}/bookings/${booking.bookingsKey}/audit/notify`, {
        body: {
          bookingBody,
          auditBody
        }
      });
    } catch (err) {
      console.log('There was a problem with the booking endpoint: ', err);
    }
    if(result) {
      const path = this.props.location.pathname.slice(0, this.props.location.pathname.lastIndexOf('/')) + '/' + result.key;
      setTimeout(async() => {
        hideLoader();
        this.props.history.push(path);
        await this.loadDataAndSetState();
        setTimeout(message.success('Booking loaded.', 2), 2000);
      }, 2000)
    } else {
      message.error('There was an error copying this booking. Please try again.');
      this.loadDataAndSetState();
    }
  }

  handleBriefOptions = (options, optionIndex, jsonIndex) => {
    let stateCopy = { ...this.state };

    stateCopy.briefChanged = true;
    stateCopy.jsonFormCopy[jsonIndex].value = options.split(', ')[optionIndex];
    this.setState(stateCopy);
  }

  handleBookingName =(key, value) => {
    let stateCopy = { ...this.state };
    if(!stateCopy.editMode) return;
    stateCopy.briefChanged = true;
    stateCopy[key] = value;
    this.setState(stateCopy);
  }

  handleBriefChange = (value, index) => {
    let stateCopy = { ...this.state };
    if(!stateCopy.editMode) return;
    stateCopy.briefChanged = true;
    stateCopy.jsonFormCopy[index].value = value;
    this.setState(stateCopy);
  }

  handleSaveBrief = () => {
    this.setState({ saving: true });
    this.updateBookingBrief();
  }

  handleCancelUpdate = () => {
    let stateCopy = { ...this.state };
    stateCopy.briefChanged = false;
    stateCopy.editMode = false;
    this.setState(stateCopy);
  }

  handleDeleteBooking = () => {
    console.log('deleting booking...');
    message.loading('Deleting current booking...', 0);
    this.deleteBookingAndReferences()
  }

  flattenArr = (arr) => {
    return arr.reduce((flat, toFlatten) => {
      return this.flattenArr(flat).concat(toFlatten instanceof Array ? this.flattenArr(toFlatten) : toFlatten);
    }, []);
  }

  handleValidation = () => {
    const jsonForm = this.state.jsonForm.filter( item => (
      item.required === true && item.type !== 'multi'
    ));
    let multis = this.state.jsonForm.filter( item => (
      item.required === true && item.type === 'multi'
    ));
    multis = multis.reduce( (arr, input) => {
      return this.flattenArr(arr).concat(this.flattenArr(input.children));
    }, []);
    const result = [
      ...jsonForm,
      ...multis,
      { value: this.state.formFields.bookingName },
      { value: this.state.formFields.dueDate },
      { value: this.state.formFields.customerKey },
      // This last option makes the button disable after clicking save
      { value: this.state.buttonDisabled }
    ];
    return result;
  }

  validateForm = () => {
    const { briefChanged, jsonFormCopy, bookingNameCopy, dueDateCopy } = this.state;
    if(!briefChanged) return false;
    let valid = true;
    let jsonForm = jsonFormCopy.filter( item => (
      item.required === true && item.type !== 'multi'
    ));
    let multis = jsonFormCopy.filter( item => (
      item.required === true && item.type === 'multi'
    ));
    jsonForm = multis.reduce( (arr, input) => {
      return this.flattenArr(arr).concat(this.flattenArr(input.children));
    }, jsonForm);
    if(jsonForm.find( item => (
      (typeof item.value === 'string' && item.value.length < 1)
      ||
      (typeof item.value === 'object' && item.value === null)
    ))) {
      valid = false;
    }
    if(bookingNameCopy.length < 1 || dueDateCopy.length < 1) valid = false;
    return valid;
  }

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █░░█ █▀▀   █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █░░█ ▀▀█   █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ░▀▀▀ ▀▀▀   ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleAssignToSelf = async () => {
    if (this.state.statusIndex === this.state.jsonStatus.length - 1) return;
    this.setState({ pendingStatus: true, statusOptionVisible: false, pendingAssignUser: true });

    if(this.state.currentStatus === 'Live' && this.state.booking.groupKey) {
      this.assignGroupToSelf();
      return;
    }

    let stateCopy = { ...this.state };
    let { user } = this.props;
    const jsonStatus = this.proceedJsonStatus(stateCopy.jsonStatus);

    const body = {
      assignedPartnerKey: user.partnerKey,
      assignedUserKey: user.userKey,
      jsonStatus: jsonFormSanitiser(jsonStatus),
      currentStatus: jsonStatus.filter( item => item.selected )[0].value
    }

    try {
      await API.put(
        'biggly',
        `/bookingpublic/key/${this.props.user.apiKey}/bookings/${
          this.props.match.params.bookingsKey
        }`,
        { body }
      );
    } catch (err) {
      console.log(err);
    }

    let auditBody = {
      createdUserKey: user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      status: jsonStatus.filter( item => item.selected )[0].value,
      description: `${user.firstName} ${
        user.lastName
      } self assigned this booking.`
    };

    await this.saveAudit(auditBody);

    this.loadDataAndSetState(stateCopy);
  };

  assignGroupToSelf = async() => {
    console.log('calling assign to self');
    let stateCopy = { ...this.state };
    const { user } = this.props;

    const jsonStatus = this.proceedJsonStatus(stateCopy.jsonStatus);

    const bookingBody = {
      assignedPartnerKey: user.partnerKey,
      assignedUserKey: user.userKey,
      jsonStatus: JSON.stringify(jsonStatus),
      currentStatus: jsonStatus.filter( item => item.selected )[0].value
    };

    let auditBody = {
      createdUserKey: user.userKey,
      status: jsonStatus.filter( item => item.selected )[0].value,
      description: `${user.firstName} ${
        user.lastName
      } self assigned this booking and all bookings in this group.`
    };

    try {
      await API.put('biggly', `/bookingpublic/key/${this.props.user.apiKey}/bookings/group/${stateCopy.booking.groupKey}`, {
        body: {
          auditBody,
          bookingBody
        }
      });
    } catch (err) {
      console.log('There was an error trying to update the group of bookings', err);
      message.error('There was an error trying to assign you to this group of bookings. Please try again');
      return;
    }

    this.loadDataAndSetState();
  }

  handleStatus = async () => {
    if(this.state.booking.queried === 'queried') {
      message.error('Bookings cannot proceed when in Query Mode');
      return;
    }
    let stateCopy = { ...this.state };
    this.setState({ pendingStatus: true, statusOptionVisible: false });

    let statusIndex = stateCopy.statusIndex;
    if (statusIndex === stateCopy.jsonStatus.length - 1) return;
    stateCopy.jsonStatus = stateCopy.jsonStatus.map((item, index) =>
      index === statusIndex
        ? { selected: false, value: item.value, role: item.role }
        : index === statusIndex + 1
        ? { selected: true, value: item.value, role: item.role }
        : item
    );

    stateCopy.currentStatus = stateCopy.jsonStatus[statusIndex + 1].value;
    // stateCopy.booking.currentStatus = stateCopy.currentStatus;

    this.saveBookingStatus(stateCopy);
  };

  statusOptionVisibleChange = statusOptionVisible => {
    if (this.state.currentStatus === 'Complete') return;
    this.setState({ statusOptionVisible });
  };

  queryOptionVisibleChange = queryOptionVisable => {
    if (this.state.currentStatus === 'Complete') return;
    this.setState({ queryOptionVisable });
  };

  // █▀▀ █▀▀█ █▀▄▀█ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // █░░ █░░█ █░▀░█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ▀▀▀▀ ▀░░░▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  handleQueriedComment = e => {
    let stateCopy = { ...this.state };
    stateCopy.queryComment = e.target.value;
    this.setState(stateCopy);
  }

  handleComment = e => {
    let stateCopy = { ...this.state };
    stateCopy.form.comment = e.target.value;
    this.setState(stateCopy);
  };

  handleSubmitComment = async e => {
    if (this.state.form.comment < 1) return;
    if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {
      // const { booking } = this.state;
      // const { user } = this.props;

      // if (
      //   user.userKey !== booking.createdUserKey &&
      //   user.userKey !== booking.assignedUserKey
      // ) {
      //   message.error(
      //     'Only users associated with this booking can make comments'
      //   );
      //   return;
      // }

      this.createComment();
    }
  };

  // █░░█ █▀▀█ █░░ █▀▀█ █▀▀█ █▀▀▄ █▀▀
  // █░░█ █░░█ █░░ █░░█ █▄▄█ █░░█ ▀▀█
  // ░▀▀▀ █▀▀▀ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀

  chooseFile = e => {
    if (e.target.files.length < 1) return;

    let stateCopy = { ...this.state };
    stateCopy.uploadReady = true;

    if (e.target.files[0].size > 50000000) {
      message.error(
        'The file was too large. Please select a file which is 5MB or less.'
      );
      this.loadDataAndSetState();
      return;
    }

    stateCopy.file = e.target.files[0];

    stateCopy.upload = {
      fileName: escape(e.target.files[0].name),
      uploadedUserKey: this.props.user.userKey,
      bookingsKey: this.props.match.params.bookingsKey
    };
    this.setState(stateCopy);
  };

  uploadFile = () => {
    let stateCopy = { ...this.state };
    stateCopy.uploading = true;
    this.setState(stateCopy);
    this.saveUpload();
  };

  cancelUpload = e => {
    let stateCopy = { ...this.state };
    stateCopy.uploadReady = false;
    stateCopy.upload = null;

    // Return Null for the value of the upload - KR
    e.target.value = null;

    message.success('Selected item removed.');
    this.setState(stateCopy);
  };

  clickHiddenUploadForm = () => {
    document.getElementById('hiddenUploadForm').click();
  };

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderAssignToMe = () => {
    return (
      <Popover
        content={
          <div>
            <div>
              This action cannot be reversed.
              <br />
              Are you sure?
            </div>
            <br />
            <div style={{ textAlign: 'right' }}>
              <Button 
                onClick={this.handleAssignToSelf}
                type="primary"
              >Yes</Button>
            </div>
          </div>
        }
        trigger="click"
        visible={this.state.statusOptionVisible}
        onVisibleChange={this.statusOptionVisibleChange}
      >
        <Button loading={this.state.pendingStatus}>Assign to myself</Button>
      </Popover>
    )
  }

  generateNotifyBody = description => {
    const { user } = this.props;
    const { assignedUserKey, createdUserKey } = this.state.booking;
    const { booking } = this.state;

    let recipientUserKey;
    let parameters = {
      bookingName: booking.bookingName,
      bookingUrl: this.props.match.params.url,
      description: description
    }

    if(user.userKey === assignedUserKey){
      recipientUserKey = createdUserKey;
      parameters.userFirstName = booking.createdByFirstName;
      parameters.userLastName = booking.createdByLastName;
    }
    if(user.userKey === createdUserKey) {
      recipientUserKey = assignedUserKey;
      parameters.userFirstName = booking.assignedFirstName;
      parameters.userLastName = booking.assignedLastName;
    }
    if(!recipientUserKey) {
      message.error('Wasn\'t able to find a recipient for notify, be aware that no emails will be send for this action');
      console.log('No notification was sent for this action because you are not associated with this booking.');
      return null;
    }

    return { recipientUserKey, parameters };
  }

  handleQueryMode = async queried => {
    const { user } = this.props;
    const { currentStatus, booking } = this.state;

    if(!this.state.queryComment) {
      message.error('You must enter a comment to move to Query Mode');
      return;
    }

    let result = await this.saveComment({
      createdUserKey: this.props.user.userKey,
      bookingsKey: this.props.match.params.bookingsKey,
      queried: 'queried',
      comment: escape(this.state.queryComment)
    });

    if(!result) return;

    const bookingBody = {
      queried: queried ? 'queried' : 'wasqueried' 
    };

    let description;
    if(queried) {
      description = `${user.firstName} ${user.lastName} moved this booking into Query Mode.`
    } else {
      description = `${user.firstName} ${user.lastName} moved this booking out of Query Mode.`
    }

    const auditBody = { 
      createdUserKey: user.userKey,
      status: currentStatus,
      description: description
    };

    const notifyBody = this.generateNotifyBody(description);

    try {
      result = await API.put('biggly', `/bookingpublic/key/${this.props.user.apiKey}/bookings/${booking.bookingsKey}/audit/notify`, {
        body: {
          bookingBody,
          auditBody,
          notifyBody
        }
      });
    } catch (err) {
      console.log('There was an error updating the booking: ', err);
      message.error('You\'re booking didn\'t update properly, please try again.');
    }
    
    this.loadDataAndSetState();
  }

  renderQueriedButton = () => {
    const { booking } = this.state;
    const { user } = this.props;
    if(booking.currentStatus === 'Complete') return;
    return (
      booking.queried !== 'queried' && 
      user.userKey === booking.assignedUserKey ?
      <Popover
        placement="bottomRight"
        style={{
          position: 'absolute',
          right: 10,
          top: 7,
        }}
        content={
          <div>
            Enter your query for this booking:
            <Input 
              onKeyUp={e => {
                if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {
                  this.handleQueryMode(true)
                }
              }}
              onChange={this.handleQueriedComment}
              value={this.state.queryComment} />
            <div style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 0 }}
                loading={this.state.pendingComment}
                disabled={!this.state.queryComment}
                type="primary"
                onClick={() => this.handleQueryMode(true)}
              >Enter Query Mode</Button>
            </div>
          </div>
        }
        overlayStyle={{ width: '500px' }}
        trigger="click"
        visible={this.state.queryOptionVisable}
        onVisibleChange={this.queryOptionVisibleChange}
      >
        <Button 
          style={{
            position: 'absolute',
            right: 7,
            top: 7
          }}
          type="primary"
        >
          Query
        </Button>
      </Popover>
      :
      booking.queried === 'queried' && user.userKey === booking.createdUserKey &&
      <Popover
        placement="bottomRight"
        style={{
          position: 'absolute',
          right: 10,
          top: 7,
        }}
        content={
          <div>
            Add a response to this query:
            <Input 
              onKeyUp={e => {
                if (e.keyCode === 13 || e.which === 13 || e.keyCode === undefined) {
                  this.handleQueryMode()
                }
              }}
              onChange={this.handleQueriedComment}
              value={this.state.queryComment} />
            <div style={{ textAlign: 'right' }}>
              <Button
                style={{ marginRight: 0 }}
                loading={this.state.pendingComment}
                disabled={!this.state.queryComment}
                type="primary"
                onClick={() => this.handleQueryMode()}
              >Restore to {this.state.currentStatus}</Button>
            </div>
          </div>
        }
        overlayStyle={{ width: '500px' }}
            //style={{ width: '100%', position: 'relative' }}
        trigger="click"
        visible={this.state.queryOptionVisable}
        onVisibleChange={this.queryOptionVisibleChange}
      >
        <Button 
          style={{
            position: 'absolute',
            right: 7,
            top: 7
          }}
          type="primary"
        >
          Exit Query Mode
        </Button>
      </Popover>
    )
  }

  renderProceedButton = (role) => {
    const { currentStatus, pendingStatus, jsonStatus, statusIndex } = this.state;
    if(currentStatus === 'Complete') return;
    const statusObj = jsonStatus[statusIndex];
    if(statusObj.role === 'Anyone') {
      return this.renderAssignToMe();
    }
    const button = (
      <Popover
        content={
          <div>
            <div>
              Progress cannot be reversed.
              <br />
              Are you sure?
            </div>
            <br />
            <div style={{ textAlign: 'right' }}>
              <Button 
                onClick={this.handleStatus}
                type="primary"
              >Yes</Button>
            </div>
          </div>
        }
        trigger="click"
        visible={this.state.statusOptionVisible}
        onVisibleChange={this.statusOptionVisibleChange}
      >
        <Button type="primary" loading={pendingStatus}>
          {jsonStatus.length > 0 &&
            jsonStatus.length > statusIndex + 1 &&
            'Proceed status to ' + jsonStatus[statusIndex + 1].value}
        </Button>
      </Popover>
    )
    if(role === 'Admin') {
      return button;
    }
    if(statusObj.role === role) {
      return button;
    }
  }

  renderCommentsHistory = () => {
    let comments = [...this.state.comments];
    const queriedIndicatorStyles = {
      position: 'absolute',
      borderRadius: '5px',
      backgroundColor: '#0dc48a',
      right: 0,
      top: 3,
      color: 'white',
      padding: '0 7px'
    }
    return (
      comments.length > 0 &&
      comments.reverse().map(record => (
        <div key={key++} style={{ position: 'relative' }} >
          {
            record.queried === 'queried' &&
            <div style={queriedIndicatorStyles}
            >Query</div>
          }
          <span style={{ fontSize: '1rem' }}>
            <Icon type="align-left" />{' '}
            <b>
              {record.firstName} {record.lastName}
            </b>
          </span>
          <p style={{ padding: '1rem 1.5rem' }}>{unescape(record.comment)}</p>
          <div style={{ textAlign: 'right' }}>
              {
                record.created ?
                moment(record.created).format('lll')
                :
                <Icon type="loading" />
              }
          </div>
          <hr />
        </div>
      ))
    );
  }

  renderUneditableBrief = (jsonForm) => {
    const uneditableTextareaStyles = {
      // background: '#ffffff',
      background: 'transparent',
      border: 'none',
      width: '100%',
      overflow: 'hidden',
      resize: 'none'
    }
    return (
      jsonForm.length > 0 ? 
      jsonForm.map(( item, index ) => (
        item.value || item.children ?
        item.type === 'date' ? 
        <Col key={key++} span={24}>
          <p>
            <b>{item.label}</b>
          </p>
          <p>{moment(item.value).format('DD/MM/YYYY')}</p>
        </Col>
        : 
        item.type === 'textarea' ? 
        <Col key={key++} span={24}>
          <b>{item.label}</b>
          <textarea className="formjson-textarea" span={24} disabled style={uneditableTextareaStyles} value={item.value} />
        </Col>
        : 
        item.type === 'dropdown' ? 
        <Col key={key++} span={24}>
          <p>
            <b>{item.label}</b>
          </p>
          <p span={24}>{item.value}</p>
        </Col>
        :
        item.type === 'multi' ? 
        item.children.map( (child, childIndex) => (
          (child[0].value || '').length > 0 && (child[1].value || '').length > 0 &&
          <div key={childIndex} id="multi-wrapper"> 
            <p>
              <b>{child[0].label}</b>
            </p>
            <p>{child[0].value}</p>
            <p>
              <b>{child[1].label}</b>
            </p>
            <textarea span={24} className="formjson-textarea" disabled style={uneditableTextareaStyles} value={child[1].value} />
          </div>
        ))
        :
        <Col key={key++} span={24}>
          <b>{item.label}</b>
          <p>{item.value}</p>
        </Col>
        :
        null
      ))
      :
      <Skeleton active paragraph={{ rows: 4 }} />
    )
  }

  renderIfRequired = (item) => (
    item.required &&
    <span
    style={{
      position: 'absolute',
      right: '0px',
      bottom: '-22px',
      color: '#40a9ff'
    }}
    >required</span>
  )

  renderEditableBrief = (jsonFormCopy) => {
    const { jsonForm } = this.state;
    const colStyles = {
      marginBottom: '16px'
    }
    const inputWrapperStyles = {
      position: 'relative'
    }
    const { editMode } = this.state;
    const editableTextareaStyles = {
      background: '#ffffff',
      width: '100%',
    }
    return (
      editMode ?
      jsonFormCopy.map((item, index) => (
        item.type === 'date' ? 
        <Col style={colStyles} key={index} span={24}>
          <h5>{item.label}</h5>
          <div style={inputWrapperStyles}>
            <DatePicker allowClear={false} value={moment(item.value)} onChange={value => this.handleBriefChange(value, index)} />
            {this.renderIfRequired(item)}
          </div>
        </Col>
        : 
        item.type === 'textarea' ? 
        <Col style={colStyles} key={index} span={24}>
          <h5>{item.label}</h5>
          <div style={inputWrapperStyles}>
            <Input.TextArea style={editableTextareaStyles} className="formjson-textarea" value={item.value} onChange={e => this.handleBriefChange(e.target.value, index)} />
            {this.renderIfRequired(item)}
          </div>
        </Col>
        : 
        item.type === 'dropdown' ? 
        <Col style={colStyles} key={index} span={24}>
          <h5>{item.label}</h5>
          <div style={inputWrapperStyles}>
            <Select 
              style={{
                width: '180px'
              }}
              onSelect={optionIndex => {
                this.handleBriefOptions(item.selections, optionIndex, index)
              }}
              defaultActiveFirstOption={ false }
              value={ item.value }
              label={ item.label }
              className={'bms-select'}>
              {
                item.selections &&
                item.selections.split(',').map( (option, index) => (
                  <Option key={index}>
                      {option.trim()}
                  </Option>
                ))
              }
            </Select>
            {this.renderIfRequired(item)}
          </div>
        </Col>
        : 
        item.type === 'number' ?
        <Col style={colStyles} key={index} span={24}>
          <h5>{item.label}</h5>
          <InputNumber min={0} value={item.value} onChange={value => this.handleBriefChange(value, index)} />
          {this.renderIfRequired(item)}
        </Col>
        :
        item.type === 'multi' ?
        <div key={index} id="multi-wrapper">
          {
            item.children.map( (child, childIndex) => (
              <div key={childIndex}>
                <Form.Item key={childIndex + 'child0'} label={child[0].label}>
                  <Input
                    onChange={e => {
                      if(typeof e.target.value === 'string') {
                        e.target.value = e.target.value.replace(/\\/g, '');
                        e.target.value = e.target.value.replace(/\t/g, '  ');
                        e.target.value = e.target.value.replace(/"/g, '\'');
                      }
                      item.children[childIndex][0].value = e.target.value;
                      this.changeMulti(item, index);
                    }}
                    value={child[0].value}/>
                </Form.Item>
                <Form.Item key={childIndex + 'child1'} label={child[1].label}>
                  <Input.TextArea
                    className="formjson-textarea" 
                    onChange={e => {
                      if(typeof e.target.value === 'string') {
                        e.target.value = e.target.value.replace(/\\/g, '');
                        e.target.value = e.target.value.replace(/\t/g, '  ');
                        e.target.value = e.target.value.replace(/"/g, '\'');
                      }
                      item.children[childIndex][1].value = e.target.value;
                      this.changeMulti(item, index);
                    }}
                    value={child[1].value} />
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                  { 
                    item.children.length === 1 ?
                    <Icon
                      style={{
                        fontSize: '1.5rem',
                        background: 'white',
                        borderRadius: '50%',
                      }}
                      type="plus-circle"
                      onClick={() => { 
                        let template = []; 
                        item.template.forEach( (item, index) => {
                          template[index] = { ...item };
                        });
                        item.children.push(template);
                        this.changeMulti(item, index);
                      }}
                    /> 
                    :
                    childIndex === item.children.length - 1 ?
                    <div>
                      <Icon
                        style={{
                          fontSize: '1.5rem',
                          background: 'white',
                          borderRadius: '50%',
                          marginRight: '4px'
                        }}
                        type="plus-circle"
                        onClick={() => { 
                          let template = []; 
                          item.template.forEach( (item, index) => {
                            template[index] = { ...item };
                          });
                          item.children.push(template);
                          this.changeMulti(item, index);
                        }}
                      /> 
                      <Icon
                        style={{
                          fontSize: '1.5rem',
                          background: 'white',
                          borderRadius: '50%',
                          marginLeft: '4px'
                        }}
                        type="minus-circle"
                        onClick={() => {
                          item.children.splice(childIndex, 1);
                          this.changeMulti(item, index);
                        }}
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
                      onClick={() => {
                        item.children.splice(childIndex, 1);
                        this.changeMulti(item, index);
                      }}
                    /> 
                  }
                </div>
              </div>
            ))
          }
        </div>
        :
        item.type === 'input' &&
        <Col style={colStyles} key={index} span={24}>
          <h5>{item.label}</h5>
          <Input value={item.value} onChange={e => this.handleBriefChange(e.target.value, index)} />
          {this.renderIfRequired(item)}
        </Col>
      ))
      :
      (jsonForm || []).length > 0 &&
      this.renderUneditableBrief(jsonForm)
    )
  }

  renderBookingBrief = () => {
    const { booking, jsonForm, editMode } = this.state;
    const iconStyles = {
      color: '#8e8f91',
      marginLeft: '16px',
      fontSize: '20px'
    }
    const bookingColor = booking.colorLabel
      ? color('template', 'colorLabel', booking.colorLabel).color
      : null;
    return (
      <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Booking Brief</div>
          <div>
              {/*
                this.props.user.accessLevel === 'Admin' ?
                  <Tooltip title="Duplicate this Booking">
                    <Icon style={iconStyles} type="copy" onClick={this.handleDuplicateBooking} />
                    </Tooltip>
                      :
                      this.props.user.accessLevel === 'Provider' &&
                      this.state.booking.createdUserKey === this.props.user.userKey ?
                        <Tooltip title="Duplicate this Booking">
                          <Icon style={iconStyles} type="copy" onClick={this.handleDuplicateBooking} />
                          </Tooltip>
                            :
                            null
              */}
              {
                // Let the user edit the booking if...
                //
                // This user is an Admin
                this.props.user.accessLevel === 'Admin' ?
                <Tooltip title="Edit this Booking">
                  <Icon style={iconStyles} type="edit" onClick={this.handleActivateEditMode} />
                </Tooltip>
                :
                // This user is a Provider and creator of this booking and
                // the current status is Draft
                this.props.user.accessLevel !== 'Admin' &&
                this.props.user.accessLevel === 'Provider' &&
                this.state.booking.createdUserKey === this.props.user.userKey &&
                this.state.currentStatus === 'Draft' ?
                <Tooltip title="Edit this Booking">
                  <Icon style={iconStyles} type="edit" onClick={this.handleActivateEditMode} />
                </Tooltip>
                :
                // This user is the creator of the booking and the
                // booking is being queried
                this.props.user.accessLevel !== 'Admin' &&
                this.state.currentStatus !== 'Draft' && 
                this.state.booking.queried === 'queried' &&
                this.props.user.userKey === this.state.booking.createdUserKey &&
                <Tooltip title="Edit this Booking">
                  <Icon style={iconStyles} type="edit" onClick={this.handleActivateEditMode} />
                </Tooltip>
              }
          </div>
        </div>
      }>
        <Row
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              width: '17px',
              height: '17px',
              borderRadius: '50%',
              marginRight: '10px',
              backgroundColor: bookingColor
            }}
          />
          <h5 style={{ marginBottom: 0 }}>{booking.tmpName}</h5>
        </Row>
        <Row>
          {
            this.state.editMode &&
              <div>
                <h5>Booking Name</h5>
                <Input
                  value={this.state.bookingNameCopy} 
                  style={{ marginBottom: '16px' }}
                  onChange={e => this.handleBookingName('bookingNameCopy', e.target.value)} 
                />

                <h5>Due Date</h5>
                  <DatePicker
                    allowClear={false}
                    value={moment(this.state.dueDateCopy)}
                    style={{ marginBottom: '16px' }}
                    onChange={value => this.handleBookingName('dueDateCopy', value)} 
                  />
              </div>
          }
          {
            (jsonForm || '').length > 0 ? 
              <div>
                <Row>
                  {
                    this.props.user.accessLevel === 'Admin' ?
                      this.renderEditableBrief(this.state.jsonFormCopy) 
                        :
                          this.props.user.accessLevel === 'Provider' && 
                            this.state.booking.createdUserKey === this.props.user.userKey &&
                              this.state.currentStatus === 'Draft' ?
                                this.renderEditableBrief(this.state.jsonFormCopy) 
                                  :
                                    this.props.user.accessLevel !== 'Admin' &&
                                      this.state.currentStatus !== 'Draft' && 
                                        this.state.booking.queried === 'queried' &&
                                          this.props.user.userKey === this.state.booking.createdUserKey ?
                                            this.renderEditableBrief(this.state.jsonFormCopy) 
                                              :
                                                this.renderUneditableBrief(jsonForm)
                  }
                </Row>
                <Row>
                  {
                    editMode &&
                      <div style={{ display: 'flex', paddingTop: '16px' }}>
                        <div style={{ width: '50%' }}>
                          <Popconfirm
                            title={'Are you sure you want to permanently delete this booking?'}
                            onConfirm={this.handleDeleteBooking}
                            okText="Yes"
                          >
                            <Button
                              type="danger" 
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        </div>
                        <div style={{ width: '50%', textAlign: 'right' }}>
                          <Button 
                            loading={this.state.saving}
                            disabled={!this.validateForm()}
                            onClick={this.handleSaveBrief}
                            type="primary"
                          >Save</Button>
                          <Button
                            onClick={this.handleCancelUpdate}
                          >Cancel</Button>
                        </div>
                      </div>
                  }
                </Row>
              </div>
              :
              <Skeleton active paragraph={{ rows: 4 }} />
          }
            </Row>
          </Card>
    );
  };

  renderAudits = audit => {
    // Match the audit.status with the colors Mixin
    // to render the right styles...
    let iconStyles = colors.status.find(item =>
      item.value === audit.status ? item : item.value === 'Default' && item
    );
    return (
      <Timeline.Item
        key={audit.bookingAuditKey}
        dot={
          <Icon
            type={iconStyles.icon}
            style={{ color: iconStyles.color, fontSize: '1.1rem' }}
          />
        }
      >
        {audit.description}
        <br />
        <Tag style={{ marginRight: 0, cursor: 'auto' }} color="blue">
          {moment(audit.created).format('LLL')}
        </Tag>
      </Timeline.Item>
    );
  };

  renderStatusSteps = (status, index) =>
    this.state.pendingStatus && this.state.statusIndex === index - 1 ? (
      <Step key={key++} title={status.value} icon={<Icon type="loading" />} />
    ) : (
      <Step key={key++} title={status.value} />
    );

  renderCurrentStatus = currentStatus => {
    let iconStyles = colors.status.find(item =>
      item.value === currentStatus ? item : item.value === 'Default' && item
    );
    return (
      <Icon
        key={key++}
        type={iconStyles.icon}
        style={{ color: 'white', fontSize: '5rem' }}
      />
    );
  };

  renderAuditTrailDrawer = () => (
    <div style={{ textAlign: 'right' }}>
      {
        <div style={{ height: 0 }}>
          <Drawer
            width={620}
            placement="right"
            closable={false}
            onClose={() => this.setState({ drawerVisible: false })}
            visible={this.state.drawerVisible}
          >
            <h2>Audit Trail</h2>
            <Timeline mode="alternate">
              {this.state.bookingAudit.length > 0 ? (
                this.state.bookingAudit.map(audit => this.renderAudits(audit))
              ) : (
                <Skeleton active paragraph={{ rows: 4 }} />
              )}
            </Timeline>
          </Drawer>
        </div>
      }
    </div>
  );

  dueDaysBookings = (created, due) => {};

  colorCondition = (duration, colorCardStylesTemplates, colorCardStyles) => {
    const { currentStatus } = this.state;
    let stylesObj = {};
    if(duration <= 2 && currentStatus !== 'Complete') {
      stylesObj = { height: '100%', ...colorCardStylesTemplates('red') };
    } else {
      stylesObj = { height: '100%', ...colorCardStyles('purple') };
    }
    return stylesObj;
  }

  renderColorCards = () => {
    const {
      booking,
      pendingStatus,
      pendingPageLoad,
      pendingAssignUser,
      currentStatus
    } = this.state;

    const colorCardStyles = labelName => ({
      backgroundColor: color('status', 'colorLabel', labelName).color
      // width: '100%',
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'center'
    });

    const colorCardStylesTemplates = labelName => ({
      backgroundColor: color('template', 'colorLabel', labelName).color
      // width: '100%',
      // display: 'flex',
      // justifyContent: 'center',
      // alignItems: 'center'
    });

    const cardBodyStyles = {
      textAlign: 'center',
      height: 'auto',
      position: 'relative'
    };

    const cardTextStyles = {
      marginBottom: '1em',
      color: '#ffffff'
    }

    let dueDate = moment(booking.dueDate);
    let now = moment().startOf('day');
    let dur = moment.duration(dueDate.diff(now));
    let duration = Math.floor(dur.asDays());
    let completedDate = this.state.booking.completedDate;
    let completeDueComparison = Math.floor(moment.duration(dueDate.diff(completedDate)).asDays());

    return (
      <Row type="flex" gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card
            loading={this.state.pendingPageLoad}
            title={
              booking.bookingName &&
              <div style={{ position: 'relative' }}>
                <div>
                  { unescape(booking.bookingName) }
                </div>
                <div style={{ position: 'absolute', right: 0, top: -4 }}>
                  {
                    this.state.pendingPageLoad ? 
                      null 
                      : 
                      duration <= 2 && this.state.currentStatus !== 'Complete' &&
                      <Icon
                        style={{ color: '#ffffff', fontSize: '2em' }}
                        type="warning"
                      />
                  }
                </div>
              </div>
            }
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              color: '#ffffff',
              textAlign: 'center'
            }}
            style={ this.state.pendingPageLoad ? ({background: color('template', 'colorLabel', 'purple').color}) : this.colorCondition(duration, colorCardStylesTemplates, colorCardStyles)}
          >
            <Fragment>
              <Icon
                style={{ fontSize: '5rem', marginBottom: '1rem' }}
                type="clock-circle"
              />

              {/* Output the overdue days amount */}
              { this.state.currentStatus === 'Complete' && completeDueComparison > 0 ? 
              <Typography style={cardTextStyles}>
                This was completed {completeDueComparison} days early
              </Typography> : 
              this.state.currentStatus === 'Complete' && completeDueComparison < 0 ? 
              <Typography style={cardTextStyles}>
              This was completed {completeDueComparison} days late
              </Typography> : 
              duration < 0 ? (
                <Typography style={cardTextStyles}>
                  <strong>Overdue:</strong>&nbsp;By&nbsp;{Math.abs(duration)} days
                </Typography>
              ) : duration === -1 && duration < 0 ? (
                <Typography style={cardTextStyles}>
                  <strong>Due yesterday</strong>
                </Typography>
              ) : duration >= 2 ? (
                <Typography style={{ color: 'white', marginBottom: '0' }}>
                  <strong>Due in:&nbsp;</strong>
                  {Math.round(duration)}&nbsp;days
                </Typography>
              ) : duration === 0 ? (
                <Typography style={{ color: 'white', marginBottom: '0' }}>
                  <strong>Due today</strong>
                </Typography>
              ) : duration >= 1 && duration < 2 ? (
                <Typography style={{ color: 'white', marginBottom: '0' }}>
                  <strong>Due tomorrow</strong>
                </Typography>
              ) : null}
            </Fragment>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            loading={pendingPageLoad}
            title={!pendingPageLoad ? 'Created By' : null}
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              position: pendingPageLoad ? 'relative' : 'absolute',
              bottom: '0',
              top: pendingPageLoad ? '0' : '57px',
              display: pendingPageLoad ? 'block' : 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            style={{ height: '100%', ...colorCardStyles('blue') }}
          >
            <div style={cardBodyStyles}>
              <Avatar
                style={{ marginBottom: '1rem', backgroundColor: '#85C5FF' }}
                size={84}
              >
                {!booking.assignedFirstName && !booking.assignedLastName ? (
                  <Icon style={{ fontSize: '2rem' }} type="user" />
                ) : (
                  <div style={{ fontSize: '2rem', lineHeight: '94px' }}>
                    {(booking.createdByFirstName || '').charAt(0)}
                    {(booking.createdByLastName || '').charAt(0)}
                  </div>
                )}
              </Avatar>
              {!booking.createdByFirstName && !booking.createdByLastName ? (
                <p style={{ color: 'white' }}>
                  {booking.createdByEmailAddress}
                </p>
              ) : (
                <p style={{ color: 'white' }}>
                  {booking.createdByFirstName} {booking.createdByLastName}
                </p>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            loading={pendingPageLoad}
            title={!pendingPageLoad ? 'Assigned To' : null}
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              position: pendingPageLoad ? 'relative' : 'absolute',
              bottom: '0',
              top: pendingPageLoad ? '0' : '57px',
              display: pendingPageLoad ? 'block' : 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            style={
              booking.assignedUserKey && !pendingAssignUser
                ? { height: '100%', ...colorCardStyles('green') }
                : { height: '100%', background: '#cccccc' }
            }
          >
            <div style={cardBodyStyles}>
              {booking.assignedUserKey && !pendingAssignUser ? (
                <Fragment>
                  <Avatar
                    style={{
                      marginBottom: '1rem',
                      backgroundColor: '#6BE4AB'
                    }}
                    size={84}
                  >
                    {!booking.assignedFirstName && !booking.assignedLastName ? (
                      <Icon style={{ fontSize: '2rem' }} type="user" />
                    ) : (
                      <div style={{ fontSize: '2rem', lineHeight: '94px' }}>
                        {booking.assignedFirstName.charAt(0)}
                        {booking.assignedLastName.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  {!booking.assignedFirstName && !booking.assignedLastName ? (
                    <p style={{ color: 'white' }}>
                      {booking.assignedEmailAddress}
                    </p>
                  ) : (
                    <p style={{ color: 'white' }}>
                      {booking.assignedFirstName} {booking.assignedLastName}
                    </p>
                  )}
                </Fragment>
              ) : booking.assignedUserKey && pendingAssignUser ? (
                <Fragment>
                  <Avatar
                    icon="loading"
                    style={{
                      marginBottom: '1rem',
                      backgroundColor: '#6BE4AB'
                    }}
                    size={84}
                  />
                  <p>
                    <Icon style={{ color: 'white' }} type="loading" />
                  </p>
                </Fragment>
              ) : !booking.assignedUserKey && pendingAssignUser ? (
                <Fragment>
                  <Avatar
                    icon="loading"
                    style={{ marginBottom: '1rem' }}
                    size={84}
                  />
                  <p>
                    <Icon style={{ color: 'white' }} type="loading" />
                  </p>
                </Fragment>
              ) : (
                <Fragment>
                  <Avatar
                    style={{ marginBottom: '1rem', backgroundColor: '#ffffff' }}
                    size={84}
                  >
                    <Icon
                      style={{ fontSize: '2rem', color: '#cccccc' }}
                      type="user"
                    />
                  </Avatar>
                  <p style={{ color: 'white' }}>
                    User Unassigned
                  </p>
                </Fragment>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            loading={this.state.pendingPageLoad}
            title={
              !pendingPageLoad ? 
                <div style={{ display: 'flex' }}>
                  <div>
                    Status
                  </div>
                  <div style={{
                    width: '100%', 
                    height: '20px'
                  }}>
                    {
                      this.renderQueriedButton()
                    }
                  </div>
                </div>
                :
                null
            }
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              position: pendingPageLoad ? 'relative' : 'absolute',
              bottom: '0',
              top: pendingPageLoad ? '0' : '57px',
              display: pendingPageLoad ? 'block' : 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            style={{ height: '100%', ...colorCardStyles('lime') }}
          >
            {!pendingPageLoad && !pendingStatus ? (
              <div style={cardBodyStyles}>
                <div style={{ marginBottom: '1rem' }}>
                  {this.renderCurrentStatus(currentStatus)}
                </div>
                <p style={{ color: 'white' }}>{currentStatus}</p>
              </div>
            ) : !pendingPageLoad && pendingStatus ? (
              <div style={cardBodyStyles}>
                {/* <h4 style={{ color: 'white' }}>Status</h4> */}
                <div style={{ marginBottom: '1rem' }}>
                  <Icon
                    type="loading"
                    style={{ color: 'white', fontSize: '5rem' }}
                  />
                </div>
                <p>
                  <Icon style={{ color: 'white' }} type="loading" />
                </p>
              </div>
            ) : (
              <div style={cardBodyStyles} />
            )}
          </Card>
        </Col>
      </Row>
    );
  };

  renderProgress = () => {
    const {
      jsonStatus,
      statusIndex,
      pendingPageLoad,
      booking
    } = this.state;

    const { user } = this.props;

    return (
      <Card
        id={
          booking.queried === 'queried' ?
          'query-mode'
          :
          ''
        }
        querytext="Query Mode"
        style={{
          marginBottom: '16px',
          backgroundColor: '#F0F2F5',
          borderStyle: 'dashed'
        }}
      >
        {jsonStatus.length > 0 ? (
          <div>
            <Steps current={statusIndex} style={{ padding: '2rem' }}>
              {jsonStatus.map((status, index) =>
                this.renderStatusSteps(status, index)
              )}
            </Steps>
          </div>
        ) : (
          <Skeleton active />
        )}
        {!pendingPageLoad && (
          <div style={{ textAlign: 'right' }}>
            { 
              user.userKey === booking.createdUserKey && 
              user.userKey !== booking.assignedUserKey &&
              user.accessLevel !== 'Admin' ?
              this.renderProceedButton('Creator')
              :
              // this allows for if a user is the creator AND the assignee
              user.userKey === booking.assignedUserKey && 
              user.accessLevel !== 'Admin' ?
              this.renderProceedButton('Assignee')
              :
              user.accessLevel === 'Admin' ?
              this.renderProceedButton('Admin')
              :
              this.renderProceedButton('Anyone')
            }
            {
              // user.userKey === booking.createdUserKey ||
              // user.accessLevel === 'Provider'
              // ? 
              // this.renderProceedCreator()
              // : 
              // null
            }
            {
              // user.userKey === booking.assignedUserKey &&
              // this.renderProceedAssignee()
            }
            {
              // user.accessLevel === 'Supplier' && 
              // this.renderProceedSupplier()
            }
            {
              // user.accessLevel === 'Admin' && 
              // this.renderProceedAdmin()
            }
          </div>
        )}
      </Card>
    );
  };

  proceedCondition = () => {
    const { booking, jsonStatus, statusIndex } = this.state;
    const { user } = this.props;
    return jsonStatus[statusIndex].role === 'Creator'
      ? user.userKey === booking.createdUserKey
      : jsonStatus[statusIndex].role === 'Assignee'
      ? user.userKey === booking.assignedUserKey
      : jsonStatus[statusIndex].role === 'Anyone' && true;
  };

  renderComments = () => {
    const { form, pendingComment } = this.state;

    return (
      <div>
        <p>
          <b>Add Comment</b>
        </p>
        <Input
          value={form.comment}
          onKeyUp={this.handleSubmitComment}
          onChange={this.handleComment}
          label="Comment"
        />
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Button
            // If the form is blank or this user is not associated with
            // this booking, disable the form.
            type="primary"
            disabled={!form.comment}
            loading={pendingComment}
            onClick={this.handleSubmitComment}
            style={{ marginRight: 0 }}
          >
            Save
          </Button>
        </div>
        {this.renderCommentsHistory()}
      </div>
    );
  };

  renderUploads = () => {
    const { uploads, uploading, uploadReady, upload } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          flexFlow: 'row'
        }}>
          <div 
            style={{ 
              position: 'absolute',
              left: 'auto',
              right: 'auto',
              margin: 'auto',
              top: '0',
              bottom: '0',
              lineHeight: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="bms--choice-icon-uploads"
          >
            <Icon
              style={{
                fontSize: '2em',
                color: color('template', 'colorLabel', 'blue').color,
                padding: '20px',
                background: '#ffffff',
                borderRadius: '50%'
              }}
              type='swap'
            />
          </div>
          <div
            style={{
              paddingTop: '50px',
              paddingBottom: '50px',
              textAlign: 'center',
              width: '100%',
              border: `1px solid ${color('template', 'colorLabel', 'blue').color}`
            }}
          >
            {!uploadReady ? (
              <Button type="dashed" onClick={this.clickHiddenUploadForm}>
                <Icon type="upload" /> Choose a File
              </Button>
            ) : (
              <div style={{ position: 'relative' }}>
                <p>{unescape(upload.fileName)}</p>
                <Button
                  type="primary"
                  icon="upload"
                  disabled={uploading}
                  onClick={this.uploadFile}
                >
                  Upload File
                </Button>
                <Divider type="vertical" />
                <Button onClick={this.cancelUpload} type="warning">
                  Cancel Upload
                </Button>
              </div>
            )}

            {/* Grab file list data from this input */}
            <form id="hiddenInputParent" name="hiddenInputParent">
              <Input
                style={{ display: 'none' }}
                id="hiddenUploadForm"
                className="bmsDataUploadInput"
                name="userfile"
                onClick={e => (e.target.value = null)}
                onChange={this.chooseFile}
                type="file"
              />
            </form>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: color('template', 'colorLabel', 'blue').color,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div>
            <Title style={{ color: '#ffffff', marginBottom: '0' }} level={3}>Provide Download URL</Title>
            <Form style={{ display: 'flex', alignItems: 'center', width: '100%', margin: 'auto', justifyContent: 'center' }}>
              <Input 
                style={{ width: '100%', maxWidth: '50%' }} 
                prefix={<Icon type='global' />} type='text'
                onChange={this.onChangeUrl}
                value={this.state.url}
              />
              <Button disabled={!this.state.url} type='primary' onClick={this.saveUrl}>Submit</Button>
            </Form>
            </div>
          </div>
        </div>

        {uploading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 'auto',
              right: 'auto',
              width: '100%',
              height: 144,
              backgroundColor: 'rgb(255, 255, 255, 0.7)',
              zIndex: '1'
            }}
          >
            <div
              style={{ color: color('template', 'colorLabel', 'blue').color }}
            >
              <Icon type="loading" style={{ fontSize: '5rem' }} />
            </div>
          </div>
        )}
        <div>
          {uploads.length > 0 && (
            <div style={{ paddingLeft: '5px' }}>
              <Divider />
              {uploads.map(item => (
                <Row key={key++} style={{ margin: '10px 0' }}>
                  <Col 
                    span={12}
                    style={{
                      overflow: 'hidden',
                      // width: '50%',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Icon type="file" style={{ marginRight: '6px' }} />
                    <a
                      href={unescape(item.urlName)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {unescape(item.fileName)}
                    </a>
                  </Col>
                  <Col 
                    span={12}
                    style={{ 
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }} 
                  >
                    <strong>{item.uploadedUserName}</strong> <div style={{ margin: '0 6px' }}>|</div> {moment(item.created).format('LLL')}
                  </Col>
                  <hr style={{ marginTop: '25px', marginBottom: 0 }} />
                </Row>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    return (
      <Content
        style={{
          margin: '94px 16px 24px',
          padding: 24,
          minHeight: 280
        }}
      >
        <div>
          {this.renderAuditTrailDrawer()}
          {this.renderColorCards()}
          <Row gutter={16}>
            <Col span={24}>{this.renderProgress()}</Col>
            <Col span={12}>{this.renderBookingBrief()}</Col>
            <Col span={12}>
              <Row gutter={16}>
                <Col span={24}>
                  <Card style={{ overflowY: 'scroll' }}>
                    <Tabs
                      defaultActiveKey="1"
                      onChange={activeKey => {
                        if(activeKey === '2') this.loadUploads()
                      }}
                    >
                      <Tabs.TabPane
                        style={{ marginTop: '1rem' }}
                        tab="Comments"
                        key="1"
                      >
                        {this.renderComments()}
                      </Tabs.TabPane>
                      <Tabs.TabPane
                        style={{ marginTop: '1rem' }}
                        tab="Docs"
                        key="2"
                      >
                        {this.renderUploads()}
                      </Tabs.TabPane>
                    </Tabs>
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#1890ff',
                        cursor: 'pointer'
                      }}
                      onClick={() => this.loadAudit()}
                    >
                      Audit Trail <Icon type="double-right" />
                    </span> 
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Content>
    );
  }
}

export default Booking;
