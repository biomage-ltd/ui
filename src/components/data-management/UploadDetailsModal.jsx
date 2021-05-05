import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Button, Col, Row, Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadDetailsModal = (props) => {
  const {
    sampleName, fileName, pathTo, error, visible, onRetry, onReplace, onCancel,
  } = props;

  return (
    <Modal
      title='Upload error'
      visible={visible}
      onCancel={onCancel}
      width='40%'
      footer={(
        <Row style={{ width: '100%', justifyContent: 'center' }}>
          <Col>
            <Button
              type='primary'
              key='retry'
              block
              onClick={() => {
                onRetry();
              }}
              style={{ width: '140px', marginBottom: '10px' }}
            >
              Retry upload
            </Button>
          </Col>
          <Col span='2' />
          <Col>
            <Button
              type='primary'
              key='replace'
              block
              onClick={() => {
                onReplace();
              }}
              style={{ width: '140px', marginBottom: '10px' }}
            >
              Replace file
            </Button>
          </Col>
        </Row>
      )}
    >
      <div style={{ width: '100%', marginLeft: '15px' }}>
        <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
          The following file has failed to upload
        </Row>
        <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
          <Col span={5}>Sample</Col>
          <Col span={10}>{sampleName}</Col>
        </Row>
        <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
          <Col span={5}>Category</Col>
          <Col span={10}>{fileName}</Col>
        </Row>
        <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
          <Col span={5}>Filename</Col>
          <Col span={10}>{pathTo}</Col>
        </Row>
        <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
          <Col span={5}>Error</Col>
          <Col span={10}>{error}</Col>
        </Row>
        <Row style={{ marginTop: '5px', marginBottom: '5px' }}>
          <Col span={5}>Replace with</Col>
          <Col span={10} style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ marginRight: '50px' }}>/User/username/file.mtx</div>
          </Col>
          <Col>
            <Upload>
              <Button icon={<UploadOutlined />}>Select file</Button>
            </Upload>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

UploadDetailsModal.propTypes = {
  sampleName: PropTypes.string,
  fileName: PropTypes.string,
  pathTo: PropTypes.string,
  error: PropTypes.string,
  visible: PropTypes.bool,
  onRetry: PropTypes.func,
  onReplace: PropTypes.func,
  onCancel: PropTypes.func,
};

UploadDetailsModal.defaultProps = {
  sampleName: '',
  fileName: '',
  pathTo: '',
  error: '',
  visible: true,
  onRetry: null,
  onReplace: null,
  onCancel: null,
};

export default UploadDetailsModal;
