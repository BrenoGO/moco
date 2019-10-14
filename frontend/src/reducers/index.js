import { combineReducers } from 'redux';

import AccountsReducer from './AccountsReducer';
import DefaultsReducer from './DefaultsReducer';

export default combineReducers({
  AccountsReducer,
  DefaultsReducer
});
