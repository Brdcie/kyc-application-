import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Tag, Input } from 'antd';
import { getCountryLabel } from '../utils/countryMappings';
import { translate } from '../utils/translations';


const { Title, Text } = Typography;
const { TextArea } = Input;

const gafiBlackList = ['Democratic People\'s Republic of Korea', 'Iran', 'Myanmar'];
const gafiGreyList = ['Bulgaria', 'Burkina Faso', 'Cameroon', 'Croatia', 'Democratic Republic of the Congo', 'Haiti', 'Kenya', 'Mali', 'Monaco', 'Mozambique', 'Namibia', 'Nigeria', 'Philippines', 'Senegal', 'South Africa', 'South Sudan', 'Syria', 'Tanzania', 'Venezuela', 'Vietnam', 'Yemen'];
const sanctionsList = ['Biélorussie', 'Burundi', 'Congo (République démocratique du)', 'Corée du Nord', 'Guinée-Bissau', 'Guinée', 'Haïti', 'Iran', 'Irak', 'Liban', 'Libye', 'Mali', 'Moldavie', 'Myanmar (ex-Birmanie)', 'Nicaragua', 'Niger', 'République Centrafricaine', 'Russie', 'Somalie', 'Soudan', 'Soudan du Sud', 'Syrie', 'Tunisie', 'Turquie', 'Venezuela', 'Yémen', 'Zimbabwe'];
const highRiskTopics = ['sanction', 'crime', 'wanted'];
const lowRiskTopics = ['poi', 'role.pep'];

export function calculateRiskScore(countryCode, properties) {
  console.log('Calculating risk score for:', countryCode, properties);
  const countryName = getCountryLabel(countryCode);
  console.log('Country name:', countryName);

  let score = 0;

  // Évaluation basée sur les listes de pays
  if (gafiBlackList.includes(countryName)) {
    score += 100;
    console.log('Country in GAFI Black List, score:', score);
  } else if (gafiGreyList.includes(countryName)) {
    score += 50;
    console.log('Country in GAFI Grey List, score:', score);
  }

  if (sanctionsList.includes(countryName)) {
    score += 75;
    console.log('Country in Sanctions List, score:', score);
  }

  // Évaluation basée sur les propriétés
  const topics = properties.topics || [];
  console.log('Topics:', topics);
  topics.forEach(topic => {
    if (highRiskTopics.includes(topic.toLowerCase())) {
      score += 50;
      console.log(`High risk topic: ${topic}, score:`, score);
    } else if (lowRiskTopics.includes(topic.toLowerCase())) {
      score += 10;
      console.log(`Low risk topic: ${topic}, score:`, score);
    } else {
      score += 25;
      console.log(`Other topic: ${topic}, score:`, score);
    }
  });

  console.log('Final risk score:', score);
  return score;
}

export function assessRisk(score) {
  if (score >= 100) {
    return 'High Risk';
  } else if (score >= 50) {
    return 'Medium Risk';
  } else {
    return 'Low Risk';
  }
}


const RiskAssessment = ({ countryCode, properties, onCommentChange }) => {
  const [comments, setComments] = useState('');

  const { riskLevel, riskScore } = useMemo(() => {
    if (!countryCode && (!properties || Object.keys(properties).length === 0)) {
      return { riskLevel: 'Unknown', riskScore: 0 };
    }
    const score = calculateRiskScore(countryCode, properties);
    const level = assessRisk(score);
    return { riskLevel: level, riskScore: score };
  }, [countryCode, properties]);

  const countryName = useMemo(() => {
    return getCountryLabel(countryCode) || translate('Not specified');
  }, [countryCode]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'High Risk':
        return 'red';
      case 'Medium Risk':
        return 'orange';
      case 'Low Risk':
        return 'green';
      default:
        return 'blue';
    }
  };

  const handleCommentChange = (e) => {
    const newComments = e.target.value;
    setComments(newComments);
    if (onCommentChange) {
      onCommentChange(newComments);
    }
  };

  return (
    <Card title={<Title level={3}>{translate('Risk Assessment')}</Title>}>
      <div style={{ marginBottom: '1rem' }}>
        <Text strong>{translate('country')} : </Text>
        <span>{countryName}</span>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <Text strong>{translate('Risk Level')} : </Text>
        <Tag color={getRiskColor(riskLevel)}>
          {translate(riskLevel)}
        </Tag>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <Text strong>{translate('Risk Score')} : </Text>
        <span>{riskScore}</span>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <Text strong>{translate('topics')} : </Text>
        <span>{properties.topics ? properties.topics.map(topic => translate(topic)).join(', ') : translate('None')}</span>
      </div>
      
      <div>
        <Text strong>{translate('Comments')} : </Text>
        <TextArea
          rows={4}
          value={comments}
          onChange={handleCommentChange}
          placeholder={translate('Add your comments here...')}
          style={{ marginTop: '0.5rem' }}
        />
      </div>
    </Card>
  );
};

RiskAssessment.propTypes = {
  countryCode: PropTypes.string,
  properties: PropTypes.object,
  onCommentChange: PropTypes.func
};
export default RiskAssessment;