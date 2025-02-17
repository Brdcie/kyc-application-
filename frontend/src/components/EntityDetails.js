import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, Form, Spin, Alert, Card, List, Select } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { getEntity } from '../services/api';
import { translate } from '../utils/translations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCountryLabel } from '../utils/countryMappings';
import { getDataSourcesLabel } from '../utils/dataSourcesMappings';
import RiskAssessment from './RiskAssessment';
import { riskAssessmentService } from '../services/riskAssessmentService';
import UBODetails from './UBODetails';
import { cleanCyrillicText } from '../utils/textFormatting';
import * as XLSX from 'xlsx';

const { Item } = Form;
const { Option } = Select;

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

const formatComplexValue = (value) => {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(v => formatComplexValue(v)).join('\n');
    }
    return Object.entries(value)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${translate(k)}: ${formatComplexValue(v)}`)
      .join('\n');
  }
  return value?.toString() || 'N/A';
};

const formatAddressForPDF = (address) => {
  if (!address) return 'N/A';
  
  if (typeof address === 'object') {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.country) parts.push(getCountryLabel(address.country));
    return parts.length > 0 ? parts.join(', ') : formatComplexValue(address);
  }
  
  return address.toString();
};

const EntityDetails = ({ dataSource }) => {
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
      const response = await getEntity(entityId, dataSource);
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
  }, [entityId, dataSource]);

  useEffect(() => {
    if (id) {
      setEntityId(id);
      handleSubmit();
    }
  }, [id, handleSubmit]);

  const handleInputChange = (e) => {
    setEntityId(e.target.value);
  };
  const generateUBOSection = (doc, uboDetails, yPos) => {
    // Titre
    doc.setFillColor(22, 160, 133);
    doc.rect(0, 20, 297, 20, 'F'); // Ajusté pour le format paysage
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(translate('Beneficial Ownership Structure'), 148, 35, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  
    let currentY = 50;
  
    // Barre de progression avec légende
    doc.setFontSize(12);
    doc.text(translate('Total Identified Ownership'), 20, currentY);
    
    const barWidth = 200;
    const barHeight = 10;
    const startX = 20;
    
    // Fond gris de la barre
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, currentY + 5, barWidth, barHeight, 'F');
    
    // Progression en vert
    doc.setFillColor(22, 160, 133);
    const progress = Math.min(barWidth * (uboDetails.totalIdentifiedOwnership / 100), barWidth);
    doc.rect(startX, currentY + 5, progress, barHeight, 'F');
    
    // Pourcentage à droite de la barre
    doc.text(`${Math.round(uboDetails.totalIdentifiedOwnership)}%`, startX + barWidth + 10, currentY + 12);
    
    currentY += 35;
  
    // Tableau des propriétaires directs
    if (uboDetails.directOwners?.length > 0) {
      doc.setFontSize(14);
      doc.text(translate('Direct Owners'), 20, currentY);
      currentY += 10;
  
      const directOwnersData = uboDetails.directOwners.map(owner => {
        const cleanName = cleanCyrillicText(owner.name);
        const cleanStatus = cleanCyrillicText(owner.status);
        return [
          cleanName,
          `${owner.stake || 0}%`,
          owner.startDate ? new Date(owner.startDate).toLocaleDateString('fr-FR') : 'N/A',
          cleanStatus
        ];
      });
  
      doc.autoTable({
        startY: currentY,
        head: [[
          translate('Name'),
          translate('Ownership'),
          translate('Start Date'),
          translate('Status')
        ]],
        body: directOwnersData,
        theme: 'striped',
        headStyles: { 
          fillColor: [22, 160, 133],
          textColor: [255, 255, 255],
          fontSize: 12
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 40, halign: 'center' },
          2: { cellWidth: 50, halign: 'center' },
          3: { cellWidth: 60 }
        },
        styles: {
          fontSize: 10,
          cellPadding: 6
        },
        margin: { left: 20 }
      });
  
      currentY = doc.lastAutoTable.finalY + 20;
    }
  
    return currentY;
  };
  const generatePDF = () => {
    if (!entity) return;
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const addHeader = (pageNumber) => {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${translate('Entity')}: ${entity.caption} (${translate('id')}: ${entity.id})`, 20, 10);
      doc.text(`${translate('Generation Date')}: ${new Date().toLocaleString('fr-FR')}`, 20, 15);
      doc.text(`${translate('Page')} ${pageNumber}`, 280, 15, { align: 'right' });
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
      } else if (key === 'address' || key.includes('Address')) {
        displayValue = Array.isArray(value) 
          ? value.map(addr => formatAddressForPDF(addr)).join('\n')
          : formatAddressForPDF(value);
      } else if (key === 'ownershipStakes') {
        displayValue = Array.isArray(value) 
          ? value.map(stake => {
              const owner = stake.owner || {};
              return `${owner.caption || 'N/A'}: ${stake.percentage || 0}%`;
            }).join('\n')
          : 'N/A';
      } else if (key === 'beneficialOwners') {
        displayValue = Array.isArray(value)
          ? value.map(bo => {
              const owner = bo.owner || bo;
              return `${owner.caption || 'N/A'}${bo.stake ? `: ${bo.stake}%` : ''}`;
            }).join('\n')
          : 'N/A';
      } else if (Array.isArray(value)) {
        displayValue = value.map(v => {
          if (typeof v === 'object' && v !== null) {
            return formatComplexValue(v);
          }
          return translate(v);
        }).join(', ');
      } else if (typeof value === 'object' && value !== null) {
        displayValue = formatComplexValue(value);
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

    // Second page - List Membership
    doc.addPage();
    addHeader(2);

    // Title background
    doc.setFillColor(22, 160, 133);
    doc.rect(0, 20, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(translate('List Membership'), 105, 35, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    // Create content box
    doc.setDrawColor(22, 160, 133);
    doc.setLineWidth(0.5);
    doc.rect(10, 45, 190, 100);

    // Add content with proper spacing
    const countryCode = getCountryCode(entity);
    const countryName = getCountryLabel(countryCode);
    const listMembership = riskAssessmentService.checkListMembership(countryName);


    let yPos = 60;
    const lineHeight = 20;

    // Country
    doc.text(`${translate('country')}: ${countryName}`, 20, yPos);
    yPos += lineHeight;

    // List Membership
    doc.text(`${translate('GAFI Black List')}: ${listMembership.gafiBlack ? translate('Yes') : translate('No')}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`${translate('GAFI Grey List')}: ${listMembership.gafiGrey ? translate('Yes') : translate('No')}`, 20, yPos);
    yPos += lineHeight;
    doc.text(`${translate('Sanctions List')}: ${listMembership.sanctions ? translate('Yes') : translate('No')}`, 20, yPos);
    yPos += lineHeight;

    // Topics
    doc.text(`${translate('topics')}:`, 20, yPos);
    const topics = entity.properties?.topics?.map(t => translate(t)).join(', ') || translate('None');
    doc.setFontSize(10);
    const splitTopics = doc.splitTextToSize(topics, 160);
    doc.text(splitTopics, 20, yPos + 10);
    yPos += lineHeight + (splitTopics.length * 5);

    // Section UBO
    if (entity.uboDetails) {
      doc.addPage();
      addHeader(3);
      
      const finalY = generateUBOSection(doc, entity.uboDetails, 50);
      
      // Ajout des commentaires si nécessaire
      if (riskComments) {
        doc.setFontSize(12);
        doc.text(`${translate('Comments')}:`, 20, finalY + 10);
        const splitComments = doc.splitTextToSize(riskComments, 250);
        doc.setFontSize(10);
        doc.text(splitComments, 20, finalY + 20);
      }
    }

    // Save the PDF
    const sanitizedCaption = entity.caption.replace(/[^a-zA-Z0-9]/g, '_') || 'entity';
    doc.save(`kyc_${sanitizedCaption}.pdf`);
  };

  const generateXLSX = (entity) => {
    const wb = XLSX.utils.book_new();
  
    // Feuille 1: Informations générales de l'entité
    const generalInfo = [
      ['ID', entity.id],
      ['Nom', entity.caption],
      ['Type entité', entity.schema],
      ['Pays', entity.properties?.country || 'N/A'],
      ['Date de création', entity.properties?.incorporationDate || 'N/A'],
      ['Statut', entity.properties?.status || 'N/A'],
    ];
    const wsGeneral = XLSX.utils.aoa_to_sheet(generalInfo);
    XLSX.utils.book_append_sheet(wb, wsGeneral, "Informations Générales");
  
    // Feuille 2: Propriétés détaillées
    const detailedProps = Object.entries(entity.properties || {}).map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : value]);
    const wsProps = XLSX.utils.aoa_to_sheet(detailedProps);
    XLSX.utils.book_append_sheet(wb, wsProps, "Propriétés Détaillées");
  
    // Feuille 3: Structure de propriété (UBO)
    if (entity.uboDetails) {
      const uboData = [
        ['Total Identified Ownership', `${entity.uboDetails.totalIdentifiedOwnership}%`],
        ['', ''],
        ['Direct Owners', '', '', ''],
        ['Nom', 'Part', 'Date de début', 'Statut'],
        ...entity.uboDetails.directOwners.map(owner => [
          owner.name,
          `${owner.stake}%`,
          owner.startDate || 'N/A',
          owner.status || 'N/A'
        ]),
        ['', ''],
        ['Beneficial Owners', '', '', ''],
        ['Nom', 'Type de contrôle', 'Date de vérification', 'Statut PEP'],
        ...entity.uboDetails.beneficialOwners.map(owner => [
          owner.name,
          owner.controlType || 'N/A',
          owner.verificationDate || 'N/A',
          owner.isPEP ? 'Oui' : 'Non'
        ])
      ];
      const wsUBO = XLSX.utils.aoa_to_sheet(uboData);
      XLSX.utils.book_append_sheet(wb, wsUBO, "Structure de Propriété");
    }
  
    // Feuille 4: Évaluation des listes
    const listData = [
      ['Pays', entity.properties?.country || 'N/A'],
      ['GAFI Black List', riskAssessmentService.checkListMembership(getCountryLabel(entity.properties?.country)).gafiBlack ? 'Oui' : 'Non'],
      ['GAFI Grey List', riskAssessmentService.checkListMembership(getCountryLabel(entity.properties?.country)).gafiGrey ? 'Oui' : 'Non'],
      ['Sanctions List', riskAssessmentService.checkListMembership(getCountryLabel(entity.properties?.country)).sanctions ? 'Oui' : 'Non'],
      ['', ''],
      ['Catégories', ''],
      ...Object.entries(entity.properties || {})
        .filter(([key, value]) => key === 'topics' && Array.isArray(value))
        .flatMap(([_, values]) => values.map(v => ['', v]))
    ];
    const wsList = XLSX.utils.aoa_to_sheet(listData);
    XLSX.utils.book_append_sheet(wb, wsList, "Évaluation des Listes");
  
    // Génération du fichier
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    // Conversion en Blob
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
    
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  const ExportButton = ({ entity }) => {
    const [exportFormat, setExportFormat] = useState('pdf');
  
    const handleExport = () => {
      if (exportFormat === 'pdf') {
        generatePDF(entity);
      } else {
        const blob = generateXLSX(entity);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entity.caption || 'entity'}_report.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
  
    return (
      <div style={{ display: 'flex', gap: '10px', marginTop: 20 }}>
        <Select
          value={exportFormat}
          onChange={setExportFormat}
          style={{ width: 120 }}
        >
          <Option value="pdf">PDF</Option>
          <Option value="xlsx">Excel</Option>
        </Select>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          {translate('Generate Report')}
        </Button>
      </div>
    );
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
        description={
          <div style={{ whiteSpace: 'pre-line' }}> {/* Pour préserver les sauts de ligne */}
            {values ? (
              Array.isArray(values) 
                ? values.map((v, index) => (
                    <div key={index} style={{ marginBottom: '8px' }}>
                      {typeof v === 'object' && v !== null
                        ? Object.entries(v)
                            .filter(([_, val]) => val !== undefined)
                            .map(([k, val]) => (
                              <div key={k} style={{ marginLeft: '16px' }}>
                                <strong>{translate(k)}:</strong> {formatComplexValue(val)}
                              </div>
                            ))
                        : key === 'country' 
                          ? getCountryLabel(v) 
                          : translate(v)
                      }
                    </div>
                  ))
                : formatComplexValue(values)
            ) : 'N/A'}
          </div>
        }
      />
    </List.Item>
               )}
              />   

          </Card>
          
          <div style={{ marginTop: 20, display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
      <Card title={translate('Risk Assessment')}>
        <RiskAssessment
          countryCode={getCountryCode(entity)}
          properties={entity.properties || {}}
          onCommentChange={handleRiskCommentChange}
        />
      </Card>
      
      {entity.uboDetails && (
        <Card title={translate('UBO Information')}>
          <UBODetails uboInfo={entity.uboDetails} />
        </Card>
      )}
    </div>
          
    <ExportButton entity={entity} />
          
        </>
      )}
    </Card>
  );
};

export default EntityDetails;