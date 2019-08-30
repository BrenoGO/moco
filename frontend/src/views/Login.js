import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import './Login.css';

import auth from '../services/Auth';
import { UsersService } from '../services/UsersService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (auth.isAuth()) setRedirect(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const resp = await UsersService.login({ email, password });

    if (resp.error) {
      auth.logout(() => setRedirect(false));
      alert(resp.error);
    } else {
      await localStorage.setItem('token', resp.token);
      auth.login(() => setRedirect(true));
    }
  }

  return (
    <>
      { redirect && (
      <Redirect to="/accounts" />
      )}
      <div className="view">
        <h1>Login Area</h1>
        <form id="loginForm" onSubmit={handleSubmit}>
          <label htmlFor="email">
          E-mail:
            <input type="text" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
          </label>
          <label htmlFor="password">
          Password:
            <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <button id="loginSubmit" type="submit">Log In</button>
        </form>
      </div>
    </>
  );
}
