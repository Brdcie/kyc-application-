import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import ProfileForm from './components/ProfileForm';
import RiskAssessment from './components/RiskAssessment';
import DocumentGeneration from './components/DocumentGeneration';

const { Header, Content, Footer } = Layout;

function AppContent() {
  const [profileData, setProfileData] = useState(null);
  const [riskAssessmentData, setRiskAssessmentData] = useState(null);
  const location = useLocation();

  const handleProfileSubmit = (data) => {
    console.log('Profile data received:', data);
    setProfileData(data);
    setRiskAssessmentData(null); // Reset risk assessment when new profile is submitted
  };

  const handleRiskAssessmentComplete = (data) => {
    console.log('Risk assessment completed:', data);
    setRiskAssessmentData(data);
  };

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header>
        <Menu theme="dark" mode="horizontal" selectedKeys={[location.pathname]}>
          <Menu.Item key="/"><Link to="/">Profile Form</Link></Menu.Item>
          <Menu.Item key="/risk-assessment"><Link to="/risk-assessment">Risk Assessment</Link></Menu.Item>
          <Menu.Item key="/document-generation"><Link to="/document-generation">Document Generation</Link></Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px', marginTop: '20px' }}>
        <Routes>
          <Route path="/" element={<ProfileForm onSubmit={handleProfileSubmit} />} />
          <Route 
            path="/risk-assessment" 
            element={
              profileData ? 
                <RiskAssessment 
                  profileData={profileData} 
                  riskAssessmentData={riskAssessmentData}
                  onComplete={handleRiskAssessmentComplete} 
                /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/document-generation" 
            element={
              profileData && riskAssessmentData ? 
                <DocumentGeneration profileData={profileData} riskAssessmentData={riskAssessmentData} /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center' }}>KYC Tool ©{new Date().getFullYear()} Created by BrD Compagnie</Footer>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;