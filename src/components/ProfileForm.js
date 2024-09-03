import React from 'react';
import { Form, Input, Button, Select, DatePicker, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

function ProfileForm({ onSubmit }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
    onSubmit(values);
    navigate('/risk-assessment');
  };

  return (
    <Card title="Profile Information">
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="entityType" label="Entity Type" rules={[{ required: true }]}>
          <Select>
            <Option value="individual">Individual</Option>
            <Option value="company">Company</Option>
          </Select>
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Date of Birth">
          <DatePicker />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit and Perform Risk Assessment
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default ProfileForm;