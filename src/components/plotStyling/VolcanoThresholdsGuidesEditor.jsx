import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form, InputNumber, Checkbox, Space, Select, Typography,
} from 'antd';
import ColorPicker from '../ColorPicker';

const { Option } = Select;
const { Text } = Typography;

const ColorPickerOption = (props) => {
  // See the z index here:
  // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less#L332
  // This ensures that the color selector is on top of any dropdown it may be embedded into.
  const COLOR_PICKER_Z_INDEX = 1050;

  const {
    onUpdate, configType, text, config,
  } = props;

  return (
    <Space>
      <span>
        {text}
      </span>
      <ColorPicker
        onColorChange={((color) => {
          onUpdate({
            [configType]: color,
          });
        })}
        color={config[configType]}
        zIndex={COLOR_PICKER_Z_INDEX}
      />
    </Space>
  );
};

ColorPickerOption.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  configType: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

const VolcanoThresholdsGuidesEditor = (props) => {
  const { onUpdate, config } = props;

  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const colorPickerOptions = [
    {
      config: 'pvalueThresholdColor',
      name: 'p-value guide',
    },
    {
      config: 'logFoldChangeThresholdColor',
      name: 'fold change guide',
    },
  ];

  return (
    <>
      <Form
        size='small'
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 12 }}
      >
        <p><strong>Significance Thresholds</strong></p>
        <Form.Item
          label={(
            <span>
              -log10(pvalue)
            </span>
          )}
        >
          <Space direction='vertical' style={{ width: '100%' }}>
            <Space>
              <InputNumber
                min={0}
                defaultValue={config.negLogpValueThreshold}
                step={1}
                type='number'
                onPressEnter={(e) => {
                  const value = parseFloat(e.target.value);
                  onUpdate({ negLogpValueThreshold: value });
                }}
              />
              <Checkbox
                checked={config.showpvalueThresholdGuides}
                onChange={(e) => {
                  onUpdate({ showpvalueThresholdGuides: e.target.checked });
                }}
              >
                Show Guideline
              </Checkbox>
            </Space>
            <Text type='secondary'>
              Equivalent to p &lt;
              {' '}
              {(10 ** (-1 * config.negLogpValueThreshold)).toExponential(3)}
            </Text>
          </Space>
        </Form.Item>

        <Form.Item
          label={(
            <span>
              Fold change
              {' '}
              <em>(log2)</em>
            </span>
          )}
        >
          <Space>
            <InputNumber
              min={0}
              defaultValue={config.logFoldChangeThreshold}
              onPressEnter={(e) => {
                onUpdate({ logFoldChangeThreshold: e.target.value });
              }}
            />
            <Checkbox
              checked={config.showLogFoldChangeThresholdGuides}
              onChange={(e) => {
                onUpdate({ showLogFoldChangeThresholdGuides: e.target.checked });
              }}
            >
              Show Guideline
            </Checkbox>
          </Space>
        </Form.Item>

        <div>Guideline Design</div>
        <Form.Item
          label='Width'
        >
          <InputNumber
            min={1}
            defaultValue={config.thresholdGuideWidth}
            onPressEnter={(e) => {
              onUpdate({ thresholdGuideWidth: e.target.value });
            }}
          />
        </Form.Item>
        <Form.Item
          label='Colors'
        >
          <Select
            value='Browse...'
            style={{ width: 200 }}
            onChange={() => false}
            open={colorPickerOpen}
            onFocus={() => setColorPickerOpen(true)}
            onBlur={() => setColorPickerOpen(false)}
          >
            {colorPickerOptions.map(({ config: configName, name: text }) => (
              <Option value={configName}>
                <ColorPickerOption
                  text={text}
                  config={config}
                  onUpdate={onUpdate}
                  configType={configName}
                />
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </>
  );
};

VolcanoThresholdsGuidesEditor.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default VolcanoThresholdsGuidesEditor;
