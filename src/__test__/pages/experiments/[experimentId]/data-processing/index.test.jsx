import React from 'react';
import { mount, configure } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import waitForActions from 'redux-mock-store-await-actions';
import Adapter from 'enzyme-adapter-react-16';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';

import DataProcessingPage from '../../../../../pages/experiments/[experimentId]/data-processing/index';

import initialCellSetsState from '../../../../../redux/reducers/cellSets/initialState';
import initialExperimentSettingsState from '../../../../../redux/reducers/experimentSettings/initialState';

import { EXPERIMENT_SETTINGS_PIPELINE_STATUS_LOADING } from '../../../../../redux/actionTypes/experimentSettings';

configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

const getStore = () => {
  const store = mockStore({
    notifications: {},
    experimentSettings: {
      ...initialExperimentSettingsState,
      processing: {
        ...initialExperimentSettingsState.processing,
        meta: {
          loading: false,
          stepsDone: new Set([]),
          loadingSettingsError: false,
          completingStepError: false,
        },
      },
      pipelineStatus: {
        loading: false,
        error: false,
        status: { pipeline: { status: 'SUCCEEDED' } },
      },
    },
    cellSets: {
      ...initialCellSetsState,
      properties: {
        test: {
          name: 'Test',
          cellIds: 'Set()',
        },
        'test-1': {
          name: 'Test-1',
          cellIds: 'Set(1, 2, 3)',
        },
        'test-2': {
          name: 'Test-1',
          cellIds: 'Set(4, 5, 6)',
        },
        sample: {
          name: 'Test',
          cellIds: 'Set()',
        },
        'sample-1': {
          name: 'Test-1',
          cellIds: 'Set(2, 3)',
        },
        'sample-2': {
          name: 'Test-1',
          cellIds: 'Set(1, 4, 5, 6)',
        },
      },
      hierarchy: [
        {
          key: 'test',
          children: [
            { key: 'test-1' },
            { key: 'test-2' },
          ],
        },
        {
          key: 'sample',
          children: [
            { key: 'sample-1' },
            { key: 'sample-2' },
          ],
        },
      ],
      loading: false,
      error: false,
    },
  });

  return store;
};

describe('DataProcessingPage', () => {
  const experimentData = {};

  beforeEach(() => {
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
  });

  it('renders correctly', () => {
    const store = getStore();

    const page = mount(
      <Provider store={store}>
        <DataProcessingPage experimentId='experimentId' experimentData={experimentData} route='route'>
          <></>
        </DataProcessingPage>
      </Provider>,
    );

    const header = page.find('Header');
    expect(header.length).toEqual(1);

    const card = page.find('Card');
    expect(card.length).toEqual(1);

    const runFilterButton = page.find('#runFilterButton').filter('Button');
    expect(runFilterButton.length).toEqual(1);

    // Run filter is disabled initially
    expect(runFilterButton.at(0).props().disabled).toEqual(true);
  });

  it('triggers the pipeline on click run filter', async () => {
    const store = getStore();

    const page = mount(
      <Provider store={store}>
        <DataProcessingPage experimentId='experimentId' experimentData={experimentData} route='route'>
          <></>
        </DataProcessingPage>
      </Provider>,
    );

    const filterComponent = page.find('#cellSizeDistribution');

    act(() => {
      filterComponent.at(0).props().configChangedHandler();
    });

    page.update();
    // Run filter is enabled after changes take place
    expect(page.find('#runFilterButton').filter('Button').at(0).props().disabled).toEqual(false);

    act(() => {
      page
        .find('#runFilterButton').filter('Button')
        .at(0).props()
        .onClick();
    });

    page.update();

    // Pipeline is triggered on clicking run button
    await waitForActions(store, [EXPERIMENT_SETTINGS_PIPELINE_STATUS_LOADING]);

    // Run filter is disabled after triggering the pipeline
    expect(page.find('#runFilterButton').filter('Button').at(0).props().disabled).toEqual(true);
  });
});
