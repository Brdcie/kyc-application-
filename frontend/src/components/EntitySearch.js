import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Input, Button, Form, Spin, Alert, Card } from 'antd';
import { SearchOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getLocalEntitiesByCaption } from '../services/api';
import { translate } from '../utils/translations';
import { getCountryLabel } from '../utils/countryMappings';
import { getDataSourcesLabel } from '../utils/dataSourcesMappings';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import debounce from 'lodash/debounce';

const EntitySearch = () => {
  const [state, setState] = useState({
    searchCaption: '',
    searchResults: [],
    loading: false,
    error: ''
  });

  const { searchCaption, searchResults, loading, error } = state;

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
      const response = await getLocalEntitiesByCaption(searchCaption);
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

      {loading && <Spin tip={translate('Loading...')} style={{ marginTop: 20 }} />}
      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginTop: 20 }} 
        />
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
