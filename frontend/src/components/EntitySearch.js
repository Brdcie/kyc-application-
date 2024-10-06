// frontend/src/components/EntitySearch.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Input, Button, Form, Spin, Alert, Card } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getLocalEntitiesByCaption } from '../services/api'; // Import de la fonction
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EntitySearch = () => {
  const [entities, setEntities] = useState([]);
  const [searchCaption, setSearchCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLocalEntitiesByCaption(searchCaption);
      setEntities(response.data.results); // Assurez-vous que la structure de la réponse correspond
    } catch (err) {
     // console.error('Erreur lors de la recherche des entités :', err);
      setError('Erreur lors de la recherche des entités.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(18);
    doc.text('Résultats de la Recherche par Critères', 14, 22);

    // Date de génération
    doc.setFontSize(11);
    doc.text(`Date de génération : ${new Date().toLocaleString()}`, 14, 30);

    // Table des entités
    const tableColumn = ["ID", "Caption", "Schéma", "Referents", "Datasets"];
    const tableRows = [];

    entities.forEach(entity => {
      const entityData = [
        entity.id || 'N/A',
        entity.caption || 'N/A',
        entity.schema || 'N/A',
        entity.referents ? entity.referents.join(', ') : 'N/A',
        entity.datasets ? entity.datasets.join(', ') : 'N/A'
      ];
      tableRows.push(entityData);
    });

    doc.autoTable({
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Générer le nom du fichier avec le searchCaption
    const sanitizedCaption = searchCaption.replace(/[^a-zA-Z0-9]/g, '_') || 'resultats';
    const filename = `recherche_kyc_${sanitizedCaption}.pdf`;

    // Télécharger le PDF
    doc.save(filename);
  };

  return (
    <Card title="Recherche d'Entités par Critères">
      <Form layout="inline" onFinish={handleSearch}>
        <Form.Item>
          <Input
            value={searchCaption}
            onChange={(e) => setSearchCaption(e.target.value)}
            placeholder="Entrer le caption de l'entité"
            required
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Rechercher
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="default"
            icon={<FilePdfOutlined />}
            onClick={generatePDF}
            disabled={entities.length === 0}
          >
            Générer PDF
          </Button>
        </Form.Item>
      </Form>

      {loading && <Spin tip="Chargement..." style={{ marginTop: 20 }} />}
      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 20 }} />}

      <List
        itemLayout="horizontal"
        dataSource={entities}
        renderItem={entity => (
          <List.Item>
            <List.Item.Meta
              title={<Link to={`/entity/${entity.id}`}>{entity.caption}</Link>}
              description={
                <>
                  <p><strong>Schéma :</strong> {entity.schema || 'N/A'}</p>
                  <p><strong>Referents :</strong> {entity.referents?.join(', ') || 'N/A'}</p>
                  <p><strong>Datasets :</strong> {entity.datasets?.join(', ') || 'N/A'}</p>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default EntitySearch;
