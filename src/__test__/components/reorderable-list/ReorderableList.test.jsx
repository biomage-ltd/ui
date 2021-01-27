import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ReorderableList from '../../../components/ReorderableList';

configure({ adapter: new Adapter() });

describe('ReorderableList', () => {
  let onChangeCount;
  let latestOnChangeListReceived;

  const onChangeMock = (list) => {
    onChangeCount += 1;
    latestOnChangeListReceived = list;
  };

  let reorderableListMock;

  const leftItemMock = (itemData) => (itemData.key);
  const rightItemMock = () => (<br />);

  let component;

  beforeEach(() => {
    onChangeCount = 0;
    latestOnChangeListReceived = null;

    reorderableListMock = [{ key: 1 }, { key: 2 }, { key: 3 }];

    component = mount(
      <ReorderableList
        onChange={onChangeMock}
        defaultList={reorderableListMock}
        leftItem={leftItemMock}
        rightItem={rightItemMock}
      />,
    );
  });

  it('renders correctly', () => {
    const items = component.find('Item');

    // renders the three items
    expect(items.length).toEqual(3);

    console.log('items.at(0)');
    console.log(items.at(0).debug());

    // in the correct order and with the correct items
    expect(items.at(0).text()).toEqual('1');
    expect(items.at(1).text()).toEqual('2');
    expect(items.at(2).text()).toEqual('3');
  });

  it('reorders correctly', () => {
    // when pressing button down on the first item
    const item1 = component.find('Item').at(0);
    act(() => (item1.find('Button').at(1).simulate('click')));

    component.update();

    const items = component.find('Item');
    // the new list order is correct
    expect(items.at(0).text()).toEqual('2');
    expect(items.at(1).text()).toEqual('1');
    expect(items.at(2).text()).toEqual('3');

    // and an onChange is fired
    expect(onChangeCount).toEqual(1);
  });
});
