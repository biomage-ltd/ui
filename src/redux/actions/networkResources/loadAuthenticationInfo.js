import { NETWORK_RESOURCES_AUTH_LOADED } from '../../actionTypes/networkResources';

const loadAuthenticationInfo = (userPoolId, identityPoolId) => (dispatch) => {
  dispatch({
    type: NETWORK_RESOURCES_AUTH_LOADED,
    payload: {
      userPoolId,
      identityPoolId,
    },
  });
};

export default loadAuthenticationInfo;
