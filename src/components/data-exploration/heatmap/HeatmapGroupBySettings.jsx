import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  PlusOutlined,
  MinusOutlined,
  DownOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';
import {
  Button, Space, Menu, Dropdown,
} from 'antd';
import PropTypes from 'prop-types';

import { updatePlotConfig } from '../../../redux/actions/componentConfig';
import ReorderableList from '../../ReorderableList';

const HeatmapGroupBySettings = (props) => {
  const dispatch = useDispatch();

  const { componentType } = props;

  const groupedTracksKeys = useSelector(
    (state) => state.componentConfig[componentType].config.groupedTracks,
  );
  const cellSets = useSelector((state) => state.cellSets);

  const getCellSets = (category) => {
    if (!cellSets || cellSets.loading) {
      return [];
    }

    return cellSets.hierarchy.map(
      ({ key }) => (
        { key, name: cellSets.properties[key].name, type: cellSets.properties[key].type }
      ),
    ).filter(
      ({ type }) => category.includes(type),
    );
  };

  const getCellSetsOrder = () => {
    const allCellSetsGroupBys = getCellSets(['cellSets', 'metadataCategorical']);

    const groupedCellSets = [];

    // from the enabled cell sets keys we get, find their corresponding information
    groupedTracksKeys
      .forEach((trackKey) => {
        const groupBy = allCellSetsGroupBys
          .find((cellSetGroupBy) => cellSetGroupBy.key === trackKey);

        groupedCellSets.push(groupBy);
      });

    // About the filtering: If we have failed to find some of the groupbys information,
    // then ignore those (this is useful for groupbys that sometimes dont show up, like 'samples')
    return groupedCellSets.filter((groupedCellSet) => groupedCellSet !== undefined);
  };

  const isInitialRenderRef = useRef(true);
  const [cellSetsOrder, setCellSetsOrder] = useState(getCellSetsOrder());

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;

      return;
    }

    if (cellSetsOrder.length === 0) {
      return;
    }

    dispatch(
      updatePlotConfig(componentType, {
        groupedTracks: cellSetsOrder.map((cellSet) => cellSet.key),
      }),
    );
  }, [cellSetsOrder]);

  const indexOfCellSet = (cellSet) => cellSetsOrder.findIndex((elem) => (elem.key === cellSet.key));

  // This is so that a click on + or - buttons doesn't close the menu
  const stopPropagationEvent = (e) => e.stopPropagation();

  const menu = (
    <Menu>
      {
        getCellSets(['cellSets', 'metadataCategorical'])
          .map((cellSet) => {
            const positionInCellSetOrder = indexOfCellSet(cellSet);

            return (
              <Menu.Item key={cellSet} size='small'>
                <div onClick={stopPropagationEvent} onKeyDown={stopPropagationEvent}>
                  <Button
                    shape='square'
                    size='small'
                    style={{ marginRight: '5px' }}
                    icon={positionInCellSetOrder > -1 ? <MinusOutlined /> : <PlusOutlined />}
                    onClick={() => {
                      const newCellSetsOrder = [...cellSetsOrder];
                      if (positionInCellSetOrder > -1) {
                        // If the cell is included in the cellSet, we have to remove it
                        newCellSetsOrder.splice(positionInCellSetOrder, 1);
                      } else {
                        // If the cell is not included in the cellSet, we have to add it
                        newCellSetsOrder.push(cellSet);
                      }

                      setCellSetsOrder(newCellSetsOrder);
                    }}
                  />
                  {cellSet.name}
                </div>
              </Menu.Item>
            );
          })
      }
    </Menu>
  );

  return (
    <div style={{ padding: '5px' }}>
      <Space direction='vertical'>
        <Dropdown overlay={menu} trigger='click hover'>
          <div style={{ padding: '7px', border: '1px solid rgb(238,238,238)' }}>
            Select the parameters to group by
            <DownOutlined style={{ marginLeft: '5px' }} />
          </div>
        </Dropdown>

        <ReorderableList
          onChange={setCellSetsOrder}
          defaultList={cellSetsOrder}
          rightItem={(cellSet) => cellSet.name}
        />
      </Space>
    </div>
  );
};

HeatmapGroupBySettings.defaultProps = {
};

HeatmapGroupBySettings.propTypes = {
  componentType: PropTypes.string.isRequired,
};

export default HeatmapGroupBySettings;
