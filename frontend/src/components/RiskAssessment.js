import React from 'react';
import { Progress, Tag, Input } from 'antd';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { translate } from '../utils/translations';
import { getCountryLabel } from '../utils/countryMappings';
import { riskAssessmentService } from '../services/riskAssessmentService';

const { TextArea } = Input;

const RiskAssessment = ({ countryCode, properties, onCommentChange }) => {
  const countryName = getCountryLabel(countryCode);
  const listMembership = riskAssessmentService.checkListMembership(countryName);

  const calculateRiskScore = () => {
    let score = 0;

    // Vérification des listes
    if (listMembership.gafiBlack) score += 100;
    if (listMembership.gafiGrey) score += 50;
    if (listMembership.sanctions) score += 100;

    // Vérification du statut PEP
    if (properties.topics?.includes('role.pep')) score += 50;

    // Autres facteurs de risque...
    return Math.min(score, 100); // Plafonner à 100
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const riskScore = calculateRiskScore();
  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="risk-assessment">
      <div style={{ marginBottom: 20 }}>
        <h4>{translate('Risk Score')}</h4>
        <Progress
          percent={riskScore}
          status={riskLevel === 'high' ? 'exception' : 'active'}
          strokeColor={
            riskLevel === 'high' ? '#ff4d4f' :
            riskLevel === 'medium' ? '#faad14' : '#52c41a'
          }
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>{translate('List Membership')}</h4>
        <div>
          <Tag color={listMembership.gafiBlack ? 'error' : 'default'} icon={listMembership.gafiBlack ? <WarningOutlined /> : <CheckCircleOutlined />}>
            {translate('GAFI Black List')}
          </Tag>
          <Tag color={listMembership.gafiGrey ? 'warning' : 'default'} icon={listMembership.gafiGrey ? <WarningOutlined /> : <CheckCircleOutlined />}>
            {translate('GAFI Grey List')}
          </Tag>
          <Tag color={listMembership.sanctions ? 'error' : 'default'} icon={listMembership.sanctions ? <WarningOutlined /> : <CheckCircleOutlined />}>
            {translate('Sanctions List')}
          </Tag>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h4>{translate('Comments')}</h4>
        <TextArea
          rows={4}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={translate('Add your risk assessment comments here...')}
        />
      </div>
    </div>
  );
};

export default RiskAssessment;