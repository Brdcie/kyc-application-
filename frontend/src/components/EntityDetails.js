import React, { useState } from 'react';
import { getLocalEntity } from '../services/api';
import { Input, Button, Form, Spin, Alert, Card, List } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Item } = Form;

const EntityDetails = () => {
  const [entityId, setEntityId] = useState('');
  const [entity, setEntity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setEntityId(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setEntity(null);

    try {
      const response = await getLocalEntity(entityId);
      setEntity(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Entité non trouvée.');
      } else {
        setError('Erreur lors de la récupération de l\'entité.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!entity) return;

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Détails de l'Entité: ${entity.caption}`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Date de génération : ${new Date().toLocaleString()}`, 14, 30);
    
    doc.setFontSize(12);
    doc.text(`ID: ${entity.id || 'N/A'}`, 14, 40);
    doc.text(`Caption: ${entity.caption || 'N/A'}`, 14, 48);
    doc.text(`Schéma: ${entity.schema || 'N/A'}`, 14, 56);
    doc.text(`Referents: ${entity.referents?.join(', ') || 'N/A'}`, 14, 64);
    doc.text(`Datasets: ${entity.datasets?.join(', ') || 'N/A'}`, 14, 72);

    // Table des propriétés
    const tableColumn = ["Propriété", "Valeur"];
    const tableRows = Object.entries(entity.properties || {}).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(', ') : value
    ]);

    doc.autoTable({
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`entite_${entity.id}.pdf`);
  };

  return (
    <Card title="Rechercher une Entité par ID" style={{ maxWidth: 600, margin: 'auto' }}>
      <Form layout="inline" onFinish={handleSubmit}>
        <Item>
          <Input
            value={entityId}
            onChange={handleInputChange}
            placeholder="Entrez l'ID de l'entité"
            required
          />
        </Item>
        <Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Rechercher
          </Button>
        </Item>
      </Form>

      {loading && <Spin tip="Chargement..." style={{ marginTop: 20 }} />}
      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 20 }} />}

      {entity && (
        <Card title="Détails de l'Entité" style={{ marginTop: 20 }}>
          <p><strong>ID :</strong> {entity.id}</p>
          <p><strong>Caption :</strong> {entity.caption}</p>
          <p><strong>Type d'entité :</strong> {entity.schema}</p>
          <h4>Propriétés :</h4>
          <List
            itemLayout="horizontal"
            dataSource={Object.entries(entity.properties || {})}
            renderItem={([key, values]) => (
              <List.Item>
                <List.Item.Meta
                  title={<strong>{key} :</strong>}
                  description={values ? (Array.isArray(values) ? values.join(', ') : values) : 'N/A'}
                />
              </List.Item>
            )}
          />
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={generatePDF}
            style={{ marginTop: 20 }}
          >
            Générer PDF
          </Button>
        </Card>
      )}
    </Card>
  );
};

export default EntityDetails;