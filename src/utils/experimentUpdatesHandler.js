import _ from 'lodash';

import { updateBackendStatus, updateFilterSettings, loadedProcessingConfig } from '../redux/actions/experimentSettings';
import updatePlotData from '../redux/actions/componentConfig/updatePlotData';

import { updateCellSetsClustering } from '../redux/actions/cellSets';

const updateTypes = {
  QC: 'qc',
  GEM2S: 'gem2s',
  WORKER_DATA_UPDATE: 'workerDataUpdate',
};

const experimentUpdatesHandler = (dispatch) => (experimentId, update) => {
  if (update.response?.error) {
    return;
  }

  switch (update.type) {
    case updateTypes.QC: {
      dispatch(updateBackendStatus(update.status));
      return onQCUpdate(update, dispatch);
    }
    case updateTypes.GEM2S: {
      dispatch(updateBackendStatus(update.status));
      return onGEM2SUpdate(update, dispatch, experimentId);
    }
    case updateTypes.WORKER_DATA_UPDATE: {
      return onWorkerUpdate(experimentId, update, dispatch);
    }

    default: {
      console.log(`Error, unrecognized message type ${update.type}`);
    }
  }
};

const onQCUpdate = (update, dispatch) => {
  const { input, output } = update;

  const processingConfigUpdate = output.config;

  if (processingConfigUpdate) {
    dispatch(updateFilterSettings(
      input.taskName,
      processingConfigUpdate,
      input.sampleUuid,
    ));

    Object.entries(output.plotData).forEach(([plotUuid, plotData]) => {
      dispatch(updatePlotData(plotUuid, plotData));
    });
  }
};

const uglyTemporalFixedProcessingConfig = (processingConfig, filterName) => {
  // This is an ugly patch we need to remove once filterName's processing config is fixed
  // (right now we only receive default values which we no longer use)
  const {
    auto, enabled, filterSettings, ...samples
  } = processingConfig.cellSizeDistribution;

  const sampleIds = Object.keys(samples);
  const defaultFilterSetting = processingConfig[filterName];

  const perSampleFilterSetting = sampleIds.reduce(
    (acum, sampleId) => {
      // eslint-disable-next-line no-param-reassign
      acum[sampleId] = defaultFilterSetting;
      return acum;
    },
    {},
  );

  const fixedProcessingConfig = _.clone(processingConfig);
  fixedProcessingConfig[filterName] = {
    ...processingConfig[filterName],
    ...perSampleFilterSetting,
  };

  return fixedProcessingConfig;
};

const onGEM2SUpdate = (update, dispatch, experimentId) => {
  const processingConfig = update?.item?.processingConfig;
  if (processingConfig) {
    let fixedProcessingConfig = uglyTemporalFixedProcessingConfig(processingConfig, 'classifier');
    fixedProcessingConfig = uglyTemporalFixedProcessingConfig(fixedProcessingConfig, 'mitochondrialContent');
    dispatch(loadedProcessingConfig(experimentId, fixedProcessingConfig, true));
  }
};

const onWorkerUpdate = (experimentId, update, dispatch) => {
  const reqName = update.response.request.body.name;

  if (reqName === 'ClusterCells') {
    const louvainSets = JSON.parse(update.response.results[0].body);
    const newCellSets = [
      louvainSets,
    ];

    dispatch(updateCellSetsClustering(experimentId, newCellSets));
  }
};

export default experimentUpdatesHandler;
