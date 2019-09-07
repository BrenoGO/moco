import React from 'react';
import { useSelector } from 'react-redux';

import './views.css';
import './Accounts.css';

import GroupAccount from '../components/Accounts/GroupAccount';


export default function Accounts() {
  const accounts = useSelector(state => state.AccountsReducer.accounts);


  function renderAccountCountainer() {
    const rootAccounts = accounts.filter(account => account.parents.length === 0);
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
      <h1>Accounts</h1>
      { renderAccountCountainer() }
    </div>
  );
}
