import React from 'react';
import { Provider } from 'react-redux';
import { mount, shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import preloadAll from 'jest-next-dynamic';
import thunk from 'redux-thunk';
import {
  Result, Button, Progress,
} from 'antd';
import configureMockStore from 'redux-mock-store';
import GEM2SLoadingScreen from '../../components/GEM2SLoadingScreen';

configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

const store = mockStore({});

describe('GEM2SLoadingScreen', () => {
  beforeAll(async () => {
    await preloadAll();
  });

  it('Does not render without gem2s status', () => {
    expect(() => shallow(<GEM2SLoadingScreen />)).toThrow();
  });

  it('Renders toBeRun state correctly', () => {
    const component = mount(
      <Provider store={store}>
        <GEM2SLoadingScreen gem2sStatus='toBeRun' />
      </Provider>,
    );

    const display = component.find(Result);

    expect(display.props().status).toEqual('toBeRun');
    expect(display.find(Button).length).toEqual(1);
    expect(display.find(Progress).length).toEqual(0);
  });

  it('Renders error state correctly', () => {
    const component = mount(
      <Provider store={store}>
        <GEM2SLoadingScreen gem2sStatus='error' />
      </Provider>,
    );

    const display = component.find(Result);

    expect(display.props().status).toEqual('error');

    // Button 1 : Launch Another Experiment
    // Button 2 : Re-launch This Experiment
    expect(display.find(Button).length).toEqual(2);
    expect(display.find(Progress).length).toEqual(0);
  });

  it('Renders running state correctly', () => {
    const completedSteps = [
      'step 1',
      'step 2',
    ];

    const steps = [
      'Downloading sample files',
      'Preprocessing samples',
      'Computing metrics',
    ];

    const component = mount(
      <Provider store={store}>
        <GEM2SLoadingScreen gem2sStatus='running' completedSteps={completedSteps} steps={steps} />
      </Provider>,
    );

    const display = component.find(Result);

    expect(display.props().status).toEqual('running');
    expect(display.find(Button).length).toEqual(0);
    expect(display.find(Progress).length).toEqual(1);

    // Display step information as shown in steps
    expect(display.find('span.ant-typography').first().text()).toEqual(steps[completedSteps.length]);
  });
});
