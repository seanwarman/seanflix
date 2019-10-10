import React, { Component } from 'react';
import Routes from './Routes';
import './App.css';
import './antd.css';
import { Icon, Layout } from 'antd';
import API from './libs/ixApi';

import Header from './Layout/Header';
// import Sider from './Layout/Sider';
import Auth from './components/Auth';

const { Content, Footer } = Layout;

class App extends Component {
  state = {
    handleDrawer: () => this.setState({ drawerVisible: true }),
    closeDrawer: () => this.setState({ drawerVisible: false }),
    drawerVisible: false,
    key: window.localStorage.seanflixAuth ? window.localStorage.seanflixAuth : null,
    authenticated: false,
    loading: true,
    location: null,
    setLocation: (location) => location
  };

  componentDidMount = async() => {
    if(!this.state.key) {
      this.setState({ authenticated: false, loading: false });
      return;
    }
    let { key } = this.state;

    let newKey = await this.check(key);

    if(newKey) {
      window.localStorage.seanflixAuth = newKey;
      this.setState({ authenticated: true, loading: false });
    } else {
      this.setState({ authenticated: false, loading: false });
    }
  }

  check = async key => {
    let result;

    try {
      result = await API.post('/seanflix/auth/check', key);
    } catch (err) {
      console.log('There was an error with the auth endpoint: ', err);
      throw err;
    }

    if(result.key) return result.key;
    console.log('there was no key :(');
    return null;
  }

  authentication = (key) => {
    window.localStorage.seanflixAuth = key;
    this.setState({ authenticated: true, loading: false  })
  }

  render() {
    const childProps = this.state;
    const { authenticated, loading, location } = this.state;
    const plusIconStyles = { 
      color: 'white', 
      position: 'absolute', 
      right: '16px', 
      top: '19px', 
      fontSize: '1.5rem',
      cursor: 'pointer'
    };
    return (
      <Layout>
          {
            this.state.authenticated &&
              <div style={{ position: 'relative' }}>
                <Header props={childProps} location={location}/>
                <Icon 
                  onClick={this.state.handleDrawer}
                  type="plus" 
                  style={plusIconStyles} 
                />        
              </div>
          }
          <Content style={{ padding: '0', background: 'white' }}>
            {/* <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb> */}
            <Layout style={{ padding: '24px 0', minHeight: '100vh' }}>

              {/* <Sider /> */}

              <Content style={{ 
                padding: '0 24px', 
                minHeight: 280,
                // display: 'flex',
                // justifyContent: 'center',
                // alignItems: 'center'
              }}>
                {
                  authenticated ?
                  <Routes childProps={childProps} />
                  :
                  !loading ?
                  <div style={{ width: '100%', height: '75vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Auth authentication={this.authentication} />
                  </div>
                  :
                  <div style={{ width: '100%', height: '75vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Icon style={{ color: 'white', fontSize: '5rem' }} type="loading" />
                  </div>
                }

              </Content>
            </Layout>
          </Content>
        <Footer style={{ textAlign: 'center' }}>SEANFLIX ©2019 Created by Michael Jackson's ghost.</Footer>
      </Layout>
    );
  }
}

export default App
