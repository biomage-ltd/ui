import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  EXPERIMENTS_UPDATE,
} from '../../../../redux/actionTypes/experiments';
import { updateExperiment, saveExperiment } from '../../../../redux/actions/experiments';
import initialExperimentState, { experimentTemplate } from '../../../../redux/reducers/experiments/initialState';

jest.mock('localforage');

jest.mock('../../../../redux/actions/experiments/saveExperiment');
saveExperiment.mockImplementation(() => async () => { });

const mockStore = configureStore([thunk]);

describe('updateExperiment', () => {
  const experimentId = 'experiment-1';

  const mockExperiment = {
    ...experimentTemplate,
    name: 'experiment-1',
    id: experimentId,
  };

  const updatedExperiment = {
    ...mockExperiment,
    name: 'updated-experiment',
  };

  const mockState = {
    experiments: {
      ...initialExperimentState,
      [experimentId]: mockExperiment,
    },
  };

  it('Dispatches action when called', async () => {
    const store = mockStore(mockState);
    await store.dispatch(updateExperiment(experimentId, updatedExperiment));

    const action = store.getActions();
    expect(action[0].type).toEqual(EXPERIMENTS_UPDATE);
  });

  it('Dispatches call to save experiment', async () => {
    const store = mockStore(mockState);
    await store.dispatch(updateExperiment(experimentId, updatedExperiment));

    expect(saveExperiment).toHaveBeenCalled();
  });
});