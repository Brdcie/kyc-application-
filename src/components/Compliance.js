import React from 'react';
import { Card, Typography, List, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Compliance() {
  const complianceItems = [
    { task: 'Annual KYC Review', status: 'Completed', date: '2024-05-01' },
    { task: 'AML Training', status: 'Pending', date: '2024-08-15' },
    { task: 'Risk Assessment Update', status: 'Completed', date: '2024-06-30' },
    { task: 'Regulatory Reporting', status: 'Overdue', date: '2024-07-01' },
  ];

  return (
    <Card title={<Title level={2}>Compliance Dashboard</Title>}>
      <List
        itemLayout="horizontal"
        dataSource={complianceItems}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={item.status === 'Completed' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <CloseCircleOutlined style={{ color: 'red' }} />}
              title={<Text strong>{item.task}</Text>}
              description={`Due: ${item.date}`}
            />
            <Tag color={item.status === 'Completed' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'}>
              {item.status}
            </Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}

export default Compliance;