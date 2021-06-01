import fetchAPI from '../../../utils/fetchAPI';
import {
  EXPERIMENT_SETTINGS_PROCESSING_LOAD,
  EXPERIMENT_SETTINGS_PROCESSING_ERROR,
} from '../../actionTypes/experimentSettings';

import { isServerError, throwWithEndUserMessage } from '../../../utils/fetchErrors';
import endUserMessages from '../../../utils/endUserMessages';
import pushNotificationMessage from '../../../utils/pushNotificationMessage';
import errorTypes from './errorTypes';

const loadProcessingSettings = (experimentId) => async (dispatch, getState) => {
  const {
    loading, loadingSettingsError,
  } = getState().experimentSettings.processing.meta;

  if (!loading && !loadingSettingsError) {
    return null;
  }

  const url = `/v1/experiments/${experimentId}/processingConfig`;
  try {
    const response = await fetchAPI(url);

    const data = await response.json();
    throwWithEndUserMessage(response, data, endUserMessages.errorFetchingProcessing);
    dispatch({
      type: EXPERIMENT_SETTINGS_PROCESSING_LOAD,
      payload: {
        data: data.processingConfig,
      },
    });

    return;
  } catch (e) {
    let { message } = e;
    if (!isServerError(e)) {
      console.error(`fetch ${url} error ${message}`);
      message = endUserMessages.connectionError;
    }
    pushNotificationMessage(
      'error',
      message,
    );

    dispatch({
      type: EXPERIMENT_SETTINGS_PROCESSING_ERROR,
      payload: {
        error: message,
        errorType: errorTypes.LOADING_PROCESSING_SETTINGS,
      },
    });
  }
};

export default loadProcessingSettings;
