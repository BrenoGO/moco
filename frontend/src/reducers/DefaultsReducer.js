import {
  SET_DEFAULTS,
  UPDATE_DEFAULT,
  RESET_BALANCE,
} from '../actions/DefaultsActions';

const INICIAL_STATE = {
  defaultAccounts: {},
  balances: [],
  locale: localStorage.getItem('locale') || 'en-US',
};

export default function SettingsReducer(state = INICIAL_STATE, action) {
  switch (action.type) {
    case SET_DEFAULTS:
      localStorage.setItem('locale', action.defaults.locale);
      return action.defaults;
    case UPDATE_DEFAULT:
      if (action.whichDefault === 'locale') {
        localStorage.setItem('locale', action.data);
      }
      return { ...state, [action.whichDefault]: action.data };
    case RESET_BALANCE:
      return {
        ...state,
        balances: state.balances.map((ac) => {
          if (ac.accountId !== action.ac.accountId) return ac;
          return action.ac;
        }),
      };
    default:
      return state;
  }
}

//
