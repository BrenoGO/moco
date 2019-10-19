import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import './views.css';
import './Settings.css';

import auth from '../services/Auth';

import Flags from '../components/Flags';
import DefaultAccounts from '../components/Settings/DefaultAccounts';
import PaymentOptions from '../components/Settings/PaymentOptions';
import TransferenceAccounts from '../components/Settings/TransferenceAccounts';
import ChangePassword from '../components/Settings/ChangePassword';

export default function Settings() {
  const [logOut, setLogOut] = useState(false);

  function handleLogOut() {
    auth.logout(() => {
      localStorage.removeItem('token');
      setLogOut(true);
    });
  }

  if (logOut) return <Redirect to={`${process.env.PUBLIC_URL}/login`} />;
  return (
    <div className="view">
      <h1>Settings</h1>
      <div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleLogOut}
        >
          Log Out
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
