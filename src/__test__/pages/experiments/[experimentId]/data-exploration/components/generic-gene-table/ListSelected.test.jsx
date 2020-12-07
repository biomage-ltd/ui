import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { Button, Select } from 'antd';
import preloadAll from 'jest-next-dynamic';
import ListSelected from '../../../../../../../pages/experiments/[experimentId]/data-exploration/components/generic-gene-table/ListSelected';

const TEST_UUID = 'testList';
const mockStore = configureMockStore([thunk]);
let component;
let store;
const initialState = {
  genes: {
    properties: {
      loading: [],
      data: {
        CEMIP: { dispersions: 3.999991789324 },
        TIMP3: { dispersions: 3.4388329 },
        SMYD3: { dispersions: 3.1273264798 },
        I: { dispersions: 0.08756543 },
        J: { dispersions: 1.352342342 },
        K: { dispersions: 33.423142314 },
      },
      views: {
        [TEST_UUID]: {
          fetching: false,
          error: false,
          total: 4,
          data: ['J', 'I', 'K', 'CEMIP'],
        },
      },
    },
    expression: {
      loading: [],
      error: false,
      data: {},
    },
    selected: ['PPBP', 'DOK3', 'YPEL2'],
    focused: undefined,
  },
};

describe('ListSelected', () => {
  beforeAll(async () => {
    await preloadAll();
    store = mockStore(initialState);
  });
  configure({ adapter: new Adapter() });

  test('renders correctly', () => {
    component = mount(
      <Provider store={store}>
        <ListSelected experimentId='1234' uuid={TEST_UUID} width={100} height={200} />
      </Provider>,
    );
    const search = component.find(Button);
    expect(search.length).toEqual(1);
  });

  test('components are present', () => {
    component = mount(
      <Provider store={store}>
        <ListSelected experimentId='1234' uuid={TEST_UUID} width={100} height={200} />
      </Provider>,
    );
    const button = component.find(Button);
    expect(button.length).toEqual(1);
  });
  test('show selected genes', () => {
    component = mount(
      <Provider store={store}>
        <ListSelected experimentId='1234' uuid={TEST_UUID} width={100} height={200} />
      </Provider>,
    );
    const button = component.find(Button);
    button.simulate('click');
    const select = component.find(Select);
    expect(select.getElement().props.value).toEqual(initialState.genes.selected);
  });
});
