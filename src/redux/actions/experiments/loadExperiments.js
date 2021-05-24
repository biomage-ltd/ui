import fetchAPI from '../../../utils/fetchAPI';
import {
  EXPERIMENTS_LOADED,
  EXPERIMENTS_ERROR,
  EXPERIMENTS_LOADING,
} from '../../actionTypes/experiments';

const loadExperiments = (
  projectUuid,
) => async (dispatch) => {
  let response = false;
  dispatch({
    type: EXPERIMENTS_LOADING,
  });

  try {
    response = await fetchAPI(`/v1/projects/${projectUuid}/experiments`, {
      method: 'GET',
    });

    const data = await response.json();

    dispatch({
      type: EXPERIMENTS_LOADED,
      payload: {
        experiments: data,
      },
    });
  } catch (e) {
    dispatch({
      type: EXPERIMENTS_ERROR,
      payload: {
        error: e,
      },
    });
  }
};

export default loadExperiments;
