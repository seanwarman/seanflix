import React, { Component } from "react";
import API from '../libs/ixApi';
import { message, Button, Col, Card, Popconfirm } from 'antd';
import JsonFormFill from '../components/json/JsonFormFill';
import JsonFormView from '../components/json/JsonFormView';

let id = 0;

export default class Scriptix extends Component {
  state = {
    scriptix: null,
    saving: false,
    deleting: [],
  }

  componentDidMount = () => {
    this.loadDataAndSetState();
  }

  loadDataAndSetState = async() => {
    let stateCopy = { ...this.state };
    let records;
    records = await API.get('/scriptix/list');
    if(!records) {
      message.error('This page is currently unusable.');
      return;
    }
    stateCopy.deleting = records.map(record => false);
    stateCopy.scriptix = records;
    stateCopy.saving = false;
    this.setState(stateCopy);
  }

  handleSubmit = async() => {
    this.setState({ saving: true });
    let stateCopy = { ...this.state };
    let result;
    result = await API.create('/scriptix/create', [stateCopy.form]);
    if(!result) {
      message.error('The passage failed to save');
    } else {
      message.success('Passage Saved');
    }
    this.loadDataAndSetState();
  }

  handleDelete = async (record, i) => {
    let {deleting} = this.state;
    deleting[i] = true;
    this.setState({deleting});
    await API.del('/scriptix/delete/' + record._id);
    this.loadDataAndSetState();
  }

  handleSave = async componentState => {
    this.setState({ saving: true });
    let result;
    result = await API.create('/scriptix/create', {jsonForm: componentState.jsonForm});
    if(!result) {
      message.error('The passage failed to save');
    } else {
      message.success('Passage Saved');
      console.log('result: ', result);
    }
    this.loadDataAndSetState();
  }

  render() {
    return (
      <div>
        <h1 style={{ color: '#c53942', textAlign: 'center' }}>SCRIPTIX</h1>
        <Col style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{ width: '670px', marginBottom: '16px' }}>
            <JsonFormFill
              update={this.handleSave}
              showLabels={false}
              jsonForm={[
                {
                  label: 'Book',
                  type: 'input',
                  required: true,
                },
                {
                  label: 'Subject',
                  type: 'input',
                  required: true,
                },
                {
                  label: 'Verse',
                  type: 'input',
                  required: true,
                },
                {
                  label: 'Page',
                  type: 'input',
                  required: true,
                },
                {
                  label: 'Passage',
                  type: 'textarea',
                  required: true,
                },
                {
                  label: 'Notes',
                  type: 'input',
                  required: true,
                }
              ]}
            />
          </Card>
        </Col>
        <div>
          {
            this.state.scriptix &&
              this.state.scriptix.map( (record, i) => (
                <Col key={id++} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Card style={{ width: '670px', marginBottom: '16px' }}>
                    {/* <h1>{record.book}</h1>
                    <h4>{record.subject}</h4>
                    <h2>Verse {record.verse} | Page {record.page}</h2>
                    <p>{record.passage}</p> */}
                    {
                      record.jsonForm &&
                      <JsonFormView 
                        jsonForm={record.jsonForm}
                        tags={['h1', 'h4', 'h2', 'h2', 'p']}
                      />
                    }
                    <div style={{width: '100%', textAlign: 'right'}}>
                      <Popconfirm
                        title="Are you sure you want to delete this script?"
                        onConfirm={() => this.handleDelete(record, i)}
                      >
                        <Button loading={this.state.deleting[i]} type="danger">Delete</Button>
                      </Popconfirm>
                    </div>
                  </Card>
                </Col>
              ))
          }
        </div>
      </div>
    )
  }
}
