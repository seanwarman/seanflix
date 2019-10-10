import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../antd.css';
import { Layout, Menu } from 'antd';

export default class Header extends Component {
  render() {
   return (
      <Layout.Header className="header">
        <Menu
          theme="light"
          mode="horizontal"
          defaultSelectedKeys={['/']}
          style={{ lineHeight: '64px', position: 'relative' }}
        >
          <Menu.Item id="ix-menu-Seanflix" key="/">
            <Link to="/">Seanflix</Link>
          </Menu.Item>
          <Menu.Item id="ix-menu-Scriptix" key="/scriptix">
            <Link to="/scriptix">Scriptix</Link>
          </Menu.Item> 
        </Menu>
      </Layout.Header>
    )
  }
}
