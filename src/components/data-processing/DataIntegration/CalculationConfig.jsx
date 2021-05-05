import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Collapse,
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
  QuestionCircleOutlined,
} from '@ant-design/icons';

import _ from 'lodash';

import SeuratV4Options from './SeuratV4Options';

import { updateProcessingSettings } from '../../../redux/actions/experimentSettings';
import generateDataProcessingPlotUuid from '../../../utils/generateDataProcessingPlotUuid';

const { Option } = Select;
const { Text } = Typography;
const { Panel } = Collapse;

const CalculationConfig = (props) => {
  const {
    experimentId, onPipelineRun, disabled,
  } = props;
  const FILTER_UUID = 'dataIntegration';

  const dispatch = useDispatch();
  const { dataIntegration, dimensionalityReduction } = useSelector(
    (state) => state.experimentSettings.processing.dataIntegration,
  );

  const elbowPlotUuid = generateDataProcessingPlotUuid(null, FILTER_UUID, 1);
  const data = useSelector((state) => state.componentConfig[elbowPlotUuid]?.plotData);

  const methods = [
    {
      value: 'seuratv4',
      text: 'Seurat v4',
      disabled: false,
    },
    {
      value: 'seuratv3',
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

  const [numPCs, setNumPCs] = useState(dimensionalityReduction.numPCs);
  const [changesOutstanding, setChangesOutstanding] = useState(false);

  const updateSettings = (diff) => {
    setChangesOutstanding(true);
    dispatch(updateProcessingSettings(
      experimentId,
      FILTER_UUID,
      diff,
    ));
  };

  const runWithCurrentDataIntegrationSettings = () => {
    setChangesOutstanding(false);
    onPipelineRun();
  };

  const methodOptions = {
    seuratv4: () => (
      <SeuratV4Options
        config={dataIntegration.methodSettings.seuratv4}
        onUpdate={updateSettings}
        onChange={() => setChangesOutstanding(true)}
        disabled={disabled}
      />
    ),
  };

  const roundedVariationExplained = () => {
    const variationExplained = data?.length
      ? data.slice(0, dimensionalityReduction.numPCs).reduce(
        (acum, current) => acum + current.percentVariance, 0,
      ) : 0;
    const roundingPrecision = 2;

    return _.round(variationExplained * 100, roundingPrecision);
  };

  return (
    <Collapse defaultActiveKey={['data-integration']}>
      <Panel header='Data Integration' key='data-integration'>
        <Space direction='vertical' style={{ width: '100%' }} />
        <Form size='small'>
          {changesOutstanding && (
            <Form.Item>
              <Alert
                message='Your changes are not yet applied. To rerun data integration, click Apply.'
                type='warning'
                showIcon
              />
            </Form.Item>
          )}
          <Form.Item>
            <Text>
              <strong style={{ marginRight: '0.5rem' }}>Data integration settings:</strong>
              <Tooltip title='Integration of multiple samples corrects for batch effect. These methods identify shared cell states that are present across different datasets, even if they were collected from different individuals, experimental conditions, technologies, or even species. The user selects the integration method and sets the controls, as appropriate. The latest Seurat method is selected as default.'>
                <QuestionCircleOutlined />
              </Tooltip>
            </Text>
          </Form.Item>
          <div style={{ paddingLeft: '1rem' }}>
            <Form.Item
              label='Method:'
            >
              <Select
                value={dataIntegration.method}
                onChange={(val) => updateSettings({ dataIntegration: { method: val } })}
                disabled={disabled}
              >
                {
                  methods.map((el) => (
                    <Option key={el.text} value={el.value} disabled={el.disabled}>{el.text}</Option>
                  ))
                }
              </Select>
            </Form.Item>

            {
              methodOptions[dataIntegration.method]()
            }

          </div>
          <Form.Item>
            <Text>
              <strong style={{ marginRight: '0.5rem' }}>Dimensionality reduction settings:</strong>
              <Tooltip title='Dimensionality reduction is necessary to summarise and visualise single cell RNA-seq data. The most common method is Principal Component Analysis. The user sets the number of Principal Components (PCs). This is the number that explains the majority of the variation within the dataset (ideally >90%), and is typically set between 5 and 30.'>
                <QuestionCircleOutlined />
              </Tooltip>
            </Text>
          </Form.Item>
          <div style={{ paddingLeft: '1rem' }}>
            <Form.Item label='Number of Principal Components'>
              <InputNumber
                value={numPCs}
                max={data?.length || 100}
                min={0}
                onChange={(value) => {
                  setChangesOutstanding(true);
                  setNumPCs(value);
                }}
                onPressEnter={(e) => e.preventDefault()}
                onStep={(value) => updateSettings({ dimensionalityReduction: { numPCs: value } })}
                onBlur={(e) => updateSettings(
                  { dimensionalityReduction: { numPCs: parseInt(e.target.value, 0) } },
                )}
                disabled={disabled}
              />
            </Form.Item>
            <Form.Item label='% variation explained'>
              <InputNumber
                value={roundedVariationExplained()}
                disabled={disabled}
                readOnly
              />
            </Form.Item>
            <Form.Item label='Exclude genes categories'>
              <Tooltip title='Normalization can be biased by certain gene categories such the ones listed here.
              Checking them will ignore those categories.
              For example, cell cycle genes should be removed if sampling timepoints occured throughout the day. 
              Those genes can otherwise introduces within-cell-type heterogeneity that can obscure the differences 
              in expression between cell types.
              This is not implemented yet'>
                <QuestionCircleOutlined />
              </Tooltip>
              <Checkbox.Group
                onChange={(val) => updateSettings(
                  { dimensionalityReduction: { excludeGeneCategories: val } },
                )}
                value={dimensionalityReduction.excludeGeneCategories}
                disabled={disabled}
              >
                <Space direction='vertical'>
                  <Checkbox value='ribosomal'>ribosomal</Checkbox>
                  <Checkbox value='mitochondrial'>mitochondrial</Checkbox>
                  <Checkbox value='cellCycle'>cell cycle</Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
            <Form.Item label={(
              <span>
                Method&nbsp;
                <Tooltip overlay={(
                  <span>
                    To integrate data, dimensional reduction is performed to find so called "anchors".
                    cross-dataset pairs of cells that are in a matched biological state (‘anchors’), can are both to correct for technical
                    differences between datasets
                    (i.e. batch effect correction), and to perform comparative scRNA-seq analysis across experimental conditions.
                    CCA is well-suitedn cell types are conserved, but there are very substantial differences
                    in gene expression across experiments.
                    However, CCA-based integration may also lead to overcorrection, especially when a large proportion of cells are
                    non-overlapping across datasets.

                    RPCA-based integration runs significantly faster, and also represents a more conservative approach where
                    cells in different biological states are less likely to ‘align’ after integration.
                    More info
                    <a
                      href='https://satijalab.org/seurat/articles/integration_rpca.html'
                      target='_blank'
                      rel='noreferrer'
                    >
                      {' '}
                      <code>here</code>
                    </a>
                  </span>
                )}
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            )}
            >
              <Select
                value={dimensionalityReduction.method}
                onChange={(val) => updateSettings({ dimensionalityReduction: { method: val } })}
                disabled={disabled}
              >
                <Option key='rpca' value='rpca'>Reciprocal PCA (RPCA)</Option>
                <Option key='cca' value='cca'>Cannonical Correlation Analysis (CCA)</Option>
              </Select>

            </Form.Item>
            <Form.Item>
              <Row>
                <Col span={6}>
                  <Tooltip title={!changesOutstanding ? 'No outstanding changes' : ''}>
                    <Button
                      size='small'
                      type='primary'
                      htmlType='submit'
                      disabled={!changesOutstanding}
                      onClick={runWithCurrentDataIntegrationSettings}
                    >
                      Run
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            </Form.Item>
          </div>
        </Form>
      </Panel>
    </Collapse >
  );
};

CalculationConfig.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onPipelineRun: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

CalculationConfig.defaultProps = {
  disabled: false,
};

export default CalculationConfig;
