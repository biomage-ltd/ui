import React from 'react';
import { Input, Button, Typography } from 'antd';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import NewProjectModal from '../../../components/data-management/NewProjectModal';

const { TextArea } = Input;

const { Text } = Typography;

configure({ adapter: new Adapter() });

const mockStore = configureMockStore([thunk]);

const initialState = {
  projects: {
    meta: {
      loading: true,
      saving: false,
      error: false,
    },
  },
};

describe('NewProjectModal', () => {
  it('renders without options', () => {
    const component = mount(
      <Provider store={mockStore(initialState)}>
        <NewProjectModal />
      </Provider>,
    );
    expect(component.exists()).toEqual(true);
  });

  it('contains required components for first time flow', () => {
    const component = mount(
      <Provider store={mockStore(initialState)}>
        <NewProjectModal firstTimeFlow />
      </Provider>,
    );

    // It has a header
    expect(component.find('h3').length).toBeGreaterThan(0);

    // It has an input
    expect(component.find(Input).length).toEqual(1);

    // It has a project description input
    expect(component.find(TextArea).length).toEqual(1);

    // It has a button
    expect(component.find(Button).length).toEqual(1);
  });

  it('contains required components for later flows', () => {
    const component = mount(
      <Provider store={mockStore(initialState)}>
        <NewProjectModal firstTimeFlow={false} />
      </Provider>,
    );

    // It has no header
    expect(component.find('h3').length).toEqual(0);

    // It has an input
    expect(component.find(Input).length).toEqual(1);

    // It has a project description input
    expect(component.find(TextArea).length).toEqual(1);

    // It has a button
    expect(component.find(Button).length).toEqual(1);
  });

  it('disables input and shows loading when project is being saved', () => {
    const savingState = {
      ...initialState,
      projects: {
        meta: {
          ...initialState.projects.meta,
          saving: true,
        },
      },
    };

    const component = mount(
      <Provider store={mockStore(savingState)}>
        <NewProjectModal />
      </Provider>,
    );

    // Named input is disabled
    expect(component.find(Input).props().disabled).toEqual(true);

    // Textarea is disabled
    expect(component.find(TextArea).props().disabled).toEqual(true);

    // It has a spinner
    expect(component.find(ClipLoader).length).toEqual(1);
  });

  it('disables input and shows error if project has errors', () => {
    const errMsg = 'Error message';

    const errorState = {
      ...initialState,
      projects: {
        meta: {
          ...initialState.projects.meta,
          error: errMsg,
        },
      },
    };

    const component = mount(
      <Provider store={mockStore(errorState)}>
        <NewProjectModal />
      </Provider>,
    );

    // Named input is not disabled
    expect(component.find(Input).props().disabled).toEqual(false);

    // Textarea is not disabled
    expect(component.find(TextArea).props().disabled).toEqual(false);

    // It has an error text
    expect(component.find(Text).last().text()).toEqual(errMsg);
  });
});
