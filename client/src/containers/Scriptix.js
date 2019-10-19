import React, { Component } from "react";
import API from '../libs/ixApi';
import { message, Button, Input, Col, Card } from 'antd';

let id = 0;

export default class Scriptix extends Component {
  state = {
    inputField: null,
    form: {
      subject: null,
      verse: null,
      book: null,
      page: null,
      passage: null,
      notes: null
    },
    drawerVisible: false,
    scriptix: null
  }

  componentDidMount = async() => {
    await this.loadDataAndSetState();
  }

  loadDataAndSetState = async() => {
    let stateCopy = { ...this.state };
    let records;
    let error;
    try {
      records = await API.get('/scriptix/list');
    } catch (err) {
      console.log('There was an error getting the scriptix endpoint: ', err);
      error = err;
    }
    if(error) return 'failed';
    stateCopy.scriptix = records;
    stateCopy.saving = false;
    stateCopy.form = {
      subject: null,
      verse: null,
      book: null,
      page: null,
      passage: null,
      notes: null
    }
    this.setState(stateCopy);
    return 'success';
  }
  handleSubmit = async() => {
    this.setState({ saving: true });
    let stateCopy = { ...this.state };
    let result;
    try {
      result = await API.create('/scriptix/create', [stateCopy.form]);
    } catch (e) {
      throw e;
    }
    console.log('result: ', result);
    let stateResult = await this.loadDataAndSetState();
    if(stateResult === 'success') message.success('Passage Saved');
    if(stateResult === 'failed') message.error('The passage failed to save');
  }
  validateForm = () => {
    let stateCopy = { ...this.state };
    let disabled = false;
    for (let key in stateCopy.form) {
      if((stateCopy.form[key] || '').length < 1) {
        disabled = true;
      }
    }
    return disabled;
  }

  handleChange = (e, field) => {
    let stateCopy = { ...this.state };
    stateCopy.form[field] = e.target.value;
    this.setState(stateCopy);
  }

  handleDelete = async record => {

    let result = await API.del('/scriptix/delete/98798blah');
    console.log('result: ', result);
  }

  render() {
    return (
      <div>
          <h1 style={{ color: '#c53942', textAlign: 'center' }}>SCRIPTIX</h1>
          <Col style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card style={{ width: '670px', marginBottom: '16px' }}>
              <p style={{ margin: '1rem 0' }}>Book</p>
              <Input value={this.state.form.book} onChange={e => this.handleChange(e, 'book')} />
              <p style={{ margin: '1rem 0' }}>Subject</p>
              <Input value={this.state.form.subject} onChange={e => this.handleChange(e, 'subject')} />
              <p style={{ margin: '1rem 0' }}>Verse</p>
              <Input value={this.state.form.verse} onChange={e => this.handleChange(e, 'verse')} />
              <p style={{ margin: '1rem 0' }}>Page</p>
              <Input value={this.state.form.page} onChange={e => this.handleChange(e, 'page')} />
              <p style={{ margin: '1rem 0' }}>Passage</p>
              <Input.TextArea value={this.state.form.passage} onChange={e => this.handleChange(e, 'passage')} />
              <p style={{ margin: '1rem 0' }}>Notes</p>
              <Input.TextArea value={this.state.form.notes} onChange={e => this.handleChange(e, 'notes')} />
              <div style={{ textAlign: 'right', margin: '1rem 0' }}>
                <Button disabled={this.validateForm()} loading={this.state.saving} style={{ margin: 0 }} onClick={this.handleSubmit}>Save</Button>
              </div>
            </Card>
          </Col>
          <div>
            {
              this.state.scriptix &&
                this.state.scriptix.map( record => (
                  <Col key={id++} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Card style={{ width: '670px', marginBottom: '16px' }}>
                      <h1>{record.book}</h1>
                      <h4>{record.subject}</h4>
                      <h2>Verse {record.verse} | Page {record.page}</h2>
                      <p>{record.passage}</p>
                      <Button type="danger" onClick={() => this.handleDelete(record)}>Delete</Button>
                    </Card>
                  </Col>
                ))
            }
        </div>
      </div>
    )
  }
}
