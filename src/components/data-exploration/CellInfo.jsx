import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import {
  useSelector,
} from 'react-redux';
import { Card } from 'antd';
import PropTypes from 'prop-types';

const CellInfo = (props) => {
  const { coordinates, componentType } = props;

  const cellInfo = useSelector((state) => state.cellInfo);
  const [cellInfoVisible, setCellInfoVisible] = useState(false);

  useEffect(() => {
    if (!cellInfo.cellName) {
      return;
    }
    if (cellInfo.componentType !== componentType) {
      setCellInfoVisible(false);
    } else {
      setCellInfoVisible(true);
    }
  }, [cellInfo]);

  const renderCellInfo = () => (
    <Card
      size='small'
      style={{
        zIndex: 6,
        border: 0,
        position: 'absolute',
        left: `${coordinates.current.x + 20}px`,
        top: `${coordinates.current.y + 20}px`,
        pointerEvents: 'none',
      }}
    >
      {cellInfo.cellName ? (
        <div style={{ fontSize: '0.75rem' }}>
          {`Cell id: ${cellInfo.cellName}`}
        </div>
      ) : <></>}
      {cellInfo.geneName ? (
        <div style={{ fontSize: '0.75rem' }}>
          {`Gene name: ${cellInfo.geneName}`}
        </div>
      ) : <></>}
      {cellInfo.expression !== undefined ? (
        <div style={{ fontSize: '0.75rem' }}>
          Expression Level:&nbsp;
          {parseFloat(cellInfo.expression.toFixed(3))}
        </div>
      ) : <></>}
      {cellInfo.cellSets?.length > 0 ? cellInfo.cellSets.map((cellSetName) => (
        <div style={{ fontSize: '0.75rem' }}>
          {`${_.truncate(cellSetName)}`}
        </div>
      )) : <></>}
    </Card>
  );

  if (cellInfoVisible && cellInfo.cellName && Object.keys(coordinates.current).length > 0) {
    return renderCellInfo();
  }

  return (<></>);
};

CellInfo.defaultProps = {};

CellInfo.propTypes = {
  coordinates: PropTypes.object.isRequired,
  componentType: PropTypes.string.isRequired,
};

export default CellInfo;
