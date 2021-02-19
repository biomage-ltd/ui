import initialState from './initialState';

const errorProcessingSettings = (state, action) => {
  const { settingName, errorType } = action.payload;

  return {
    ...initialState,
    ...state,
    processing: {
      ...initialState.processing,
      ...state.processing,
      [settingName]: {
        ...initialState.processing[settingName],
        ...state.processing[settingName],
        [errorType]: true,
      },
    },
  };
};

export default errorProcessingSettings;
