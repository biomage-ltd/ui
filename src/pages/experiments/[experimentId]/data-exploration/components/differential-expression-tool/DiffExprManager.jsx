import React, { useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import DiffExprCompute from './DiffExprCompute';
import DiffExprResults from './DiffExprResults';

const DiffExprView = {
  results: 'results',
  compute: 'compute',
};

const DiffExprManager = (props) => {
  const {
    experimentId, view, width, height,
  } = props;

  const defaultSelected = 'Select a cell set';
  const [selectedCellSets, setSelectedCellSets] = useState({
    cellSet: defaultSelected,
    compareWith: defaultSelected,
  });

  const [currentView, setCurrentView] = useState(view);

  const onCompute = (newSelectedCellSets) => {
    if (!_.isEqual(newSelectedCellSets, selectedCellSets)) {
      setSelectedCellSets(newSelectedCellSets);
    }

    setCurrentView(DiffExprView.results);
  };

  const onGoBack = () => {
    setCurrentView(DiffExprView.compute);
  };

  if (currentView === DiffExprView.compute) {
    return (
      <DiffExprCompute
        experimentId={experimentId}
        onCompute={onCompute}
        cellSets={selectedCellSets}
      />
    );
  }
  if (currentView === DiffExprView.results) {
    return (
      <DiffExprResults
        onGoBack={onGoBack}
        cellSets={selectedCellSets}
        experimentId={experimentId}
        width={width}
        height={height}
      />
    );
  }
};

DiffExprManager.defaultProps = {
  view: DiffExprView.compute,
};

DiffExprManager.propTypes = {
  experimentId: PropTypes.string.isRequired,
  view: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};


export default DiffExprManager;
