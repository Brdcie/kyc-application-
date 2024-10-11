import React, { useState } from 'react';
import { APP_VERSION, APP_NAME } from './config';
import { Layout, Menu, Typography } from 'antd';
import { ConfigProvider } from 'antd';
import { SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import EntityDetails from './components/EntityDetails';
import EntitySearch from './components/EntitySearch';
import EntityPage from './components/EntityPage';

const { Header, Content, Footer } = Layout;
const { Title, Text} = Typography;

const App = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [searchCaption, setSearchCaption] = useState('');

  const selectedKey = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/search')) return 'search';
    return 'details';
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#299e60',
          colorBgContainer: '#fff',
        },
        components: {
          Layout: {
            headerBg: '#215dd6',
            bodyBg: '#f0f2f5',
          },
          Menu: {
            horizontalItemSelectedColor: '#fff',
            horizontalItemHoverColor: '#fff',
            horizontalItemSelectedBg: '#1a4bab', // Couleur de fond pour l'onglet sélectionné
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: '#fff', marginLeft: '20px', marginRight: '20px' }}>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>
               KYC as a service
              </Title>
            </div>
            <Menu 
              theme="dark" 
              mode="horizontal" 
              selectedKeys={[selectedKey()]}
              style={{ flex: 1, background: 'none' }}
            >
              <Menu.Item key="search" icon={<SearchOutlined />} style={menuItemStyle}>
                <Link to="/">Recherche par Critères</Link>
              </Menu.Item>
              <Menu.Item key="details" icon={<InfoCircleOutlined />} style={menuItemStyle}>
                <Link to="/details">Recherche par ID</Link>
              </Menu.Item>
            </Menu>
          </div>
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <Routes>
            <Route path="/" element={
              <EntitySearch 
                setSearchResults={setSearchResults}
                searchResults={searchResults}
                searchCaption={searchCaption}
                setSearchCaption={setSearchCaption}
              />
            } />
            <Route path="/details" element={<EntityDetails />} />
            <Route path="/entity/:id" element={<EntityPage />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
           <div>{APP_NAME} ©2024 by EvoLogica</div>
           <Text type="secondary">Version {APP_VERSION}</Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

const menuItemStyle = {
  margin: '0 5px',
  borderRadius: '6px 6px 0 0',
  transition: 'all 0.3s',
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;