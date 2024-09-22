// frontend/src/components/EntitySearch.js

import React, { useState } from 'react';
import { searchLocalEntities } from '../services/api';
import { Input, Button, Form, Spin, Alert, Card, List, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'; // Assurez-vous que ceci est bien importé

const { Item } = Form;

const EntitySearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await searchLocalEntities(query);
      setResults(response.data.results);
    } catch (err) {
      console.error('Erreur lors de la recherche des entités :', err);
      setError('Erreur lors de la recherche des entités.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Rechercher des Entités" style={{ maxWidth: 1000, margin: 'auto', marginTop: 40 }}>
      <Form layout="inline" onFinish={handleSubmit}>
        <Item>
          <Input
            value={query}
            onChange={handleInputChange}
            placeholder="Entrez un nom ou un critère de recherche"
            style={{ width: 400 }}
            required
          />
        </Item>
        <Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Rechercher
          </Button>
        </Item>
      </Form>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Spin tip="Recherche en cours..." />
        </div>
      )}

      {error && (
        <Alert message={error} type="error" showIcon style={{ marginTop: 20 }} />
      )}

      {results.length > 0 && (
        <List
          itemLayout="vertical"
          size="large"
          dataSource={results}
          renderItem={entity => (
            <List.Item key={entity.id}>
              <List.Item.Meta
                title={<Link to={`/entities/${entity.id}`}>{entity.caption}</Link>}
                description={`ID : ${entity.id}`}
              />
              <Table
                dataSource={Object.entries(entity.properties || {})}
                columns={[
                  {
                    title: 'Propriété',
                    dataIndex: 'key',
                    key: 'key',
                  },
                  {
                    title: 'Valeur',
                    dataIndex: 'value',
                    key: 'value',
                  },
                ]}
                pagination={false}
                rowKey="key"
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default EntitySearch;
