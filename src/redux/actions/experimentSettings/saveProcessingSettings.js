import { EXPERIMENT_SETTINGS_PROCESSING_SAVE, EXPERIMENT_SETTINGS_PROCESSING_ERROR } from '../../actionTypes/experimentSettings';
import getApiEndpoint from '../../../utils/apiEndpoint';

import pushNotificationMessage from '../pushNotificationMessage';

import errorTypes from './errorTypes';

const saveProcessingSettings = (experimentId, settingName) => async (dispatch, getState) => {
  const content = getState().experimentSettings.processing[settingName];

  try {
    const response = await fetch(
      `${getApiEndpoint()}/v1/experiments/${experimentId}/processingConfig`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          name: settingName,
          body: content,
        }]),
      },
    );

    if (response.ok) {
      dispatch({
        type: EXPERIMENT_SETTINGS_PROCESSING_SAVE,
        payload:
          { experimentId, settingName },
      });

      return;
    }

    throw new Error('HTTP status code was not 200.');
  } catch (e) {
    dispatch(pushNotificationMessage('error', 'We couldn\'t connect to the server to save the current settings', 5));

    dispatch({
      type: EXPERIMENT_SETTINGS_PROCESSING_ERROR,
      payload: { settingName: 'meta', errorType: errorTypes.SAVING_PROCESSING_SETTINGS },
    });
  }
};

export default saveProcessingSettings;
