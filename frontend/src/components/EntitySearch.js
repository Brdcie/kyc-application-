import React from 'react';
import { Link } from 'react-router-dom';
import { List, Input, Button, Form, Spin, Alert, Card } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getLocalEntitiesByCaption } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const EntitySearch = ({ setSearchResults, searchResults, searchCaption, setSearchCaption }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getLocalEntitiesByCaption(searchCaption);
      setSearchResults(response.data.results);
    } catch (err) {
      setError('Erreur lors de la recherche des entités.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Résultats de la Recherche par Critères', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Date de génération : ${new Date().toLocaleString()}`, 14, 30);
    
    const tableColumn = ["ID", "Caption", "Schéma", "Referents", "Datasets"];
    const tableRows = [];
    
    searchResults.forEach(entity => {
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
    
    const sanitizedCaption = searchCaption.replace(/[^a-zA-Z0-9]/g, '_') || 'resultats';
    const filename = `recherche_kyc_${sanitizedCaption}.pdf`;
    
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
            disabled={searchResults.length === 0}
          >
            Générer PDF
          </Button>
        </Form.Item>
      </Form>

      {loading && <Spin tip="Chargement..." style={{ marginTop: 20 }} />}
      {error && <Alert message={error} type="error" showIcon style={{ marginTop: 20 }} />}

      <List
        itemLayout="horizontal"
        dataSource={searchResults}
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