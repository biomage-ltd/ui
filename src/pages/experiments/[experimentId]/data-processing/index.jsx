import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Select, Space, Button, Typography, Progress, Row, Col, Carousel, Card,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CheckOutlined,
  CaretRightOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';

import Header from '../../../../components/Header';
import CellSizeDistribution from './filter-cells/components/CellSizeDistribution/CellSizeDistribution';
import MitochondrialContent from './filter-cells/components/MitochondrialContent/MitochondrialContent';
import Classifier from './filter-cells/components/Classifier/Classifier';
import GenesVsUMIs from './filter-cells/components/GenesVsUMIs/GenesVsUMIs';
import DoubletScores from './filter-cells/components/DoubletScores/DoubletScores';
import DataIntegration from '../../../../components/data-processing/DataIntegration/DataIntegration';
import EmbeddingPreview from './configure-embedding/components/EmbeddingPreview';
import { completeProcessingStep } from '../../../../redux/actions/experimentSettings';

const { Text } = Typography;
const { Option } = Select;

const DataProcessingPage = ({ experimentId, experimentData, route }) => {
  const steps = [
    {
      key: 'cellSizeDistribution',
      name: 'Cell size distribution filter',
      render: (key) => <CellSizeDistribution filtering key={key} />,
    },
    {
      key: 'mitoContentFilter',
      name: 'Mitochondrial content filter',
      render: (key) => <MitochondrialContent filtering key={key} />,
    },
    {
      key: 'classifierFilter',
      name: 'Classifier filter',
      render: (key) => <Classifier filtering key={key} />,
    },
    {
      key: 'genesVsUMIFilter',
      name: 'Number of genes vs UMIs filter',
      render: (key) => <GenesVsUMIs filtering key={key} />,
    },
    {
      key: 'doubletFilter',
      name: 'Doublet filter',
      render: (key) => <DoubletScores filtering key={key} />,
    },
    {
      key: 'dataIntegration',
      name: 'Data integration',
      render: (key) => <DataIntegration filtering key={key} />,
    },
    {
      key: 'comptueEmbeddingFilter',
      name: 'Compute embedding',
      render: (key, expId) => <EmbeddingPreview experimentId={expId} key={key} />,
    },
  ];

  const dispatch = useDispatch();
  const [stepIdx, setStepIdx] = useState(0);

  const completedSteps = useSelector((state) => state.experimentSettings.processing.meta.stepsDone);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.goTo(stepIdx);
    }
  }, [stepIdx]);

  const renderTitle = () => (
    <Row justify='space-between'>
      <Col span='8'>
        <Select
          value={stepIdx}
          onChange={(idx) => {
            setStepIdx(idx);
            dispatch(completeProcessingStep(experimentId, steps[stepIdx].key, steps.length));
          }}
          style={{ width: 360, fontWeight: 'bold' }}
          placeholder='Jump to a step...'
        >
          {
            steps.map(
              ({ name, key }, i) => (
                <Option
                  value={i}
                  key={key}
                  disabled={!completedSteps.has(key) && i !== stepIdx + 1}
                >

                  {completedSteps.has(key) && (
                    <>
                      <Text
                        type='success'
                      >
                        <CheckOutlined />
                      </Text>
                      <span style={{ marginLeft: '0.25rem' }}>{name}</span>
                    </>
                  )}

                  {!completedSteps.has(key) && stepIdx === i && (
                    <Text
                      type='default'
                    >
                      <CaretRightOutlined />
                      <span style={{ marginLeft: '0.25rem' }}>{name}</span>
                    </Text>
                  )}

                  {!completedSteps.has(key) && stepIdx !== i && (
                    <>
                      <Text
                        disabled
                      >
                        <EllipsisOutlined />
                      </Text>
                      <span style={{ marginLeft: '0.25rem' }}>{name}</span>
                    </>
                  )}
                </Option>
              ),
            )
          }
        </Select>
      </Col>
      <Col span='16'>
        <div style={{ float: 'right' }}>
          <Space size='large'>
            <Progress
              percent={((completedSteps.size) / steps.length) * 100}
              steps={steps.length}
              showInfo={false}
            />
            <Text type='primary'>{`${completedSteps.size} of ${steps.length} steps complete`}</Text>
            <Button
              disabled={stepIdx === 0}
              icon={<LeftOutlined />}
              onClick={() => setStepIdx(Math.max(stepIdx - 1, 0))}
            >
              Previous
            </Button>
            <Button
              type='primary'
              onClick={
                () => {
                  const newId = Math.min(stepIdx + 1, steps.length - 1);
                  setStepIdx(newId);

                  dispatch(completeProcessingStep(experimentId, steps[stepIdx].key, steps.length));
                }
              }
            >
              {stepIdx !== steps.length - 1
                ? (
                  <>
                    Next
                    <RightOutlined />
                  </>
                )
                : (
                  <>
                    <span style={{ marginRight: '0.25rem' }}>Finish</span>
                    <CheckOutlined />
                  </>
                )}
            </Button>
          </Space>
        </div>
      </Col>
    </Row>
  );

  return (
    <>
      <div style={{
        paddingLeft: 32, paddingRight: 32, display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}
      >
        <Header
          experimentId={experimentId}
          experimentData={experimentData}
          route={route}
          title='Data processing'
        />

        <Card
          title={renderTitle()}
          style={{ flex: 1 }}
        >
          <Carousel lazyLoad='ondemand' ref={carouselRef} dots={false}>
            {steps.map(({ render, key }) => render(key, experimentId))}
          </Carousel>
        </Card>
      </div>
    </>
  );
};

DataProcessingPage.propTypes = {
  experimentId: PropTypes.string.isRequired,
  experimentData: PropTypes.object.isRequired,
  route: PropTypes.string.isRequired,
};

export default DataProcessingPage;
