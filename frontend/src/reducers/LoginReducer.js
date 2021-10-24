import {
  SET_LOGGED,
} from '../actions/LoginActions';

const INICIAL_STATE = {
  logged: undefined,
};

export default function LoginReducer(state = INICIAL_STATE, action) {
  switch (action.type) {
    case SET_LOGGED:
      return { ...state, logged: action.logged };
    default:
      return state;
  }
}
