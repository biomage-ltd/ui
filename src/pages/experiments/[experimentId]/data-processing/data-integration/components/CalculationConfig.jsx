import React from 'react';

import {
  Space,
  Select,
  InputNumber,
  Form,
  Checkbox,
  Tooltip,
  Button,
  Typography,
  Alert,
  Row,
  Col,
} from 'antd';

import {
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

const CalculationConfig = () => {
  const methodOptions = [
    {
      value: 'seuratV4',
      text: 'Seurat v4',
      disabled: false,
    },
    {
      value: 'seuratV3',
      text: 'Seurat v3',
      disabled: true,
    },
    {
      value: 'harmony',
      text: 'Harmony',
      disabled: true,
    },
    {
      value: 'conos',
      text: 'Conos',
      disabled: true,
    },
    {
      value: 'liger',
      text: 'Liger',
      disabled: true,
    },
    {
      value: 'fastMNN',
      text: 'Fast MNN',
      disabled: true,
    },
  ];

  const changesOutstanding = false;

  return (
    <>
      <Space direction='vertical' style={{ width: '100%' }} />
      <Form size='small'>
        <Form.Item>
          <Text>
            <span style={{ marginRight: '0.5rem' }}>Set the parameters for Data Integration</span>
            <Tooltip title='Integration of multiple samples corrects for batch effect. These methods identify shared cell states that are present across different datasets, even if they were collected from different individuals, experimental conditions, technologies, or even species. The user selects the integration method and sets the controls, as appropriate. The latest Seurat method is selected as default.'>
              <Button icon={<InfoCircleOutlined />} />
            </Tooltip>
          </Text>
        </Form.Item>
        <div style={{ paddingLeft: '1rem' }}>
          <Form.Item
            label='Method:'
          >
            <Select
              defaultValue='seuratV4'
            >
              {
                methodOptions.map((el) => (
                  <Option value={el.value} disabled={el.disabled}>{el.text}</Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item label='# of genes:'>
            <InputNumber
              defaultValue={2000}
              step={100}
              min={1}
            />
          </Form.Item>
          <Form.Item label='Normalisation:'>
            <Select
              defaultValue='logNormalise'
            >
              <Option value='logNormalise'>LogNormalise</Option>
              <Option value='scTransform'>SCTransform</Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item>
          <Text>
            <span style={{ marginRight: '0.5rem' }}>Set the parameters for Dimensionality Reduction</span>
            <Tooltip title='Dimensionality reduction is necessary to summarise and visualise single cell RNA-seq data. The most common method is Principal Component Analysis. The user sets the number of Principal Components (PCs). This is the number that explains the majority of the variation within the dataset (ideally >90%), and is typically set between 5 and 30.'>
              <Button icon={<InfoCircleOutlined />} />
            </Tooltip>
          </Text>
        </Form.Item>
        <div style={{ paddingLeft: '1rem' }}>
          <Form.Item label='Number of Principal Components'>
            <InputNumber
              defaultValue={10}
            />
          </Form.Item>
          <Form.Item label='% variation explained'>
            <InputNumber
              value={10}
              readOnly
            />
          </Form.Item>
          <Form.Item label='Exclude genes categories:'>
            <Checkbox.Group>
              <Space direction='vertical'>
                <Checkbox value='ribosomal'>ribosomal</Checkbox>
                <Checkbox value='mitochondrial'>mitochondrial</Checkbox>
                <Checkbox value='cellCycle'>cell cycle</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label='Method:'>
            <Select
              defaultValue='rpca'
            >
              <Option value='rpca'>Reciprocal PCA (RPCA)</Option>
              <Option value='cca'>Cannonical Correlation Analysis (CCA)</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Row>
              <Col span={6}>
                <Button size='large' type='primary' htmlType='submit' disabled={!changesOutstanding} onClick={() => { }}>Run</Button>
              </Col>
              <Col span={18}>
                {changesOutstanding && (
                  <Alert
                    message='The settings changes are not reflected in the plots - click run to update the plots.'
                    type='warning'
                    showIcon
                  />
                )}
              </Col>
            </Row>
          </Form.Item>
        </div>
      </Form>
    </>
  );
};

export default CalculationConfig;
