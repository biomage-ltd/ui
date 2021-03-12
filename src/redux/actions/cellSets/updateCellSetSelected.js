import { CELL_SETS_SET_SELECTED } from '../../actionTypes/cellSets';

const updateCellSetSelected = (experimentId, keys, tab) => async (dispatch, getState) => {
  const {
    loading, error,
  } = getState().cellSets;

  if (loading || error) {
    return null;
  }

  await dispatch({
    type: CELL_SETS_SET_SELECTED,
    payload: {
      experimentId,
      keys,
      tab,
    },
  });
};

export default updateCellSetSelected;
