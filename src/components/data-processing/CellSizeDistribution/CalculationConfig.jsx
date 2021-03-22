import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Space,
  InputNumber,
  Form,
  Button,
  Alert,
  Radio,
} from 'antd';

import _ from 'lodash';

import BandwidthOrBinstep from '../ReadAlignment/PlotStyleMisc';

import { updateProcessingSettings } from '../../../redux/actions/experimentSettings';

const CalculationConfig = (props) => {
  const {
    experimentId, sampleId, plotType, sampleIds, onConfigChange,
  } = props;

  const config = useSelector(
    (state) => state.experimentSettings.processing.cellSizeDistribution[sampleId]?.filterSettings
      || state.experimentSettings.processing.cellSizeDistribution.filterSettings,
  );

  const FILTER_UUID = 'cellSizeDistribution';

  const dispatch = useDispatch();

  const [displayIndividualChangesWarning, setDisplayIndividualChangesWarning] = useState(false);

  const updateAllSettings = () => {
    setDisplayIndividualChangesWarning(false);

    const newConfig = {};
    sampleIds.forEach((currentSampleId) => {
      newConfig[currentSampleId] = { filterSettings: config };
    });

    dispatch(updateProcessingSettings(
      experimentId,
      FILTER_UUID,
      newConfig,
    ));

    onConfigChange();
  };

  const updateSettings = (diff) => {
    const newConfig = _.cloneDeep(config);
    _.merge(newConfig, diff);

    const sampleSpecificDiff = { [sampleId]: { filterSettings: newConfig } };

    setDisplayIndividualChangesWarning(true);
    dispatch(updateProcessingSettings(
      experimentId,
      FILTER_UUID,
      sampleSpecificDiff,
    ));

    onConfigChange();
  };

  const filtering = false;

  return (
    <>
      <Space direction='vertical' style={{ width: '100%' }} />
      {displayIndividualChangesWarning && (
        <Form.Item>
          <Alert
            message='To copy these new settings to the rest of your samples, click Copy to all samples.'
            type='info'
            showIcon
          />
        </Form.Item>
      )}

      <Radio.Group
        defaultValue='automatic'
        style={{ marginTop: '5px', marginBottom: '30px' }}
      >
        <Radio value='automatic'>
          Automatic
        </Radio>
        <Radio value='manual'>
          Manual
        </Radio>
      </Radio.Group>

      <Form.Item disabled label='Min cell size:'>
        <InputNumber
          value={config.minCellSize}
          collapsible={!filtering ? 'disabled' : 'header'}
          onChange={(value) => updateSettings({ minCellSize: value })}
          onPressEnter={(e) => updateSettings({ minCellSize: e.target.value })}
          placeholder={10800}
          step={100}
        />
      </Form.Item>
      <BandwidthOrBinstep
        config={config}
        onUpdate={updateSettings}
        type={plotType}
        max={400}
      />
      <Button onClick={updateAllSettings}>Copy to all samples</Button>
    </>
  );
};

CalculationConfig.propTypes = {
  experimentId: PropTypes.string.isRequired,
  sampleId: PropTypes.string.isRequired,
  plotType: PropTypes.string.isRequired,
  sampleIds: PropTypes.array.isRequired,
  onConfigChange: PropTypes.func.isRequired,
};

export default CalculationConfig;
