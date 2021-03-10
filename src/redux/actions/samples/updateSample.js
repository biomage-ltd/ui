import _ from 'lodash';
import moment from 'moment';

import {
  SAMPLES_UPDATE,
} from '../../actionTypes/samples';

const updateSample = (
  sample,
) => async (dispatch, getState) => {
  const currentSample = getState().samples[sample.uuid];

  if (_.isEqual(currentSample, sample)) return null;

  // eslint-disable-next-line no-param-reassign
  sample.lastModified = moment().toISOString();

  dispatch({
    type: SAMPLES_UPDATE,
    payload: { sample },
  });
};

export default updateSample;