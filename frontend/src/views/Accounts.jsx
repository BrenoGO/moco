import React from 'react';
import { useSelector } from 'react-redux';

import './views.css';
import './Accounts.css';

import { AccMsgs } from '../services/Messages';

import GroupAccount from '../components/Accounts/GroupAccount';


export default function Accounts() {
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { locale } = useSelector(state => state.DefaultsReducer);

  function renderAccountCountainer() {
    const rootAccounts = accounts.filter(
      account => account.parents.length === 0
    ).sort((a, b) => (a.id - b.id));

    return (
      <div id="accountContainer">
        {
          rootAccounts.map(rootAccount => (
            <GroupAccount key={rootAccount._id} account={rootAccount} />
          ))
        }
      </div>
    );
  }
  return (
    <div className="view">
      <h1>{AccMsgs[locale].title}</h1>
      { renderAccountCountainer() }
    </div>
  );
}
