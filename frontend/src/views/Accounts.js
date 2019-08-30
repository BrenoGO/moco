import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './views.css';
import './Accounts.css';
import { AccountsService } from '../services/AccountsService';

import auth from '../services/Auth';
import GroupAccount from '../components/GroupAccount';
import { setAccounts } from '../actions/AccountsActions';

export default function Accounts(props) {
  const accounts = useSelector(state => state.AccountsReducer.accounts);

  const dispatch = useDispatch();

  useEffect(() => {
    AccountsService.listAll().then((resp) => {
      if (resp.error) {
        auth.logout(() => {
          localStorage.removeItem('token');
          props.history.push('/');
        });
      }
      dispatch(setAccounts(resp));
    });
  }, [props, dispatch]);

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
