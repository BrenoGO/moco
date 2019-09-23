export const SET_ACCOUNTS = 'set_accounts';
export const ADD_ACCOUNT = 'add_account';
export const DELETE_ACCOUNTS = 'delete_accounts';
export const UPDATE_ACCOUNT = 'update_account';
export const SET_DEFAULTS = 'set_defaults';
export const RESET_BALANCE = 'reset_balance';

export const setAccounts = accounts => ({ type: SET_ACCOUNTS, accounts });
export const addAccount = account => ({ type: ADD_ACCOUNT, account });
export const deleteAccounts = ids => ({ type: DELETE_ACCOUNTS, ids });
export const updateAccount = (id, name) => ({ type: UPDATE_ACCOUNT, id, name });
export const setDefaults = defaults => ({ type: SET_DEFAULTS, defaults });
export const resetBalance = ac => ({ type: RESET_BALANCE, ac });
