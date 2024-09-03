import React, { useEffect, useState } from 'react';
import { Card, Typography, Tag, Spin } from 'antd';
import { searchPerson, searchEntity } from '../services/mockOpenSanctionsApi';

const { Title, Text } = Typography;

function RiskAssessment({ profileData, riskAssessmentData, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localRiskData, setLocalRiskData] = useState(riskAssessmentData);

  useEffect(() => {
    const assessRisk = async () => {
      if (profileData && !localRiskData) {
        setIsLoading(true);
        let sanctionsResults = [];
        if (profileData.entityType === 'individual') {
          sanctionsResults = await searchPerson(profileData.name);
        } else {
          sanctionsResults = await searchEntity(profileData.name);
        }

        let score = 0;
        if (sanctionsResults.length > 0) {
          score += 50; // High risk if found in sanctions list
        }
        if (['Iran', 'North Korea', 'Syria'].includes(profileData.country)) {
          score += 50; // High risk countries
        }

        const riskLevel = score >= 50 ? 'High' : 'Low';
        const newRiskData = { riskLevel, score, sanctionsResults };
        setLocalRiskData(newRiskData);
        onComplete(newRiskData);
        setIsLoading(false);
      }
    };

    assessRisk();
  }, [profileData, localRiskData, onComplete]);

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (!profileData) {
    return <Text>No profile data available for risk assessment.</Text>;
  }

  return (
    <Card title={<Title level={2}>Risk Assessment</Title>}>
      <Text strong>Entity Type: {profileData.entityType}</Text>
      <br />
      <Text strong>Name: {profileData.name}</Text>
      <br />
      <Text strong>Country: {profileData.country}</Text>
      <br />
      <Text strong>
        Risk Level: <Tag color={localRiskData?.riskLevel === 'High' ? 'red' : 'green'}>{localRiskData?.riskLevel}</Tag>
      </Text>
      <br />
      <Text strong>Sanctions Found: {localRiskData?.sanctionsResults.length > 0 ? 'Yes' : 'No'}</Text>
    </Card>
  );
}

export default RiskAssessment;