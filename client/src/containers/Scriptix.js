import React, { Component } from "react";
import API from '../libs/ixApi';
import { message, Button, Col, Card, Popconfirm, Icon } from 'antd';
import JsonFormFill from '../components/json/JsonFormFill';
import JsonFormView from '../components/json/JsonFormView';

let id = 0;

export default class Scriptix extends Component {
  state = {
    scriptix: [],
    saving: false,
    deleting: [],
    editing: [],
    updating: [],
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
    stateCopy.editing = records.map(record => false);
    stateCopy.updating = records.map(record => false);
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

  handleUpdate = async (componentState, i) => {
    let {updating, scriptix} = this.state;
    updating[i] = true;
    this.setState({updating});
    let result = await API.update('/scriptix/update/' + scriptix[i]._id, {
      jsonForm: componentState.jsonForm
    });
    if(!result) {
      message.error('The passage failed to save');
    } else {
      message.success('Passage Saved');
    }
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
    }
    this.loadDataAndSetState();
  }

  render() {
    return (
      <div>
        <h1 style={{ color: '#c53942', textAlign: 'center' }}>SCRIPTIX</h1>
        <Col style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card style={{ width: '670px', marginBottom: '16px' }}>
            <div>
            </div>
            <JsonFormFill
              update={this.handleSave}
              // showLabels={false}
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
                    <div
                      style={{width: '100%', textAlign: 'right'}}
                    >
                      <Icon 
                        type="edit" 
                        onClick={() => {
                          let editing = this.state.editing;
                          editing[i] = !editing[i];
                          this.setState({editing});
                        }}
                      />
                    </div>
                    {
                      record.jsonForm &&
                      this.state.editing[i] ?
                      <JsonFormFill
                        jsonForm={record.jsonForm}
                        update={state => this.handleUpdate(state, i)}
                      />
                      :
                      <JsonFormView 
                        jsonForm={record.jsonForm.reduce((arr,json) => {
                          if(json.label === 'Notes') {
                            return arr;
                          } else {
                            return arr.concat(json);
                          }
                        },[])}
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
