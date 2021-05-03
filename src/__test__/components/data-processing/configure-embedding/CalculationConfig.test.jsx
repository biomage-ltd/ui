import React from 'react';
import {
  Select, Form, Alert, Button,
} from 'antd';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import preloadAll from 'jest-next-dynamic';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';

import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import waitForActions from 'redux-mock-store-await-actions';
import { EXPERIMENT_SETTINGS_PROCESSING_UPDATE } from '../../../../redux/actionTypes/experimentSettings';
import { EMBEDDINGS_LOADING } from '../../../../redux/actionTypes/embeddings';

import CalculationConfig from '../../../../components/data-processing/ConfigureEmbedding/CalculationConfig';
import { initialEmbeddingState } from '../../../../redux/reducers/embeddings/initialState';
import initialExperimentState from '../../../experimentSettings.mock';

jest.mock('localforage');
enableFetchMocks();
const mockStore = configureStore([thunk]);

describe('Data Processing CalculationConfig', () => {
  const storeState = {
    embeddings: initialEmbeddingState,
    experimentSettings: {
      ...initialExperimentState,
    },
  };

  const onPipelineRun = () => { };

  configure({ adapter: new Adapter() });

  beforeEach(async () => {
    await preloadAll();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const response = new Response(
      JSON.stringify(
        {
          processingConfig:
            { ...initialExperimentState.processing },
        },
      ),
    );

    fetchMock.resetMocks();
    fetchMock.doMock();
    fetchMock.mockResolvedValue(response);
  });

  it('renders correctly when nothing is loaded', () => {
    const store = mockStore({
      embeddings: {},
      experimentSettings: {
        ...initialExperimentState,
        processing: {
          ...initialExperimentState.processing,
          configureEmbedding: null,
        },
      },
    });

    const component = mount(
      <Provider store={store}>
        <CalculationConfig
          experimentId='1234'
          width={50}
          height={50}
          onPipelineRun={onPipelineRun}
        />
      </Provider>,
    );

    const preloadContent = component.find('PreloadContent');

    // There should be a spinner for loading state.
    expect(preloadContent.length).toEqual(1);
  });

  it('renders correctly when the data is in the store', () => {
    const store = mockStore(storeState);

    const component = mount(
      <Provider store={store}>
        <CalculationConfig
          experimentId='1234'
          width={50}
          height={50}
          onPipelineRun={onPipelineRun}
        />
      </Provider>,
    );

    // There should no spinner anymore.
    const preloadContent = component.find('PreloadContent');
    expect(preloadContent.length).toEqual(0);

    // There should be a form loaded.
    const form = component.find(Form);
    expect(form.length).toBeGreaterThan(0);
  });

  it('changing an embedding setting should trigger an alert', () => {
    const store = mockStore(storeState);

    const component = mount(
      <Provider store={store}>
        <CalculationConfig
          experimentId='1234'
          width={50}
          height={50}
          onPipelineRun={onPipelineRun}
        />
      </Provider>,
    );

    // There should no spinner anymore.
    const preloadContent = component.find('PreloadContent');
    expect(preloadContent.length).toEqual(0);

    // There should be a form loaded.
    const form = component.find(Form);
    expect(form.length).toBeGreaterThan(0);

    // There should be no alert loaded.
    let alert = component.find(Alert);
    expect(alert.length).toEqual(0);

    // The Apply button should be disabled.
    let button = component.find(Button);
    expect(button.at(0).getElement().props.disabled).toEqual(true);

    // Switching the embedding type...
    act(() => { component.find(Select).at(0).getElement().props.onChange('tsne'); });
    component.update();

    // The alert should appear.
    alert = component.find(Alert);
    expect(alert.length).toEqual(1);

    // The button should enable.
    button = component.find(Button);
    expect(button.at(0).getElement().props.disabled).toEqual(false);
  });

  it('clicking on button triggers save action and reloading of plot data', async () => {
    const store = mockStore(storeState);

    const component = mount(
      <Provider store={store}>
        <CalculationConfig
          experimentId='1234'
          width={50}
          height={50}
          onPipelineRun={onPipelineRun}
        />
      </Provider>,
    );

    // Switching the embedding type...
    act(() => { component.find(Select).at(0).getElement().props.onChange('tsne'); });
    component.update();

    // ... and clicking the Apply button.
    const button = component.find(Button);

    button.simulate('click', {});
    // Should load the new embedding and save the config.

    console.log(store.getActions());

    await waitForActions(store, [EXPERIMENT_SETTINGS_PROCESSING_UPDATE, EMBEDDINGS_LOADING]);
    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()).toMatchSnapshot();
  });
});
