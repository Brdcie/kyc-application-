// frontend/src/components/EntityPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLocalEntity } from '../services/api';
import { Spin, Alert, Card, List } from 'antd';

const EntityPage = () => {
  const { id } = useParams();
  const [entity, setEntity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const response = await getLocalEntity(id);
        setEntity(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'entité :', err);
        if (err.response && err.response.status === 404) {
          setError('Entité non trouvée.');
        } else {
          setError('Erreur lors de la récupération de l\'entité.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEntity();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Spin tip="Chargement des détails de l'entité..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon style={{ marginTop: 20 }} />;
  }

  return (
    <Card title={`Détails de l'Entité: ${entity.caption}`} style={{ maxWidth: 800, margin: 'auto', marginTop: 40 }}>
      <p><strong>ID :</strong> {entity.id || 'N/A'}</p>
      <p><strong>Caption :</strong> {entity.caption || 'N/A'}</p>
      <p><strong>Schéma :</strong> {entity.schema || 'N/A'}</p>
      <p><strong>Referents :</strong> {entity.referents?.join(', ') || 'N/A'}</p>
      <p><strong>Datasets :</strong> {entity.datasets?.join(', ') || 'N/A'}</p>
      <p><strong>First Seen :</strong> {entity.first_seen || 'N/A'}</p>
      <p><strong>Last Seen :</strong> {entity.last_seen || 'N/A'}</p>
      <p><strong>Last Change :</strong> {entity.last_change || 'N/A'}</p>
      <p><strong>Target :</strong> {entity.target ? 'Oui' : 'Non'}</p>
      <h4>Propriétés :</h4>
      <List
        itemLayout="horizontal"
        dataSource={Object.entries(entity.properties || {})}
        renderItem={([key, values]) => (
          <List.Item>
            <List.Item.Meta
              title={<strong>{key} :</strong>}
              description={values ? values.join(', ') : 'N/A'}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default EntityPage;
