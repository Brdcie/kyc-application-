import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Input, Button, Form, Spin, Card } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getEntitiesByCaption } from '../services/api';
import { translate } from '../utils/translations';
import { getCountryLabel } from '../utils/countryMappings';
import { getDataSourcesLabel } from '../utils/dataSourcesMappings';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import debounce from 'lodash/debounce';

const EntitySearch = ({ dataSource }) => {
  const [state, setState] = useState({
    searchCaption: '',
    searchResults: [],
    loading: false,
    error: ''
  });

  const { searchCaption, searchResults, loading} = state;

  const handleSearch = async () => {
    if (!searchCaption.trim()) {
      setState(prevState => ({
        ...prevState,
        error: translate('Please enter a search term')
      }));
      return;
    }
  
    setState(prevState => ({
      ...prevState,
      loading: true,
      error: ''
    }));
  
    try {
      // Construire l'URL pour la requête
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const endpoint = `${backendUrl}/api/entities/search?q=${searchCaption}`;
      console.log("URL API appelée :", endpoint); // Log pour vérifier l'URL appelée
  
      // Envoyer la requête
      const response = await getEntitiesByCaption(searchCaption, dataSource);
      console.log("Statut de la réponse :", response?.status || 'Pas de statut'); // Vérifie le statut HTTP
      console.log("Réponse complète :", response); // Log complet pour déboguer
  
      if (response?.data?.results && Array.isArray(response.data.results)) {
        setState(prevState => ({
          ...prevState,
          searchResults: response.data.results,
          loading: false
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error("Erreur lors de l'appel API :", err.message || err); // Log des erreurs
      setState(prevState => ({
        ...prevState,
        error: err.message === 'Invalid response format' 
          ? translate('Invalid response format')
          : translate('Error searching entities'),
        searchResults: [],
        loading: false
      }));
    }
  };
  


  const debouncedHandleInputChange = debounce((value) => {
    setState(prevState => ({ ...prevState, searchCaption: value }));
  }, 500);

  const generatePDF = () => {
    if (!searchResults.length) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    addHeader(doc);
    addTable(doc);

    const sanitizedCaption = searchCaption.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'resultats';
    const filename = `recherche_kyc_${sanitizedCaption}.pdf`;

    doc.save(filename);
  };

  const addHeader = (doc) => {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`${translate('Search Criteria')}: ${searchCaption}`, 14, 10);
    doc.text(`${translate('Page')} ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - 20, 10);
  };

  const addTable = (doc) => {
    const tableColumn = [
      translate('id'),
      translate('caption'),
      translate('schema'),
      translate('referents'),
      translate('datasets'),
      translate('country')
    ];

    const tableRows = searchResults.map(entity => {
      const country = entity.properties?.country || entity.country;
      const datasets = entity.datasets?.map(dataset => getDataSourcesLabel(dataset)).join(', ') || 'N/A'; // Map dataset codes to labelsconst datasets = entity.datasets?.map(dataset || entity.dataSource;
      return [
        entity.id || 'N/A',
        entity.caption || 'N/A',
        translate(entity.schema) || 'N/A',
        entity.referents?.join(', ') || 'N/A',
        datasets, // Use mapped datasets
        getCountryLabel(country) || 'N/A'
      ];
    });

    doc.autoTable({
      startY: 35,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      didDrawPage: function(data) {
        addHeader(doc);
      }
    });
  };

  const EntityListItem = ({ entity }) => {
    const country = entity.properties?.country || entity.country;
    const datasets = entity.datasets?.map(dataset => getDataSourcesLabel(dataset)).join(', ') || 'N/A'; // Map dataset codes to labels
    return (
      <List.Item>
        <List.Item.Meta
          title={<Link to={`/details/${entity.id}`}>{entity.caption}</Link>}
          description={
            <>
              <p><strong>{translate('schema')} :</strong> {translate(entity.schema) || 'N/A'}</p>
              <p><strong>{translate('referents')} :</strong> {entity.referents?.join(', ') || 'N/A'}</p>
              <p><strong>{translate('datasets')} :</strong> {datasets}</p>
              <p><strong>{translate('country')} :</strong> {getCountryLabel(country) || 'N/A'}</p>
            </>
          }
        />
      </List.Item>
    );
  };

  return (
    <Card title={translate('Entity Search by Criteria')}>
      <Form layout="inline" onFinish={handleSearch}>
        <Form.Item>
          <Input
            value={searchCaption}
            onChange={(e) => debouncedHandleInputChange(e.target.value)}
            placeholder={translate('Enter entity caption')}
            required
          />
        </Form.Item>
        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SearchOutlined />}
            disabled={loading}
          >
            {translate('Search')}
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="default"
            icon={<FilePdfOutlined />}
            onClick={generatePDF}
            disabled={searchResults.length === 0}
          >
            {translate('Generate PDF')}
          </Button>
        </Form.Item>
      </Form>

      {loading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin tip={translate('Loading...')} size="large">
            <div className="content" style={{ padding: '50px' }} />
          </Spin>
         </div>
      )}

      {searchResults.length > 0 && (
        <List
          style={{ marginTop: 20 }}
          itemLayout="horizontal"
          dataSource={searchResults}
          renderItem={entity => <EntityListItem entity={entity} />}
        />
      )}
    </Card>
  );
};

export default EntitySearch;
