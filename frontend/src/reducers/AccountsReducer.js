import {
  SET_ACCOUNTS,
  ADD_ACCOUNT,
  DELETE_ACCOUNTS,
  UPDATE_ACCOUNT,
} from '../actions/AccountsActions';

const INICIAL_STATE = {
  accounts: [],
};

export default function AccountsReducer(state = INICIAL_STATE, action) {
  switch (action.type) {
    case SET_ACCOUNTS:
      return { ...state, accounts: action.accounts };
    case ADD_ACCOUNT:
      return { ...state, accounts: [...state.accounts, action.account] };
    case DELETE_ACCOUNTS:
      return { ...state, accounts: state.accounts.filter((item) => !action.ids.includes(item.id)) };
    case UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map((ac) => {
          if (ac.id !== action.id) return ac;
          return { ...ac, name: action.name };
        }),
      };
    default:
      return state;
  }
}
