import { UPDATE_CELL_INFO } from '../actionTypes';

const cellInfoReducer = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_CELL_INFO:
      console.log('CELL INFO REDUCER -- ', ...action.payload);
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default cellInfoReducer;
