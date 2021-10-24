import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './views.css';
import './Settings.css';

import { setLogged } from '../actions/LoginActions';

import auth from '../services/Auth';
import { SettingsMsgs } from '../services/Messages';

import Flags from '../components/Flags';
import DefaultAccounts from '../components/Settings/DefaultAccounts';
import PaymentOptions from '../components/Settings/PaymentOptions';
import TransferenceAccounts from '../components/Settings/TransferenceAccounts';
import ChangePassword from '../components/Settings/ChangePassword';

export default function Settings() {
  const { locale } = useSelector((state) => state.DefaultsReducer);
  const dispatch = useDispatch();
  const history = useHistory();

  function handleLogOut() {
    auth.logout(() => {
      localStorage.removeItem('token');
      history.push(`${process.env.PUBLIC_URL}/login`);
      dispatch(setLogged(false));
    });
  }

  return (
    <div className="view">
      <h1>{SettingsMsgs[locale].title}</h1>
      <div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleLogOut}
        >
          {SettingsMsgs[locale].logOutBut}
        </button>
      </div>
      <Flags />
      <ChangePassword />
      <DefaultAccounts />
      <PaymentOptions />
      <TransferenceAccounts />
    </div>
  );
}
