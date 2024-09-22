// frontend/src/App.js

import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EntityDetails from './components/EntityDetails';
import EntitySearch from './components/EntitySearch';
import EntityPage from './components/EntityPage'; // Assurez-vous que ce composant existe

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <div style={{ float: 'left', color: '#fff', marginRight: '20px' }}>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              Outil KYC
            </Title>
          </div>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['details']}>
            <Menu.Item key="details" icon={<InfoCircleOutlined />}>
              <Link to="/">Recherche par ID</Link>
            </Menu.Item>
            <Menu.Item key="search" icon={<SearchOutlined />}>
              <Link to="/search">Recherche par Critères</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <Routes>
            <Route path="/" element={<EntityDetails />} />
            <Route path="/search" element={<EntitySearch />} />
            <Route path="/entities/:id" element={<EntityPage />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Outil KYC ©2024 Créé par Brigitte
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
