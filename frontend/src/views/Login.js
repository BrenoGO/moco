import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import './Login.css';

import auth from '../services/Auth';
import { UsersService } from '../services/UsersService';

import { setAccounts } from '../actions/AccountsActions';
import { setDefaults } from '../actions/DefaultsActions';

import Loading from '../components/Loading';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState({ bool: false, to: `${process.env.PUBLIC_URL}/` });

  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.isAuth()) setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Operations` });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const resp = await UsersService.login({ email, password });

    if (resp.error) {
      auth.logout(() => setRedirect({ bool: false, to: `${process.env.PUBLIC_URL}/` }));
      alert(resp.error);
      setLoading(false);
    } else {
      await localStorage.setItem('token', resp.token);
      auth.login(() => auth.login((accounts, defaults) => {
        dispatch(setAccounts(accounts));
        dispatch(setDefaults(defaults));
        setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Operations` });
        setLoading(false);
      }));
    }
  }

  if (loading) return <Loading />;
  if (redirect.bool) return <Redirect to={`${process.env.PUBLIC_URL}/Operations`} />;
  return (
    <div className="view">
      <h1>Login</h1>
      <form id="loginForm" onSubmit={handleSubmit}>
        <label htmlFor="email">
        E-mail:
          <input type="text" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label htmlFor="password">
        Password:
          <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button id="loginSubmit" className="but-primary-neutral" type="submit">Log In</button>
      </form>
    </div>
  );
}
