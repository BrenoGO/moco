import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import './Login.css';

import auth from '../services/Auth';
import { UsersService } from '../services/UsersService';
import { LoginMsgs } from '../services/Messages';

import { setAccounts } from '../actions/AccountsActions';
import { setDefaults } from '../actions/DefaultsActions';

import Flags from '../components/Flags';
import Loading from '../components/Loading';

export default function Login() {
  const { locale } = useSelector(state => state.DefaultsReducer);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState({ bool: false, to: `${process.env.PUBLIC_URL}/` });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailSU, setEmailSU] = useState('');
  const [passwordSU, setPasswordSU] = useState('');
  const [confirmPasswordSU, setConfirmPasswordSU] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.isAuth()) setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Operations` });
  }, []);

  async function handleLogin() {
    setLoading(true);
    const resp = await UsersService.login({ email, password });

    if (resp.error) {
      auth.logout(() => setRedirect({ bool: false, to: `${process.env.PUBLIC_URL}/` }));
      alert(resp.error);
      setLoading(false);
    } else {
      await localStorage.setItem('token', resp.token);
      auth.login((accounts, defaults) => {
        dispatch(setAccounts(accounts));
        dispatch(setDefaults(defaults));
        setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Operations` });
        setLoading(false);
      });
    }
  }
  async function handleSignUp() {
    if (passwordSU !== confirmPasswordSU) return alert('Confirming password different from password');
    setLoading(true);
    const resp = await UsersService.signUp({ name, email: emailSU, password: passwordSU });
    if (resp.error) {
      if (resp.error.code === 11000) alert('E-mail already exists');
      else alert(resp.error.message);
      return setLoading(false);
    }
    if (resp.token) {
      await localStorage.setItem('token', resp.token);
      dispatch(setAccounts(resp.accounts));
      dispatch(setDefaults(resp.defaults));
      setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Settings` });
      return setLoading(false);
    }
    console.log('error in signing up, resp:', resp);
    return alert('error Signing Up');
  }

  if (loading) return <Loading />;
  if (redirect.bool) return <Redirect to={redirect.to} />;
  return (
    <div className="view">
      <Flags />
      <div id="loginDiv" className="flex-column">
        <h1>{LoginMsgs[locale].login}</h1>
        <label htmlFor="email">
          {LoginMsgs[locale].email}
          <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label htmlFor="password">
          {LoginMsgs[locale].pw}
          <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button
          id="loginSubmit"
          className="but-primary-neutral"
          type="button"
          onClick={handleLogin}
        >
          {LoginMsgs[locale].login}
        </button>
      </div>
      <div id="signUpDiv" className="flex-column">
        <h1>{LoginMsgs[locale].signUp}</h1>
        <label htmlFor="name">
          {LoginMsgs[locale].name}
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label htmlFor="emailSU">
          {LoginMsgs[locale].email}
          <input type="email" id="emailSU" value={emailSU} onChange={e => setEmailSU(e.target.value)} />
        </label>
        <label htmlFor="passwordSU">
          {LoginMsgs[locale].pw}
          <input type="password" id="passwordSU" value={passwordSU} onChange={e => setPasswordSU(e.target.value)} />
        </label>
        <label htmlFor="confirmPasswordSU">
          {LoginMsgs[locale].cpw}
          <input type="password" id="confirmPasswordSU" value={confirmPasswordSU} onChange={e => setConfirmPasswordSU(e.target.value)} />
        </label>
        <button
          id="loginSubmit"
          className="but-primary-neutral"
          type="button"
          onClick={handleSignUp}
        >
          {LoginMsgs[locale].signUp}
        </button>
      </div>
    </div>
  );
}
