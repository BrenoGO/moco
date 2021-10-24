import { combineReducers } from 'redux';

import AccountsReducer from './AccountsReducer';
import DefaultsReducer from './DefaultsReducer';
import LoginReducer from './LoginReducer';

export default combineReducers({
  AccountsReducer,
  DefaultsReducer,
  LoginReducer,
});
