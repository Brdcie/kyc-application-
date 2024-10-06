// frontend/src/components/EntityPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLocalEntity } from '../services/api';
import { Spin, Alert, Card, Table, Button } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EntityPage = () => {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
       // console.log('Fetching entity with id:', id); // Log de l'ID
        const response = await getLocalEntity(id);
       // console.log('API response:', response.data); // Log de la réponse de l'API
        setEntity(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'entité :', err);
        setError(err.response?.status === 404 ? 'Entité non trouvée.' : 'Erreur lors de la récupération de l\'entité.');
      } finally {
        setLoading(false);
      }
    };
    fetchEntity();
  }, [id]);

  if (loading) return <Spin tip="Chargement..." style={{ display: 'block', margin: '20px auto' }} />;
  if (error) return <Alert message={error} type="error" showIcon style={{ margin: '20px 0' }} />;
  if (!entity) return null;

  //console.log('Entity:', entity); // Vérification des données de l'entité

  const columns = [
    { title: 'Propriété', dataIndex: 'property', key: 'property' },
    { title: 'Valeur', dataIndex: 'value', key: 'value' },
  ];

  const data = Object.entries(entity.properties || {}).map(([key, values], index) => ({
    key: index,
    property: key,
    value: Array.isArray(values) ? values.join(', ') : values || 'N/A',
  }));

  const generatePDF = () => {
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(18);
    doc.text(`Détails de l'Entité: ${entity.caption}`, 14, 22);

    // Date de génération
    doc.setFontSize(11);
    doc.text(`Date de génération : ${new Date().toLocaleString()}`, 14, 30);

    // Informations de base
    doc.setFontSize(12);
    doc.text(`ID: ${entity.id || 'N/A'}`, 14, 40);
    doc.text(`Caption: ${entity.caption || 'N/A'}`, 14, 48);
    doc.text(`Schéma: ${entity.schema || 'N/A'}`, 14, 56);
    doc.text(`Referents: ${entity.referents?.join(', ') || 'N/A'}`, 14, 64);
    doc.text(`Datasets: ${entity.datasets?.join(', ') || 'N/A'}`, 14, 72);
    doc.text(`First Seen: ${entity.first_seen || 'N/A'}`, 14, 80);
    doc.text(`Last Seen: ${entity.last_seen || 'N/A'}`, 14, 88);
    doc.text(`Last Change: ${entity.last_change || 'N/A'}`, 14, 96);
    doc.text(`Target: ${entity.target ? 'Oui' : 'Non'}`, 14, 104);

    // Table des propriétés
    doc.autoTable({
      startY: 110,
      head: [['Propriété', 'Valeur']],
      body: data.map(item => [item.property, item.value]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    // Télécharger le PDF
    doc.save(`entite_${entity.id}.pdf`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card title={`Détails de l'Entité: ${entity.caption}`} style={{ marginBottom: '20px' }}>
        <p><strong>ID :</strong> {entity.id ? <Link to={`/entity/${entity.id}`}>{entity.id}</Link> : 'N/A'}</p>
        <p><strong>Caption :</strong> {entity.caption || 'N/A'}</p>
        <p><strong>Schéma :</strong> {entity.schema || 'N/A'}</p>
        <p><strong>Referents :</strong> {entity.referents?.join(', ') || 'N/A'}</p>
        <p><strong>Datasets :</strong> {entity.datasets?.join(', ') || 'N/A'}</p>
        <p><strong>First Seen :</strong> {entity.first_seen || 'N/A'}</p>
        <p><strong>Last Seen :</strong> {entity.last_seen || 'N/A'}</p>
        <p><strong>Last Change :</strong> {entity.last_change || 'N/A'}</p>
        <p><strong>Target :</strong> {entity.target ? 'Oui' : 'Non'}</p>
      </Card>
      <Button
        type="default"
        icon={<FilePdfOutlined />}
        onClick={generatePDF}
        style={{ marginBottom: '20px' }}
      >
        Générer PDF
      </Button>
      <Card title="Propriétés">
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false} 
          bordered 
          size="small"
          style={{ width: '100%' }}
        />
      </Card>
    </div>
  );
};

export default EntityPage;
