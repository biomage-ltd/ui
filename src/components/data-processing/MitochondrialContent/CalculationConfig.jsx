import React from 'react';
import PropTypes from 'prop-types';
import {
  Slider,
  Form,
} from 'antd';

import SliderWithInput from '../../SliderWithInput';

const MitochondrialConfig = (props) => {
  const {
    config, disabled, plotType, updateSettings,
  } = props;

  const updateSettingsForActiveMethod = (diff) => {
    // This is a temporary measure to account for the fact that
    // the pipeline is using fractions instead of percentages
    const newDiff = { ...diff };
    if (newDiff.maxFraction) {
      newDiff.maxFraction /= 100;
    }

    const realDiff = { methodSettings: { [activeMethod]: newDiff } };
    updateSettings(realDiff);
  };
  // const filtering = false;

  const activeMethod = config.method;
  const activeMethodSettings = config.methodSettings[activeMethod];

  return (
    <>
      <Form.Item label='Max percentage'>
        <SliderWithInput
          min={0}
          max={100}
          step={2}
          value={(activeMethodSettings.maxFraction * 100).toFixed(2)}
          onUpdate={(newValue) => updateSettingsForActiveMethod({ maxFraction: newValue })}
        />
      </Form.Item>
      <Form.Item label='Bin step'>
        <SliderWithInput
          min={0.1}
          max={10}
          value={config.methodSettings[activeMethod].binStep}
          onUpdate={(newValue) => updateSettingsForActiveMethod({ binStep: newValue })}
        />
      </Form.Item>
      {/* <BandwidthOrBinstep
        config={config.methodSettings[activeMethod]}
        onUpdate={updateSettingsForActiveMethod}
        type={plotType}
        min={0.1}
        max={10}
        disabled={disabled}
      /> */}
    </>
  );
};

MitochondrialConfig.propTypes = {
  updateSettings: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  plotType: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default MitochondrialConfig;
