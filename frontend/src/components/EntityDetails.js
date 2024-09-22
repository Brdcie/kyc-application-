// frontend/src/components/EntityDetails.js

import React, { useState } from 'react';
import { getLocalEntity } from '../services/api';
import { Input, Button, Form, Spin, Alert, Card, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

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
      console.log('Données reçues de l\'API :', response.data); // Ajout du log
      setEntity(response.data);
    } catch (err) {
      console.error('Erreur lors de l\'appel API :', err); // Ajout du log
      if (err.response && err.response.status === 404) {
        setError('Entité non trouvée.');
      } else {
        setError('Erreur lors de la récupération de l\'entité.');
      }
    } finally {
      setLoading(false);
    }
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
          <p><strong>Schéma :</strong> {entity.schema}</p>
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
      )}
    </Card>
  );
};

export default EntityDetails;
