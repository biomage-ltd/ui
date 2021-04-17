import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {
  Row, Col, Space, PageHeader, Collapse, Empty, Alert, Skeleton,
} from 'antd';

import CalculationConfig from './CalculationConfig';
import MiniPlot from '../../plots/MiniPlot';

import CategoricalEmbeddingPlot from '../../plots/CategoricalEmbeddingPlot';
import DoubletScoresPlot from '../../plots/DoubletScoresPlot';
import MitochondrialContentPlot from '../../plots/MitochondrialContentPlot';

import {
  updatePlotConfig,
  loadPlotConfig,
  savePlotConfig,
} from '../../../redux/actions/componentConfig';

import PlotStyling from '../../plots/styling/PlotStyling';
import { filterCells } from '../../../utils/plotSpecs/generateEmbeddingCategoricalSpec';
import { updateCellSetsClustering } from '../../../redux/actions/cellSets';
import { updateProcessingSettings } from '../../../redux/actions/experimentSettings';
import generateDataProcessingPlotUuid from '../../../utils/generateDataProcessingPlotUuid';

const { Panel } = Collapse;

const ConfigureEmbedding = (props) => {
  const { experimentId, onPipelineRun } = props;
  const [plot, setPlot] = useState(null);
  const cellSets = useSelector((state) => state.cellSets);
  const { selectedConfigureEmbeddingPlot: selectedPlot } = useSelector((state) => state.experimentSettings.processing.meta);
  const filterName = 'configureEmbedding';

  const router = useRouter();
  const dispatch = useDispatch();
  const debounceSave = useCallback(
    _.debounce((plotUuid) => dispatch(savePlotConfig(experimentId, plotUuid)), 2000), [],
  );

  const debouncedCellSetClustering = useCallback(
    _.debounce((resolution) => dispatch(updateCellSetsClustering(experimentId, resolution)), 2000),
    [],
  );

  const plots = {
    cellCluster: {
      title: 'Colored by CellSets',
      plotUuid: generateDataProcessingPlotUuid(null, filterName, 0),
      plotType: 'embeddingPreviewByCellSets',
      plot: (config, plotData, actions) => (
        <CategoricalEmbeddingPlot
          experimentId={experimentId}
          config={config}
          plotData={plotData}
          actions={actions}
        />
      )
      ,
    },
    sample: {
      title: 'Colored by Samples',
      plotUuid: generateDataProcessingPlotUuid(null, filterName, 1),
      plotType: 'embeddingPreviewBySample',
      plot: (config, plotData, actions) => (
        <CategoricalEmbeddingPlot
          experimentId={experimentId}
          config={{
            ...config,
            selectedCellSet: 'sample',
          }}
          plotData={plotData}
          actions={actions}
        />
      ),
    },
    mitochondrialContent: {
      title: 'Mitochondrial fraction reads',
      plotUuid: generateDataProcessingPlotUuid(null, filterName, 2),
      plotType: 'embeddingPreviewMitochondrialContent',
      plot: (config, plotData, actions) => (
        <MitochondrialContentPlot
          experimentId={experimentId}
          config={config}
          plotData={plotData}
          actions={actions}
        />
      ),
    },
    doubletScores: {
      title: 'Cell doublet score',
      plotUuid: generateDataProcessingPlotUuid(null, filterName, 3),
      plotType: 'embeddingPreviewDoubletScore',
      plot: (config, plotData, actions) => (
        <DoubletScoresPlot
          experimentId={experimentId}
          config={config}
          plotData={plotData}
          actions={actions}
        />
      ),
    },
  };

  const plotSpecificStylingControl = {
    sample: [
      {
        panelTitle: 'Colour Inversion',
        controls: ['colourInversion'],
        footer: <Alert
          message='Changing plot colours is not available here. Use the Data Management tool in Data Exploration to customise cell set and metadata colours'
          type='info'
        />,
      },
      {
        panelTitle: 'Markers',
        controls: ['markers'],
      },
      {
        panelTitle: 'Legend',
        controls: [{
          name: 'legend',
          props: {
            option: {
              positions: 'top-bottom',
            },
          },
        }],
      },
      {
        panelTitle: 'Labels',
        controls: ['labels'],
      },
    ],
    cellCluster: [
      {
        panelTitle: 'Colours',
        controls: ['colourInversion'],
        footer: <Alert
          message='Changing plot colours is not available here. Use the Data Management tool in Data Exploration to customise cell set and metadata colours'
          type='info'
        />,
      },
      {
        panelTitle: 'Markers',
        controls: ['markers'],
      },
      {
        panelTitle: 'Legend',
        controls: [{
          name: 'legend',
          props: {
            option: {
              positions: 'top-bottom',
            },
          },
        }],
      },
      {
        panelTitle: 'Labels',
        controls: ['labels'],
      },
    ],
    mitochondrialContent: [
      {
        panelTitle: 'Colours',
        controls: ['colourScheme', 'colourInversion'],
      },
      {
        panelTitle: 'Markers',
        controls: ['markers'],
      },
      {
        panelTitle: 'Legend',
        controls: ['legend'],
      },
    ],
    doubletScores: [
      {
        panelTitle: 'Colours',
        controls: ['colourScheme', 'colourInversion'],
      },
      {
        panelTitle: 'Markers',
        controls: ['markers'],
      },
      {
        panelTitle: 'Legend',
        controls: ['legend'],
      },
    ],
  };

  const plotStylingControlsConfig = [
    {
      panelTitle: 'Main schema',
      controls: ['dimensions'],
      children: [
        {
          panelTitle: 'Title',
          controls: ['title'],
        },
        {
          panelTitle: 'Font',
          controls: ['font'],
        },
      ],
    },
    {
      panelTitle: 'Axes and Margins',
      controls: ['axes'],
    },
    ...plotSpecificStylingControl[selectedPlot],
  ];

  const outstandingChanges = useSelector(
    (state) => state.componentConfig[plots[selectedPlot].plotUuid]?.outstandingChanges,
  );

  const plotConfigs = useSelector((state) => {
    const plotUuids = Object.values(plots).map((plotIt) => plotIt.plotUuid);

    const plotConfigsToReturn = plotUuids.reduce((acum, plotUuidIt) => {
      // eslint-disable-next-line no-param-reassign
      acum[plotUuidIt] = state.componentConfig[plotUuidIt]?.config;
      return acum;
    }, {});

    return plotConfigsToReturn;
  });

  const plotData = useSelector(
    (state) => state.componentConfig[plots[selectedPlot].plotUuid]?.plotData,
  );

  const selectedConfig = plotConfigs[plots[selectedPlot].plotUuid];

  useEffect(() => {
    Object.values(plots).forEach((obj) => {
      if (!plotConfigs[obj.plotUuid]) {
        dispatch(loadPlotConfig(experimentId, obj.plotUuid, obj.plotType));
      }
    });
  }, [experimentId]);

  useEffect(() => {
    // if we change a plot and the config is not saved yet
    if (outstandingChanges) {
      dispatch(savePlotConfig(experimentId, plots[selectedPlot].plotUuid));
    }
  }, [selectedPlot]);

  useEffect(() => {
    // Do not update anything if the cell sets are stil loading or if
    // the config does not exist yet.
    if (!selectedConfig || !plotData) {
      return;
    }

    if (!cellSets.loading
      && !cellSets.error
      && !cellSets.updateCellSetsClustering
      && selectedConfig
      && plotData) {
      setPlot(plots[selectedPlot].plot(selectedConfig, plotData));
      if (!selectedConfig.selectedCellSet) { return; }

      const propertiesArray = Object.keys(cellSets.properties);
      const cellSetClusteringLength = propertiesArray.filter(
        (cellSet) => cellSet === selectedConfig.selectedCellSet,
      ).length;

      if (!cellSetClusteringLength) {
        debouncedCellSetClustering(0.5);
      }
    }
  }, [selectedConfig, cellSets, plotData]);

  useEffect(() => {
    const showPopupWhenUnsaved = (url) => {
      // Only handle if we are navigating away.z
      const { plotUuid } = plots[selectedPlot];
      if (router.asPath === url || !outstandingChanges) {
        return;
      }
      // Show a confirmation dialog. Prevent moving away if the user decides not to.
      // eslint-disable-next-line no-alert
      if (
        !window.confirm(
          'You have unsaved changes. Do you wish to save?',
        )
      ) {
        router.events.emit('routeChangeError');
        // Following is a hack-ish solution to abort a Next.js route change
        // as there's currently no official API to do so
        // See https://github.com/zeit/next.js/issues/2476#issuecomment-573460710
        // eslint-disable-next-line no-throw-literal
        throw `Route change to "${url}" was aborted (this error can be safely ignored). See https://github.com/zeit/next.js/issues/2476.`;
      } else {
        // if we click 'ok' the config is changed
        dispatch(savePlotConfig(experimentId, plotUuid));
      }
    };

    router.events.on('routeChangeStart', showPopupWhenUnsaved);

    return () => {
      router.events.off('routeChangeStart', showPopupWhenUnsaved);
    };
  }, [router.asPath, router.events]);

  const updatePlotWithChanges = (obj) => {
    dispatch(updatePlotConfig(plots[selectedPlot].plotUuid, obj));
    debounceSave(plots[selectedPlot].plotUuid);
  };

  const renderPlot = () => {
    // Spinner for main window
    if (!selectedConfig) {
      return (
        <center>
          <Skeleton.Image style={{ width: 400, height: 400 }} />
        </center>
      );
    }

    if (selectedPlot === 'sample'
      && !cellSets.loading
      && filterCells(cellSets, selectedConfig.selectedCellSet).length === 0) {
      return (
        <Empty description='Your project has only one sample.' />
      );
    }

    if (plot) {
      return plot;
    }
  };

  return (
    <>
      <PageHeader
        title={plots[selectedPlot].title}
        style={{ width: '100%', paddingRight: '0px' }}
      />
      <Row gutter={16}>
        <Col flex='auto'>
          {renderPlot()}
        </Col>

        <Col flex='1 0px'>
          <Space direction='vertical'>
            {Object.entries(plots).map(([key, plotObj]) => (
              <button
                type='button'
                key={key}
                onClick={() => dispatch(
                  updateProcessingSettings(
                    experimentId,
                    'meta',
                    { selectedConfigureEmbeddingPlot: key },
                  ),
                )}
                style={{
                  margin: 0,
                  backgroundColor: 'transparent',
                  align: 'center',
                  padding: '8px',
                  border: '1px solid #000',
                  cursor: 'pointer',
                }}
              >
                <MiniPlot
                  experimentId={experimentId}
                  plotUuid={plotObj.plotUuid}
                  plotFn={plotObj.plot}
                  actions={false}
                />
              </button>

            ))}
          </Space>
        </Col>

        <Col flex='1 0px'>
          <CalculationConfig experimentId={experimentId} onPipelineRun={onPipelineRun} />
          <Collapse>
            <Panel header='Plot styling' key='styling'>
              <div style={{ height: 8 }} />
              <PlotStyling
                formConfig={plotStylingControlsConfig}
                config={selectedConfig}
                onUpdate={updatePlotWithChanges}
              />
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </>
  );
};

ConfigureEmbedding.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onPipelineRun: PropTypes.func.isRequired,
};

export default ConfigureEmbedding;
