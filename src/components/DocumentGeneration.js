import React from 'react';
import { Card, Typography, Descriptions, Button } from 'antd';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const { Title } = Typography;

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

// Create Document Component
const MyDocument = ({ profileData, riskAssessmentData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>KYC Document</Text>
        
        <Text style={styles.subtitle}>Profile Information</Text>
        <Text style={styles.text}>Entity Type: {profileData.entityType}</Text>
        <Text style={styles.text}>Name: {profileData.name}</Text>
        <Text style={styles.text}>Country: {profileData.country}</Text>
        {profileData.dateOfBirth && (
          <Text style={styles.text}>Date of Birth: {profileData.dateOfBirth.format('YYYY-MM-DD')}</Text>
        )}
        
        <Text style={styles.subtitle}>Risk Assessment</Text>
        <Text style={styles.text}>Risk Level: {riskAssessmentData.riskLevel}</Text>
        <Text style={styles.text}>Risk Score: {riskAssessmentData.score}</Text>
        <Text style={styles.text}>Sanctions Found: {riskAssessmentData.sanctionsResults.length > 0 ? 'Yes' : 'No'}</Text>
      </View>
    </Page>
  </Document>
);

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

      <div style={{ marginTop: '20px' }}>
        <PDFDownloadLink document={<MyDocument profileData={profileData} riskAssessmentData={riskAssessmentData} />} fileName="kyc_document.pdf">
          {({ blob, url, loading, error }) =>
            loading ? 'Loading document...' : <Button type="primary">Download PDF</Button>
          }
        </PDFDownloadLink>
      </div>
    </Card>
  );
}

export default DocumentGeneration;