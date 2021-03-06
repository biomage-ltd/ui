/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { UPDATE_LAYOUT } from '../actionTypes/layout';

const getSinglewindowConfig = (window) => ({
  first: window,
  second: '',
  splitPercentage: 100,
  direction: 'row',
});

const getMultipleWindowsConfig = (first, second) => ({
  first,
  second,
  splitPercentage: 60,
  direction: 'row',
});

const updateLayout = (layout) => (dispatch) => {
  if (!layout) {
    return dispatch({
      type: UPDATE_LAYOUT,
      data: {},
    });
  }
  if (layout instanceof Object) {
    return dispatch({
      type: UPDATE_LAYOUT,
      data: {
        windows: { ...layout },
      },
    });
  }
  return dispatch({
    type: UPDATE_LAYOUT,
    data: {
      windows: getSinglewindowConfig(layout),
    },
  });
};

const addWindow = (window) => (dispatch, getState) => {
  const { layout } = getState();
  let newLayout;

  if (Object.keys(layout).length === 0) {
    newLayout = {
      windows: getSinglewindowConfig(window),
    };
  } else {
    if (JSON.stringify(layout.windows).includes(window)) {
      return;
    }
    newLayout = _.cloneDeep(layout);
    newLayout.windows.first = getMultipleWindowsConfig(layout.windows.first, window);
  }

  return dispatch({
    type: UPDATE_LAYOUT,
    data: {
      ...newLayout,
    },
  });
};

const addToWindow = (panel, window) => (dispatch, getState) => {
  const { layout } = getState();

  let newLayout;
  if (Object.keys(layout).length === 0) {
    newLayout = {
      windows: getSinglewindowConfig(window),
    };
    newLayout.panel = panel;
  } else {
    newLayout = _.cloneDeep(layout);
    const allWindows = JSON.stringify(newLayout.windows);
    newLayout.panel = panel;
    if (allWindows.includes(window) || allWindows.includes(panel)) {
      return dispatch({
        type: UPDATE_LAYOUT,
        data: {
          ...newLayout,
        },
      });
    }
    newLayout.windows.first = getMultipleWindowsConfig(layout.windows.first, window);
  }

  return dispatch({
    type: UPDATE_LAYOUT,
    data: {
      ...newLayout,
    },
  });
};

export { updateLayout, addWindow, addToWindow };
