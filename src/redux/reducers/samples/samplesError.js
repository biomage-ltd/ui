import initialState from './initialState';

const samplesError = (state, action) => {
  const { error } = action.payload;
  return {
    ...initialState,
    ...state,
    meta: {
      ...state.meta,
      saving: false,
      error,
    },
  };
};

export default samplesError;
