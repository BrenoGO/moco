import {
  SET_ACCOUNTS,
  ADD_ACCOUNT,
  DELETE_ACCOUNTS,
  UPDATE_ACCOUNT,
  SET_DEFAULTS,
  RESET_BALANCE
} from '../actions/AccountsActions';

const INICIAL_STATE = {
  accounts: [],
  defaults: {
    defaultAccounts: {
      whereId: 0,
      whatId: 0
    },
    balances: []
  }
};

export default function AccountsReducer(state = INICIAL_STATE, action) {
  switch (action.type) {
    case SET_ACCOUNTS:
      return { ...state, accounts: action.accounts };
    case ADD_ACCOUNT:
      return { ...state, accounts: [...state.accounts, action.account] };
    case DELETE_ACCOUNTS:
      return { ...state, accounts: state.accounts.filter(item => !action.ids.includes(item.id)) };
    case UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map((ac) => {
          if (ac.id !== action.id) return ac;
          return { ...ac, name: action.name };
        })
      };
    case SET_DEFAULTS:
      return { ...state, defaults: action.defaults };
    case RESET_BALANCE:
      return {
        ...state,
        defaults: {
          ...state.defaults,
          balances: state.defaults.balances.map((ac) => {
            if (ac.id !== action.ac.accountId) return ac;
            return action.ac;
          })
        }
      };
    default:
      return state;
  }
}
