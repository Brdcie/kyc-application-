import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, Form, Spin, Alert, Card, List } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getLocalEntity } from '../services/api';
import { translate } from '../utils/translations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCountryLabel } from '../utils/countryMappings';
import { getDataSourcesLabel } from '../utils/dataSourcesMappings';
import RiskAssessment, { calculateRiskScore, assessRisk } from './RiskAssessment';

const { Item } = Form;


const getCountryCode = (entity) => {
  if (!entity || !entity.properties) return null;
  
  // Handle country from properties
  if (entity.properties.country) {
    return Array.isArray(entity.properties.country) 
      ? entity.properties.country[0] 
      : entity.properties.country;
  }
  
  // Fallbacks
  if (entity.properties.jurisdiction) {
    return Array.isArray(entity.properties.jurisdiction)
      ? entity.properties.jurisdiction[0]
      : entity.properties.jurisdiction;
  }
  
  if (entity.properties.nationality) {
    return Array.isArray(entity.properties.nationality)
      ? entity.properties.nationality[0]
      : entity.properties.nationality;
  }
  
  return null;
};
const EntityDetails = () => {
  const { id } = useParams();
  const [entityId, setEntityId] = useState(id || '');
  const [entity, setEntity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskComments, setRiskComments] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!entityId) return;
    
    setLoading(true);
    setError('');
    setEntity(null);
    setRiskComments('');

    try {
      const response = await getLocalEntity(entityId);
      setEntity(response.data);
    } catch (err) {
      console.error('Error fetching entity:', err);
      if (err.response && err.response.status === 404) {
        setError(translate('Entity not found'));
      } else {
        setError(translate('Error fetching entity'));
      }
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    if (id) {
      setEntityId(id);
      handleSubmit();
    }
  }, [id, handleSubmit]);

  const handleInputChange = (e) => {
    setEntityId(e.target.value);
  };

  const generatePDF = () => {
    if (!entity) return;
    
    const doc = new jsPDF();
    
    const addHeader = (pageNumber) => {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${translate('Entity')}: ${entity.caption} (${translate('id')}: ${entity.id})`, 14, 10);
      doc.text(`${translate('Generation Date')}: ${new Date().toLocaleString('fr-FR')}`, 14, 15);
      doc.text(`${translate('Page')} ${pageNumber}`, 195, 15, { align: 'right' });
      doc.setTextColor(0);
    };
    
    // Première page
    addHeader(1);
    
    doc.setFontSize(18);
    doc.text(`${translate('Entity Details')}: ${entity.caption}`, 14, 25);
    
    doc.setFontSize(12);
    doc.text(`${translate('id')}: ${entity.id || 'N/A'}`, 14, 40);
    doc.text(`${translate('caption')}: ${entity.caption || 'N/A'}`, 14, 48);
    doc.text(`${translate('schema')}: ${translate(entity.schema) || 'N/A'}`, 14, 56);
    doc.text(`${translate('referents')}: ${entity.referents?.join(', ') || 'N/A'}`, 14, 64);
    const datasets = entity.datasets?.map(dataset => getDataSourcesLabel(dataset)).join(', ') || 'N/A';
    doc.text(`${translate('datasets')}: ${datasets}`, 14, 72);
    doc.text(`${translate('first_seen')}: ${entity.first_seen || 'N/A'}`, 14, 80);
    doc.text(`${translate('last_seen')}: ${entity.last_seen || 'N/A'}`, 14, 88);
    doc.text(`${translate('last_change')}: ${entity.last_change || 'N/A'}`, 14, 96);
    doc.text(`${translate('target')}: ${entity.target ? translate('Yes') : translate('No')}`, 14, 104);

    // Tableau des propriétés
    const tableColumn = [translate("Property"), translate("Value")];
  
    const tableRows = Object.entries(entity.properties || {}).map(([key, value]) => {
      let displayValue = value;
      if (key === 'country' || key === 'jurisdiction' || key === 'nationality') {
        displayValue = getCountryLabel(value);
      } else if (Array.isArray(value)) {
        displayValue = value.map(v => translate(v)).join(', ');
      } else if (value) {
        displayValue = translate(value.toString());
      }
      return [translate(key), displayValue || 'N/A'];
    });
    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

  
// Second page - Risk Assessment
doc.addPage();
addHeader(2);

// Title background
doc.setFillColor(22, 160, 133);
doc.rect(0, 20, 210, 20, 'F');
doc.setTextColor(255, 255, 255);
doc.setFontSize(18);
doc.text(translate('Risk Assessment'), 105, 35, { align: 'center' });

doc.setTextColor(0, 0, 0);
doc.setFontSize(12);

// Create content box
doc.setDrawColor(22, 160, 133);
doc.setLineWidth(0.5);
doc.rect(10, 45, 190, 100);

// Add content with proper spacing
const countryCode = getCountryCode(entity);
const countryName = getCountryLabel(countryCode);
const score = calculateRiskScore(countryCode, entity.properties || {});
const riskLevel = assessRisk(score);

let yPos = 60;
const lineHeight = 20;

// Country
doc.text(`${translate('country')}: ${countryName}`, 20, yPos);
yPos += lineHeight;

// Risk Level with color
doc.text(`${translate('Risk Level')}: `, 20, yPos);
const riskColor = riskLevel === translate('High Risk') ? '#FF0000' : 
                 riskLevel === translate('Medium Risk') ? '#FFA500' : 
                 '#008000';
doc.setTextColor(riskColor);
doc.text(translate(riskLevel), 70, yPos);
doc.setTextColor(0, 0, 0);
yPos += lineHeight;

// Risk Score
doc.text(`${translate('Risk Score')}: ${score}`, 20, yPos);
yPos += lineHeight;

// Topics
doc.text(`${translate('topics')}:`, 20, yPos);
const topics = entity.properties?.topics?.map(t => translate(t)).join(', ') || translate('None');
doc.setFontSize(10);
const splitTopics = doc.splitTextToSize(topics, 160);
doc.text(splitTopics, 20, yPos + 10);
yPos += lineHeight + (splitTopics.length * 5);

// Comments
doc.setFontSize(12);
doc.text(`${translate('Comments')}:`, 20, yPos);
const comments = riskComments || translate('No comments');
doc.setFontSize(10);
const splitComments = doc.splitTextToSize(comments, 160);
doc.text(splitComments, 20, yPos + 10);
const sanitizedCaption = entity.caption.replace(/[^a-zA-Z0-9]/g, '_') || 'entity';
doc.save(`kyc_${sanitizedCaption}.pdf`);
  };

  const handleRiskCommentChange = (comments) => {
    setRiskComments(comments);
  };

  return (
    <Card title={translate('Search Entity by ID')} style={{ maxWidth: 800, margin: 'auto' }}>
      <Form layout="inline" onFinish={handleSubmit}>
        <Item>
          <Input
            value={entityId}
            onChange={handleInputChange}
            placeholder={translate('Enter entity ID')}
            required
          />
        </Item>
        <Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            {translate('Search')}
          </Button>
        </Item>
      </Form>

      {loading && <Spin tip={translate('Loading...')} style={{ marginTop: 20 }} />}
      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 20 }} />}

      {entity && (
        <>
          <Card title={translate('Entity Details')} style={{ marginTop: 20 }}>
            <p><strong>{translate('id')} :</strong> {entity.id}</p>
            <p><strong>{translate('caption')} :</strong> {entity.caption}</p>
            <p><strong>{translate('schema')} :</strong> {translate(entity.schema)}</p>
            <p><strong>{translate('referents')} :</strong> {entity.referents?.join(', ') || 'N/A'}</p>
            <p><strong>{translate('datasets')} :</strong> {entity.datasets?.map(dataset => getDataSourcesLabel(dataset)).join(', ') || 'N/A'}</p>
            <h4>{translate('properties')} :</h4>
            <List
              itemLayout="horizontal"
              dataSource={Object.entries(entity.properties || {})}
              renderItem={([key, values]) => (
                <List.Item>
                  <List.Item.Meta
                    title={<strong>{translate(key)} :</strong>}
                    description={values ? (
                       Array.isArray(values) 
                         ? values.map(v => key === 'country' ? getCountryLabel(v) : translate(v)).join(', ') 
                         : key === 'country' 
                           ? getCountryLabel(values.toString()) 
                           : translate(values.toString())
                    ) : 'N/A'}
                    />
                  </List.Item>
              )}
            />
          </Card>
          
          <Card title={translate('Risk Assessment')} style={{ marginTop: 20 }}>
            <RiskAssessment
              countryCode={getCountryCode(entity)}
              properties={entity.properties || {}}
              onCommentChange={handleRiskCommentChange}
            />
          </Card>
          
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={generatePDF}
            style={{ marginTop: 20 }}
          >
            {translate('Generate PDF')}
          </Button>
        </>
      )}
    </Card>
  );
};

export default EntityDetails;
