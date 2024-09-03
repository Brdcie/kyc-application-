import React from 'react';
import { Card, Typography, Descriptions } from 'antd';

const { Title } = Typography;

function DocumentGeneration({ profileData, riskAssessmentData }) {
  if (!profileData || !riskAssessmentData) {
    return <div>No data available for document generation.</div>;
  }

  return (
    <Card title={<Title level={2}>KYC Document</Title>}>
      <Descriptions title="Profile Information" bordered>
        <Descriptions.Item label="Entity Type">{profileData.entityType}</Descriptions.Item>
        <Descriptions.Item label="Name">{profileData.name}</Descriptions.Item>
        <Descriptions.Item label="Country">{profileData.country}</Descriptions.Item>
        {profileData.dateOfBirth && (
          <Descriptions.Item label="Date of Birth">{profileData.dateOfBirth.format('YYYY-MM-DD')}</Descriptions.Item>
        )}
      </Descriptions>

      <Descriptions title="Risk Assessment" bordered style={{ marginTop: '20px' }}>
        <Descriptions.Item label="Risk Level">{riskAssessmentData.riskLevel}</Descriptions.Item>
        <Descriptions.Item label="Risk Score">{riskAssessmentData.score}</Descriptions.Item>
        <Descriptions.Item label="Sanctions Found">
          {riskAssessmentData.sanctionsResults.length > 0 ? 'Yes' : 'No'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default DocumentGeneration;