import initialState from './initialState';
import {
  GENES_PROPERTIES_LOADING, GENES_PROPERTIES_LOADED_PAGINATED, GENES_PROPERTIES_ERROR,
  GENES_SELECT, GENES_DESELECT,
  GENES_EXPRESSION_LOADING, GENES_EXPRESSION_LOADED, GENES_EXPRESSION_ERROR,
  GENES_EXPRESSION_TYPE_UPDATE,
} from '../../actionTypes/genes';

import genesPropertiesLoading from './genesPropertiesLoading';
import genesPropertiesLoadedPaginated from './genesPropertiesLoadedPaginated';
import genesPropertiesError from './genesPropertiesError';
import genesExpressionLoading from './genesExpressionLoading';
import genesExpressionLoaded from './genesExpressionLoaded';
import genesExpressionError from './genesExpressionError';
import genesExpressionTypeUpdate from './genesExpressionTypeUpdate';

import genesSelect from './genesSelect';
import genesDeselect from './genesDeselect';

const genesReducer = (state = initialState, action) => {
  switch (action.type) {
    case GENES_PROPERTIES_LOADING: {
      return genesPropertiesLoading(state, action);
    }

    case GENES_PROPERTIES_LOADED_PAGINATED: {
      return genesPropertiesLoadedPaginated(state, action);
    }

    case GENES_PROPERTIES_ERROR: {
      return genesPropertiesError(state, action);
    }

    case GENES_SELECT: {
      return genesSelect(state, action);
    }

    case GENES_DESELECT: {
      return genesDeselect(state, action);
    }

    case GENES_EXPRESSION_LOADING: {
      return genesExpressionLoading(state, action);
    }

    case GENES_EXPRESSION_LOADED: {
      return genesExpressionLoaded(state, action);
    }

    case GENES_EXPRESSION_ERROR: {
      return genesExpressionError(state, action);
    }

    case GENES_EXPRESSION_TYPE_UPDATE: {
      return genesExpressionTypeUpdate(state, action);
    }

    default: {
      return state;
    }
  }
};

export default genesReducer;
