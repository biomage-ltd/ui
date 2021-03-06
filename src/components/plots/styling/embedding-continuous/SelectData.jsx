import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Select,
} from 'antd';

const { Option, OptGroup } = Select;
const SelectData = (props) => {
  const { onUpdate, config, cellSets } = props;
  const { hierarchy, properties } = cellSets;

  const [selectOpen, setSelectOpen] = useState(false);

  const getMetadataOptions = (parent) => {
    const children = hierarchy.filter((cluster) => (
      cluster.key === parent))[0]?.children;
    return children;
  };
  const getMetadataParents = () => {
    const options = hierarchy.map(({ key }) => ({ value: key }));

    const filteredOptions = options.filter((element) => (
      properties[element.value].type === 'metadataCategorical'
    ));
    return filteredOptions;
  };
  const handleChange = (value) => {
    onUpdate({ selectedSample: value });
  };
  const parents = getMetadataParents();

  return (
    <>
      <div>
        Select the data to view on the embedding:
        {' '}
      </div>
      <Form.Item
        onFocus={() => setSelectOpen(true)}
        onBlur={() => setSelectOpen(false)}
      >
        <Select
          defaultValue={config.selectedSample}
          style={{ width: 200 }}
          onChange={(value) => {
            handleChange(value);
          }}
          open={selectOpen}

        >
          <Option value='All'>All</Option>
          {parents.map((parent) => (
            <OptGroup label={properties[parent.value].name}>
              {getMetadataOptions(parent.value).map((option) => (
                <Option value={option.key}>{properties[option.key].name}</Option>
              ))}
            </OptGroup>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};
SelectData.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  cellSets: PropTypes.object.isRequired,
};
export default SelectData;
