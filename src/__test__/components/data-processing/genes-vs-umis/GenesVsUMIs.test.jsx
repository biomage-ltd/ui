import React from 'react';
import { mount, configure } from 'enzyme';
import preloadAll from 'jest-next-dynamic';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Vega } from 'react-vega';

import GenesVsUMIs from '../../../../components/data-processing/GenesVsUMIs/GenesVsUMIs';
import CalculationConfig from '../../../../components/data-processing/GenesVsUMIs/CalculationConfig';
import initialExperimentState from '../../../../redux/reducers/experimentSettings/initialState';

import { initialPlotConfigStates } from '../../../../redux/reducers/componentConfig/initialState';

jest.mock('localforage');
const mockStore = configureStore([thunk]);

const noData = {
  experimentSettings: {
    ...initialExperimentState,
  },
  componentConfig: {
    featuresVsUMIsHistogram: {
      config: initialPlotConfigStates.featuresVsUMIsHistogram,
      plotData: [],
    },
    featuresVsUMIsScatterplot: {
      config: initialPlotConfigStates.featuresVsUMIsScatterplot,
      plotData: [],
    },
  },
};

const withData = {
  ...noData,
  componentConfig: {
    ...noData.componentConfig,
    featuresVsUMIsHistogram: {
      ...noData.componentConfig.featuresVsUMIsHistogram,
      plotData: [
        {
          genes: 2.41995574848976,
          molecules: 2.70070371714502,
        },
        {
          genes: 2.36921585741014,
          molecules: 2.7041505168398,
        },
        {
          genes: 2.46389298898591,
          molecules: 2.70671778233676,
        },
      ],
    },
    featuresVsUMIsScatterplot: {
      ...noData.componentConfig.featuresVsUMIsScatterplot,
      plotData: [
        {
          genes: 2.41995574848976,
          molecules: 2.70070371714502,
        },
        {
          genes: 2.36921585741014,
          molecules: 2.7041505168398,
        },
        {
          genes: 2.46389298898591,
          molecules: 2.70671778233676,
        },
      ],
    },
  },
};

const sampleId = 'WT';
const sampleIds = ['WT', 'WT1', 'KO'];
const experimentId = 'e1234';

describe('GenesVsUMIs', () => {
  beforeAll(async () => {
    await preloadAll();
  });

  beforeEach(async () => {
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

  configure({ adapter: new Adapter() });

  it('renders correctly with no data', () => {
    const store = mockStore(noData);

    const component = mount(
      <Provider store={store}>
        <GenesVsUMIs
          experimentId={experimentId}
          sampleId={sampleId}
          sampleIds={sampleIds}
        />
      </Provider>,
    );

    const page = component.find(GenesVsUMIs).at(0);
    const calculationConfig = page.find(CalculationConfig);

    // There is a config element
    expect(calculationConfig.length).toEqual(1);

    const plots = page.find(Vega);

    // No plots when there are no data
    expect(plots.length).toEqual(0);
  });

  it('Shows plot with data', () => {
    const store = mockStore({
      experimentSettings: {
        ...initialExperimentState,
      },
      ...withData,
    });

    const component = mount(
      <Provider store={store}>
        <GenesVsUMIs
          experimentId={experimentId}
          sampleId={sampleId}
          sampleIds={sampleIds}
        />
      </Provider>,
    );

    const page = component.find(GenesVsUMIs).at(0);
    const calculationConfig = page.find(CalculationConfig);

    // There is a config element
    expect(calculationConfig.length).toEqual(1);

    const plots = page.find(Vega);

    // 1 main 2 miniatures
    expect(plots.length).toEqual(3);
  });
});