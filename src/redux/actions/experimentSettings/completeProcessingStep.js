import {
  EXPERIMENT_SETTINGS_PROCESSING_COMPLETE_STEP,
  EXPERIMENT_SETTINGS_PROCESSING_ERROR,
} from '../../actionTypes/experimentSettings';

import pushNotificationMessage from '../pushNotificationMessage';

import getApiEndpoint from '../../../utils/apiEndpoint';

import errorTypes from './errorTypes';

const completeProcessingStep = (
  experimentId,
  settingName,
  numSteps,
) => async (dispatch, getState) => {
  const { stepsDone, error } = getState().experimentSettings.processing.meta;

  const arrayStepsDone = Array.from(stepsDone);
  arrayStepsDone.push(settingName);

  const body = {
    complete: arrayStepsDone.size === numSteps,
    stepsDone: arrayStepsDone,
  };

  try {
    const response = await fetch(
      `${getApiEndpoint()}/v1/experiments/${experimentId}/processingConfig`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          name: 'meta',
          body,
        }]),
      },
    );

    // If there is an error with the
    if (response.ok) {
      dispatch({
        type: EXPERIMENT_SETTINGS_PROCESSING_COMPLETE_STEP,
        payload:
          { experimentId, settingName, numSteps },
      });

      return;
    }

    throw new Error('HTTP status code was not 200.');
  } catch (e) {
    dispatch(pushNotificationMessage('error', 'We couldn\'t connect to the server to save the current progress', 5));

    dispatch({
      type: EXPERIMENT_SETTINGS_PROCESSING_ERROR,
      payload: { settingName: 'meta', errorType: errorTypes.COMPLETING_PROCESSING_STEP },
    });
  }
};

export default completeProcessingStep;
