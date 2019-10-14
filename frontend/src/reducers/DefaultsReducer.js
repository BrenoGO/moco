import {
  SET_DEFAULTS,
  UPDATE_DEFAULT,
  RESET_BALANCE
} from '../actions/DefaultsActions';

const INICIAL_STATE = {
  defaultAccounts: {},
  balances: []
};

export default function SettingsReducer(state = INICIAL_STATE, action) {
  switch (action.type) {
    case SET_DEFAULTS:
      return action.defaults;
    case UPDATE_DEFAULT:
      return { ...state, [action.whichDefault]: action.data };
    case RESET_BALANCE:
      return {
        ...state,
        balances: state.balances.map((ac) => {
          if (ac.accountId !== action.ac.accountId) return ac;
          return action.ac;
        })
      };
    default:
      return state;
  }
}

//
