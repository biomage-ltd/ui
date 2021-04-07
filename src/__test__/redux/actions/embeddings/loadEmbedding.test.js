import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { loadEmbedding } from '../../../../redux/actions/embedding';
import { initialEmbeddingState } from '../../../../redux/reducers/embeddings/initialState';
import initialExperimentState from '../../../../redux/reducers/experimentSettings/initialState';

import sendWork from '../../../../utils/sendWork';

jest.mock('localforage');

jest.mock('../../../../utils/sendWork', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe('loadEmbedding action', () => {
  const experimentId = '1234';
  const embeddingType = 'umap';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Dispatches on already loaded embedding', async () => {
    const store = mockStore(
      {
        embeddings:
          { [embeddingType]: { ...initialEmbeddingState, loading: false } },
      },
    );

    store.dispatch(loadEmbedding(experimentId, embeddingType));
    expect(store.getActions().length).toEqual(0);
  });

  it('Does not dispatch on a loading embedding', async () => {
    const store = mockStore(
      {
        embeddings:
          { [embeddingType]: { ...initialEmbeddingState, loading: true } },
      },
    );

    store.dispatch(loadEmbedding(experimentId, embeddingType));
    expect(store.getActions().length).toEqual(0);
  });

  it('Dispatches on a previously unseen embedding', async () => {
    sendWork.mockImplementation(() => {
      // We are resolving with two identical results, because in the transition period
      // the worker will return both types of results. TODO: reduce this to just one
      // result when the initial version of the UI is pushed.

      const resolveWith = {
        results:
          [
            { body: JSON.stringify([[1, 2], [3, 4]]) },
            { body: JSON.stringify([[1, 2], [3, 4]]) },
          ],
      };

      return new Promise((resolve) => resolve(resolveWith));
    });

    const store = mockStore(
      {
        embeddings: {},
        experimentSettings: {
          ...initialExperimentState,
        },
      },
    );

    await store.dispatch(loadEmbedding(experimentId, embeddingType));

    // We should have been dispatched two events.
    expect(store.getActions().length).toEqual(2);

    // The first action should have been a loading.
    const firstAction = store.getActions()[0];
    expect(firstAction).toMatchSnapshot();

    // The first action should have been an appropriately constructed loaded action.
    const secondAction = store.getActions()[1];
    expect(secondAction).toMatchSnapshot();
  });

  it('Dispatches on a previous error condition', async () => {
    sendWork.mockImplementation(() => {
      // We are resolving with two identical results, because in the transition period
      // the worker will return both types of results. TODO: reduce this to just one
      // result when the initial version of the UI is pushed.

      const resolveWith = {
        results:
          [
            { body: JSON.stringify([[1, 2], [3, 4]]) },
            { body: JSON.stringify([[1, 2], [3, 4]]) },
          ],
      };

      return new Promise((resolve) => resolve(resolveWith));
    });

    const store = mockStore(
      {
        embeddings:
          { [embeddingType]: { ...initialEmbeddingState, error: true, loading: false } },
        experimentSettings: {
          ...initialExperimentState,
        },
      },
    );

    await store.dispatch(loadEmbedding(experimentId, embeddingType));

    // We should have been dispatched two events.
    expect(store.getActions().length).toEqual(2);

    // The first action should have been a loading.
    const firstAction = store.getActions()[0];
    expect(firstAction).toMatchSnapshot();

    // The first action should have been an appropriately constructed loaded action.
    const secondAction = store.getActions()[1];
    expect(secondAction).toMatchSnapshot();
  });

  it('Dispatches error action on unsuccessful loading', async () => {
    const store = mockStore(
      {
        embeddings:
          {},
        experimentSettings: {
          ...initialExperimentState,
        },
      },
    );

    sendWork.mockImplementation(() => new Promise((resolve, reject) => reject(new Error('random error!'))));

    await store.dispatch(loadEmbedding(experimentId, embeddingType));

    // We should have been dispatched two events.
    expect(store.getActions().length).toEqual(2);

    // The first action should have been a loading.
    const firstAction = store.getActions()[0];
    expect(firstAction).toMatchSnapshot();

    // The first action should have been an error condition.
    const secondAction = store.getActions()[1];
    expect(secondAction).toMatchSnapshot();
  });

  it('Does not return anything while waiting for config data to load', async () => {
    const store = mockStore(
      {
        embeddings:
          {},
        experimentSettings: {
          ...initialExperimentState,
          processing: {},
        },
      },
    );

    await store.dispatch(loadEmbedding(experimentId, embeddingType));

    // We should have been dispatched two events.
    expect(store.getActions().length).toEqual(0);
  });
});
