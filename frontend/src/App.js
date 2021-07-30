import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import './App.css';
import 'antd/dist/antd.css';

import auth from './services/Auth';

import { setAccounts } from './actions/AccountsActions';
import { setDefaults, updateDefault } from './actions/DefaultsActions';

import Routes from './routes';

export default function App() {
  const [logged, setLogged] = useState(undefined);

  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      auth.login((accounts, defaults) => { // accounts and defaults are gotten in the login method
        dispatch(setAccounts(accounts));
        dispatch(setDefaults(defaults));
        setLogged(true);
      });
    } else {
      auth.logout(() => setLogged(false));
    }
  }, [dispatch]);

  useEffect(() => {
    const locale = localStorage.getItem('locale');
    if (locale) {
      dispatch(updateDefault('locale', locale));
    }
  }, [dispatch]);

  return <Routes logged={logged} />;
}
