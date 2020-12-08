import {
  CELL_SETS_HIDE, CELL_SETS_UNHIDE,
} from '../../actionTypes/cellSets';

const setCellSetHiddenStatus = (
  experimentId, key,
) => (dispatch, getState) => {
  if (getState().cellSets.hidden.has(key)) {
    dispatch({
      type: CELL_SETS_UNHIDE,
      payload: {
        experimentId,
        key,
      },
    });
  } else {
    dispatch({
      type: CELL_SETS_HIDE,
      payload: {
        experimentId,
        key,
      },
    });
  }
};

export default setCellSetHiddenStatus;
