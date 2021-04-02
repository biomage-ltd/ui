import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Vega } from 'react-vega';

import PlatformError from '../PlatformError';
import generateSpec from '../../utils/plotSpecs/generateFeaturesVsUMIsScatterplot';

const FeaturesVsUMIsScatterplot = (props) => {
  const {
    config, plotData, actions,
  } = props;

  const [plotSpec, setPlotSpec] = useState(config);

  useEffect(() => {
    if (config && plotData?.length) {
      setPlotSpec(generateSpec(config, plotData));
    }
  }, [config, plotData]);

  const render = () => {
    if (!plotData?.length) {
      return (
        <PlatformError
          description='There is no data to display. Please run the filter again.'
          actionable={false}
          reason={' '}
        />
      );
    }

    return (
      <center data-testid='vega-container'>
        <Vega spec={plotSpec} renderer='canvas' actions={actions} />
      </center>
    );
  };

  return (
    <>
      { render()}
    </>
  );
};

FeaturesVsUMIsScatterplot.propTypes = {
  config: PropTypes.object.isRequired,
  plotData: PropTypes.array,
  actions: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
};

FeaturesVsUMIsScatterplot.defaultProps = {
  plotData: null,
  actions: true,
};

export default FeaturesVsUMIsScatterplot;
