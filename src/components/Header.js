import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, SafetyOutlined, FileOutlined, AuditOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;

function AppHeader() {
  const location = useLocation();

  return (
    <Header>
      <div className="logo" />
      <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
        <Menu.Item key="/profile" icon={<UserOutlined />}>
          <Link to="/profile">Profile</Link>
        </Menu.Item>
        <Menu.Item key="/risk-assessment" icon={<SafetyOutlined />}>
          <Link to="/risk-assessment">Risk Assessment</Link>
        </Menu.Item>
        <Menu.Item key="/document-generation" icon={<FileOutlined />}>
          <Link to="/document-generation">Document Generation</Link>
        </Menu.Item>
        <Menu.Item key="/compliance" icon={<AuditOutlined />}>
          <Link to="/compliance">Compliance</Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
}

export default AppHeader;