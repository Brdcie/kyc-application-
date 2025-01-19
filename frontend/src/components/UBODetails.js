import React from 'react';
import { Card, List, Tag, Tooltip, Progress, Tabs } from 'antd';
import { UserOutlined, BankOutlined, WarningOutlined } from '@ant-design/icons';
import { translate } from '../utils/translations';

const { TabPane } = Tabs;

const UBODetails = ({ uboInfo }) => {
  const { directOwners, subsidiaries, totalIdentifiedOwnership } = uboInfo;

  const getOwnershipTag = (stake) => {
    if (stake >= 25) return 'error';
    if (stake >= 10) return 'warning';
    return 'default';
  };

  const renderOwnershipProgress = () => (
    <div style={{ marginBottom: 20 }}>
      <h4>{translate('Total Identified Ownership')}</h4>
      <Progress
        percent={Math.round(totalIdentifiedOwnership)}
        status={totalIdentifiedOwnership < 100 ? "active" : "success"}
        format={percent => `${percent}%`}
      />
      {totalIdentifiedOwnership < 100 && (
        <Tag icon={<WarningOutlined />} color="warning">
          {translate('Incomplete Ownership Information')}
        </Tag>
      )}
    </div>
  );

  return (
    <Card title={translate('Beneficial Ownership Structure')} className="ubo-details">
      {renderOwnershipProgress()}

      <Tabs defaultActiveKey="owners">
        <TabPane tab={translate('Direct Owners')} key="owners">
          <List
            itemLayout="horizontal"
            dataSource={directOwners}
            renderItem={owner => (
              <List.Item 
                actions={[
                  <Tag color={getOwnershipTag(owner.stake)}>{`${owner.stake}%`}</Tag>
                ]}
              >
                <List.Item.Meta
                  avatar={<BankOutlined />}
                  title={
                    <Tooltip title={translate('View Entity Details')}>
                      <a href={`/entities/${owner.id}`}>{owner.name}</a>
                    </Tooltip>
                  }
                  description={
                    <>
                      {owner.startDate && (
                        <Tag color="blue">{`${translate('Since')}: ${owner.startDate}`}</Tag>
                      )}
                      {owner.status && (
                        <Tag color="green">{translate(owner.status)}</Tag>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab={translate('Subsidiaries')} key="subsidiaries">
          <List
            itemLayout="horizontal"
            dataSource={subsidiaries}
            renderItem={subsidiary => (
              <List.Item>
                <List.Item.Meta
                  avatar={<UserOutlined />}
                  title={
                    <Tooltip title={translate('View Entity Details')}>
                      <a href={`/entities/${subsidiary.id}`}>{subsidiary.name}</a>
                    </Tooltip>
                  }
                  description={
                    <>
                      {subsidiary.percentage && (
                        <Tag color={getOwnershipTag(subsidiary.percentage)}>
                          {`${subsidiary.percentage}%`}
                        </Tag>
                      )}
                      {subsidiary.startDate && (
                        <Tag color="blue">{`${translate('Since')}: ${subsidiary.startDate}`}</Tag>
                      )}
                      {subsidiary.jurisdiction && (
                        <Tag color="green">{subsidiary.jurisdiction.toUpperCase()}</Tag>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default UBODetails;