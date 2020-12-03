import React from 'react';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ClusterPopover from '../../../../../../../pages/experiments/[experimentId]/data-exploration/components/embedding/ClusterPopover';
import EditableField from '../../../../../../../components/EditableField';

jest.mock('localforage');

configure({ adapter: new Adapter() });

let mockCreate;
let mockCancel;
let component;

describe('ClusterPopover', () => {
  beforeEach(() => {
    const popoverPosition = { current: { x: 0, y: 0 } };
    mockCreate = jest.fn();
    mockCancel = jest.fn();
    component = mount(
      <ClusterPopover
        popoverPosition={popoverPosition}
        onCreate={mockCreate}
        onCancel={mockCancel}
        visible
      />,
    );
  });

  afterEach(() => {
    component.unmount();
  });
  test('renders correctly', () => {
    expect(component.find('Popover').length).toEqual(1);
    expect(component.find(EditableField).length).toEqual(1);
  });

  test('cluster name and cluster color get passed in on create', () => {
    component.find(EditableField).find('Button').at(0).simulate('click');
    component.update();
    expect(mockCreate).toBeCalledTimes(1);
    expect(mockCreate).toBeCalledWith('New Cluster', '#3957ff');
  });
  test('new cluster is not created on cancel', () => {
    component.find(EditableField).find('Button').at(1).simulate('click');
    expect(mockCancel).toBeCalledTimes(1);
  });
});
