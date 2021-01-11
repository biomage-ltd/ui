import React, { useState, useEffect } from 'react';
import {
  useSelector, useDispatch,
} from 'react-redux';

import {
  Button, Form, Select, Typography, Tooltip, Radio, Space,
} from 'antd';

import PropTypes from 'prop-types';
import _ from 'lodash';
import { loadCellSets } from '../../../../../../redux/actions/cellSets';

import composeTree from '../../../../../../utils/composeTree';

const { Text } = Typography;

const { Option, OptGroup } = Select;

const DiffExprCompute = (props) => {
  const {
    experimentId, onCompute, cellSets,
  } = props;

  const ComparisonType = Object.freeze({ between: 'between', within: 'within' });

  const dispatch = useDispatch();

  const properties = useSelector((state) => state.cellSets.properties);
  const hierarchy = useSelector((state) => state.cellSets.hierarchy);
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState(cellSets);

  const [diffExprType, setDiffExprType] = useState(ComparisonType.between);

  /**
   * Loads cell set on initial render if it does not already exist in the store.
   */
  useEffect(() => {
    dispatch(loadCellSets(experimentId));
  }, []);


  /**
   * Re-renders the list of selections when the hierarchy or the properties change.
   *
   * If the cell set previously selected is deleted, the selection is reset to the default.
   */
  useEffect(() => {
    if (hierarchy.length === 0) return;

    setSelectedGroups(_.mapValues(selectedGroups, (cellSetKey) => {
      if (cellSetKey && !properties[cellSetKey]) {
        return null;
      }

      return cellSetKey;
    }));
  }, [hierarchy, properties]);

  const validateForm = () => {
    if (!selectedGroups.cellSet) {
      setIsFormValid(false);
      return;
    }

    if (!selectedGroups.compareWith) {
      setIsFormValid(false);
      return;
    }

    if (!selectedGroups.basis) {
      setIsFormValid(false);
      return;
    }

    setIsFormValid(true);
  };

  // Validate form when the groups selected changes.
  useEffect(() => {
    validateForm();
  }, [selectedGroups]);

  // Erase selection when a different type of comparison is selected.
  useEffect(() => {

  }, [diffExprType])

  /**
   * Updates the selected clusters.
   * @param {string} cellSet The key of the cell set.
   * @param {string} option The option string (`cellSet` or `compareWith`).
   */
  const onSelectCluster = (cellSet, option) => {
    console.log({
      ...selectedGroups,
      [option]:
        cellSet,
    });
    setSelectedGroups({
      ...selectedGroups,
      [option]:
        cellSet,
    });
  };

  /**
   * Constructs a form item, a `Select` field with selectable clusters.
   */
  const renderClusterSelectorItem = ({
    title, option, filterType,
  }) => {
    // Dependiung on the cell set type specified, set the default name
    const placeholder = `Select a ${filterType === 'metadataCategorical' ? 'sample/group' : 'cell set'}`;

    // Get all the stuff we are going to show.
    const tree = composeTree(hierarchy, properties, filterType);

    const renderChildren = (rootKey, children) => {
      if (!children || children.length === 0) { return (<></>); }

      // If this is the `compareWith` option, we need to add `the rest` under the group previously selected.
      if (option === 'compareWith' && selectedGroups.cellSet?.startsWith(`${rootKey}/`)) {
        children.unshift({ key: `rest`, name: `Rest of ${properties[rootKey].name}` });
      }

      const shouldDisable = (key) => {
        // Should always disable something already selected.
        if (Object.values(selectedGroups).includes(key)) {
          return true;
        }

        // Should disable everything in `compareWith` that is not under the same root group as `cellSet`.
        if (option === 'compareWith' && !selectedGroups.cellSet?.startsWith(`${rootKey}/`)) {
          return true;
        }

        return false;
      }

      if (selectedGroups) {
        return children.map(({ key, name }) => {
          const uniqueKey = `${rootKey}/${key}`;

          return <Option key={uniqueKey} disabled={shouldDisable(uniqueKey)}>
            {name}
          </Option>
        });
      }
    };

    return (
      <Form.Item label={title}>
        <Select
          placeholder={placeholder}
          style={{ width: 200 }}
          onChange={(cellSet) => onSelectCluster(cellSet, option)}
          value={selectedGroups[option]}
          size='small'
        >
          {
            option === 'basis' &&
            <Option key='all'>
              All
              </Option>
          }
          {
            option === 'compareWith' &&
            <Option key='background'>
              All other cells
              </Option>
          }
          {
            tree && tree.map(({ key, children }) => (
              <OptGroup label={properties[key]?.name} key={key}>
                {renderChildren(key, [...children])}
              </OptGroup>
            ))
          }
        </Select>
      </Form.Item>
    );
  };

  const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
  };

  return (
    <Form size='small' layout='vertical'>

      <Radio.Group onChange={(e) => {
        setDiffExprType(e.target.value);
        setSelectedGroups({
          cellSet: null,
          compareWith: null,
          basis: null,
        });
      }} value={diffExprType}>
        <Radio style={radioStyle} value={ComparisonType.between}>
          Compare a selected cell set between samples/groups
        </Radio>
        <Radio style={radioStyle} value={ComparisonType.within}>
          Compare cell sets within a sample/group
        </Radio>
      </Radio.Group>

      {diffExprType === ComparisonType.between
        ? (
          <>
            {renderClusterSelectorItem({
              title: 'Compare cell set:',
              option: 'basis',
              filterType: 'cellSets',
            })}

            {renderClusterSelectorItem({
              title: 'between sample/group:',
              option: 'cellSet',
              filterType: 'metadataCategorical',
            })}

            {renderClusterSelectorItem({
              title: 'and sample/group:',
              option: 'compareWith',
              filterType: 'metadataCategorical',
            })}
          </>
        )
        : (
          <>
            {renderClusterSelectorItem({
              title: 'Compare cell set:',
              option: 'cellSet',
              filterType: 'cellSets',
            })}

            {renderClusterSelectorItem({
              title: 'and cell set:',
              option: 'compareWith',
              filterType: 'cellSets',
            })}

            {renderClusterSelectorItem({
              title: 'within sample/group:',
              option: 'basis',
              filterType: 'metadataCategorical',
            })}
          </>
        )}

      <p>
        <Text type='secondary'>
          Cite
          {' '}
          <a href='https://github.com/kharchenkolab/conos/blob/master/man/Conos.Rd'>
            Conos$getDifferentialGenes
          </a>
          {' '}
          as appropriate.
        </Text>
      </p>

      <Form.Item>
        <Button
          size='small'
          disabled={!isFormValid}
          onClick={() => onCompute(selectedGroups)}
        >
          Compute
        </Button>
      </Form.Item>
    </Form>
  );
};

DiffExprCompute.defaultProps = {
};

DiffExprCompute.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onCompute: PropTypes.func.isRequired,
  cellSets: PropTypes.object.isRequired,
};

export default DiffExprCompute;
