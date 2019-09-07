import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import './App.css';
import './AppMobile.css';

import auth from './services/Auth';

import { setAccounts, setDefaults } from './actions/AccountsActions';

import Routes from './routes';

export default function App() {
  const [logged, setLogged] = useState(undefined);

  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      auth.login((accounts, defaults) => {
        dispatch(setAccounts(accounts));
        dispatch(setDefaults(defaults));
        setLogged(true);
      });
    } else {
      auth.logout(() => setLogged(false));
    }
  }, [dispatch]);

  return <Routes logged={logged} />;
}
