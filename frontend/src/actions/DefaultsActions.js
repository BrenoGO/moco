export const SET_DEFAULTS = 'set_defaults';
export const UPDATE_DEFAULT = 'update_default';
export const RESET_BALANCE = 'reset_balance';

export const setDefaults = defaults => ({ type: SET_DEFAULTS, defaults });
export const updateDefault = (whichDefault, data) => ({ type: UPDATE_DEFAULT, whichDefault, data });
export const resetBalance = ac => ({ type: RESET_BALANCE, ac });
