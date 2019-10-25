import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import './views.css';
import './Settings.css';

import auth from '../services/Auth';
import { SettingsMsgs } from '../services/Messages';

import Flags from '../components/Flags';
import DefaultAccounts from '../components/Settings/DefaultAccounts';
import PaymentOptions from '../components/Settings/PaymentOptions';
import TransferenceAccounts from '../components/Settings/TransferenceAccounts';
import ChangePassword from '../components/Settings/ChangePassword';

export default function Settings() {
  const [logOut, setLogOut] = useState(false);
  const { locale } = useSelector(state => state.DefaultsReducer);

  function handleLogOut() {
    auth.logout(() => {
      localStorage.removeItem('token');
      setLogOut(true);
    });
  }

  if (logOut) return <Redirect to={`${process.env.PUBLIC_URL}/login`} />;
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
