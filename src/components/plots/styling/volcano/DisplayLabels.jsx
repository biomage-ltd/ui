import React from 'react';
import PropTypes from 'prop-types';
import {
  Slider, Form, Space,
} from 'antd';
import useUpdateThrottled from '../../../../utils/customHooks/useUpdateThrottled';

const DisplayLabels = (props) => {
  const {
    config, onUpdate, min, max,
  } = props;
  const [newConfig, handleChange] = useUpdateThrottled(onUpdate, config);

  return (
    <Space direction='vertical' style={{ width: '80%' }}>
      <Form
        size='small'
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 12 }}
      >
        <p><strong>Display Gene Labels Above (-log10 pvalue)</strong></p>

        <Form.Item
          label='Width'
        >
          <>  </>
          <Slider
            value={newConfig.textThresholdValue}
            min={min}
            max={max}
            onChange={(value) => {
              handleChange({ textThresholdValue: value });
            }}
          />
        </Form.Item>
      </Form>
    </Space>
  );
};

DisplayLabels.propTypes = {
  config: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};

export default DisplayLabels;
