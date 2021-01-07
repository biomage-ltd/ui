import cellInfoReducer from '../../../redux/reducers/cellInfo';
import initialState from '../../../redux/reducers/cellInfo/initialState';
import {
  CELL_INFO_UPDATE, CELL_INFO_FOCUS, CELL_INFO_UNFOCUS,
} from '../../../redux/actionTypes/cellInfo';

/*

import reducers from '../../../redux/reducers';
import * as types from '../../../redux/actionTypes';

describe('cellInfoReducer', () => {
  it('Reduces the correct state', () => expect(
    reducers({}, {
      payload: {
        cellName: 'C1',
        geneName: 'G1',
        expression: 1,
      },
      type: types.UPDATE_CELL_INFO,
    }).cellInfo,
  ).toEqual({
    cellName: 'C1',
    geneName: 'G1',
    expression: 1,
  }));
});

*/

// Unfocused state
const unfocusedState = {
  focus:
    {
      store: null,
      key: null,
    },
};

describe('cellInfoReducer', () => {
  it('Reduces identical state on unknown action', () => expect(
    cellInfoReducer(undefined, {
      action: 'well/this/is/not/a/valid/action',
      payload: {},
    }),
  ).toEqual(initialState));

  it('Updates cell info state on update action', () => {
    const payload = {
      cellName: 'C1',
      geneName: 'G1',
      expression: 1,
    };

    const newState = cellInfoReducer(initialState, {
      type: CELL_INFO_UPDATE,
      payload,
    });

    expect(newState).toMatchSnapshot();
  });

  it('Updates cell info state on focus action', () => {
    const payload = {
      store: 'genes',
      key: 'GENE1',
    };

    const newState = cellInfoReducer(initialState, {
      type: CELL_INFO_FOCUS,
      payload,
    });

    expect(newState.focus).toEqual(payload);
    expect(newState).toMatchSnapshot();
  });

  it('Updates cell info state on unfocus action', () => {
    const newState = cellInfoReducer(initialState, {
      type: CELL_INFO_UNFOCUS,
    });

    expect(newState.focus).toEqual(unfocusedState.focus);
    expect(newState).toMatchSnapshot();
  });
});
