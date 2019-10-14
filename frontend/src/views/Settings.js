import React from 'react';
import './views.css';

import DefaultAccounts from '../components/Settings/DefaultAccounts';
import PaymentOptions from '../components/Settings/PaymentOptions';
import TransferenceAccounts from '../components/Settings/TransferenceAccounts';

export default function Settings() {
  return (
    <div className="view">
      <h1>Settings</h1>
      <DefaultAccounts />
      <PaymentOptions />
      <TransferenceAccounts />
    </div>
  );
}
