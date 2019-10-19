import React, { Component } from 'react';
import { Card, Input, Button } from 'antd';
import API from '../libs/ixApi';

export default class Auth extends Component {
  state = {
    form: {
      password: null
    }
  }

  auth = async e => {
    let result;
    
    try {
      result = await API.create('/seanflix/auth', this.state.form.password);
    } catch (err) {
      console.log('There was an error with the auth endpoint: ', err);
    }
    console.log(result);
    if(!result.key) return 'denied';

    this.props.authentication(result.key);
  }

  handleInput = e => {
    let stateCopy = { ...this.state };
    stateCopy.form.password = e.target.value;
    this.setState(stateCopy);
  }
  
  render() {
    return (
      <div>
        <Card>
          <Input.Password
            value={this.state.form.password} 
            onChange={this.handleInput}
            onKeyUp={e => {
              if (e.keyCode === 13 || e.which === 13) {
                this.auth(e)
              }
            }}
          />
          <Button 
            type="primary" 
            style={{ marginLeft: 0 }} 
            onClick={this.auth}
          >Enter</Button>
      </Card>
    </div>
    )
  }
}
