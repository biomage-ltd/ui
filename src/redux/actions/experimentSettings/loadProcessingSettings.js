import {
  EXPERIMENT_SETTINGS_PROCESSING_LOAD,
  EXPERIMENT_SETTINGS_PROCESSING_ERROR,
} from '../../actionTypes/experimentSettings';

import pushNotificationMessage from '../pushNotificationMessage';

import getApiEndpoint from '../../../utils/apiEndpoint';

import errorTypes from './errorTypes';

const loadProcessingSettings = (experimentId) => async (dispatch) => {
  try {
    const response = await fetch(
      `${getApiEndpoint()}/v1/experiments/${experimentId}/processingConfig`,
    );

    if (response.ok) {
      const data = await response.json();

      dispatch({
        type: EXPERIMENT_SETTINGS_PROCESSING_LOAD,
        payload: { data: data.processingConfig },
      });

      return;
    }

    throw new Error('HTTP status code was not 200.');
  } catch (e) {
    dispatch(pushNotificationMessage('error', 'We couldn\'t connect to the server to load the latest settings', 5));

    dispatch({
      type: EXPERIMENT_SETTINGS_PROCESSING_ERROR,
      payload: { settingName: 'meta', errorType: errorTypes.LOADING_PROCESSING_SETTINGS },
    });
  }
};

export default loadProcessingSettings;
