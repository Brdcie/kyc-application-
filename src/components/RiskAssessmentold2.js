import React, { useState, useEffect } from 'react';
import { searchPerson, searchEntity } from '../services/mockOpenSanctionsApi.js';

function RiskAssessment({ profileData, onComplete }) {
  const [riskScore, setRiskScore] = useState(0);
  const [riskFactors, setRiskFactors] = useState([]);

  const getRiskLevel = (score) => {
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  };

  useEffect(() => {
    const assessRisk = async () => {
      if (!profileData) {
        console.log("Profile data is not available");
        return;
      }

      let score = 0;
      const factors = [];

      // Check country risk
      const highRiskCountries = ['North Korea', 'Iran', 'Syria'];
      if (profileData.country && highRiskCountries.includes(profileData.country)) {
        score += 50;
        factors.push('High-risk country');
      }

      try {
        let sanctionsResults;
        if (profileData.entityType === 'individual') {
          sanctionsResults = await searchPerson(`${profileData.firstName} ${profileData.lastName}`);
        } else {
          sanctionsResults = await searchEntity(profileData.companyName);
        }

        if (sanctionsResults && sanctionsResults.length > 0) {
          score += 50;
          factors.push('Matched on sanctions list');
        }
      } catch (error) {
        console.error('Error checking sanctions:', error);
        factors.push('Error checking sanctions list');
      }

      // Add other risk factors as before...

      setRiskScore(score);
      setRiskFactors(factors);

      onComplete({
        riskScore: score,
        riskFactors: factors,
        riskLevel: getRiskLevel(score)
      });
    };

    assessRisk();
  }, [profileData, onComplete]);

  if (!profileData) {
    return <div>No profile data available for risk assessment.</div>;
  }

  return (
    <div>
      <h2>Risk Assessment</h2>
      <p>Entity Type: {profileData.entityType}</p>
      <p>Risk Score: {riskScore}</p>
      <p>Risk Level: {getRiskLevel(riskScore)}</p>
      <h3>Risk Factors:</h3>
      <ul>
        {riskFactors.map((factor, index) => (
          <li key={index}>{factor}</li>
        ))}
      </ul>
    </div>
  );
}

export default RiskAssessment;