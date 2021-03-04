import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Space,
  Select,
  Slider,
  Form,
  Button,
  Alert,
} from 'antd';

import _ from 'lodash';

import BandwidthOrBinstep from '../ReadAlignment/PlotStyleMisc';

import { updateProcessingSettings } from '../../../redux/actions/experimentSettings';

const { Option } = Select;

const CalculationConfig = (props) => {
  const {
    experimentId, sampleId, sampleIds,
  } = props;

  const config = useSelector(
    (state) => state.experimentSettings.processing.mitochondrialContent[sampleId]
      || state.experimentSettings.processing.mitochondrialContent.filterSettings,
  );

  const FILTER_UUID = 'mitochondrialContent';

  const dispatch = useDispatch();

  const [individualChangesWarningEnabled, setIndividualChangesWarningEnabled] = useState(false);

  const updateAllSettings = () => {
    setIndividualChangesWarningEnabled(false);

    const newConfig = {};
    sampleIds.forEach((currentSampleId) => {
      newConfig[currentSampleId] = config;
    });

    dispatch(updateProcessingSettings(
      experimentId,
      FILTER_UUID,
      newConfig,
    ));
  };

  const updateSettingsForActiveMethod = (diff) => {
    const realDiff = { methodSettings: { [activeMethod]: diff } };

    const newConfig = _.cloneDeep(config);
    _.merge(newConfig, realDiff);

    const sampleSpecificDiff = {};
    sampleSpecificDiff[sampleId] = newConfig;

    setIndividualChangesWarningEnabled(true);
    dispatch(updateProcessingSettings(
      experimentId,
      FILTER_UUID,
      sampleSpecificDiff,
    ));
  };

  const filtering = false;

  const activeMethod = config.method;

  console.log('configDebug');
  console.log(config);

  return (
    <>
      <Space direction='vertical' style={{ width: '100%' }} />
      <Form.Item label='Method:'>
        <Select
          value={activeMethod}
          style={{ width: 200 }}
          collapsible={!filtering ? 'disabled' : 'header'}
        >
          <Option value='absolute_threshold'>Absolute threshold</Option>
          <Option value='option2'>option2</Option>
          <Option value='option3'>option3</Option>
        </Select>
      </Form.Item>
      <Form.Item label='Max fraction:'>
        <Slider
          value={config.methodSettings[activeMethod].maxFraction}
          min={0}
          max={1}
          step={0.05}
          collapsible={!filtering ? 'disabled' : 'header'}
          onChange={(val) => updateSettingsForActiveMethod({ maxFraction: val })}
        />
      </Form.Item>
      <BandwidthOrBinstep
        config={config.methodSettings[activeMethod]}
        onUpdate={updateSettingsForActiveMethod}
        type='bin step'
      />
      <Button onClick={updateAllSettings}>Apply settings to all samples</Button>
      {individualChangesWarningEnabled && (
        <Form.Item>
          <Alert
            message='Your changes are only applied to this sample. To apply it to all other samples, click Apply settings to all samples.'
            type='warning'
            showIcon
          />
        </Form.Item>
      )}
    </>
  );
};

CalculationConfig.propTypes = {
  experimentId: PropTypes.string.isRequired,
  sampleId: PropTypes.string.isRequired,
  plotType: PropTypes.string.isRequired,
  sampleIds: PropTypes.array.isRequired,
};

export default CalculationConfig;
