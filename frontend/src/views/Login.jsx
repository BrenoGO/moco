import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  message, Form, Row, Col, Input, Button,
} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

import './Login.css';

import auth from '../services/Auth';
import { UsersService } from '../services/UsersService';
import { LoginMsgs } from '../services/Messages';

import { setAccounts } from '../actions/AccountsActions';
import { setDefaults } from '../actions/DefaultsActions';
import { setLogged } from '../actions/LoginActions';

import Flags from '../components/Flags';
import Loading from '../components/Loading';
import Logo from '../imgs/logo.png';

export default function Login() {
  const { locale } = useSelector((state) => state.DefaultsReducer);
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
      message.error(resp.error?.message || 'Unknown Error');
      dispatch(setLogged(false));
      setLoading(false);
    } else {
      await localStorage.setItem('token', resp.token);
      auth.login((accounts, defaults) => {
        dispatch(setLogged(true));
        dispatch(setAccounts(accounts));
        dispatch(setDefaults(defaults));
        setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Operations` });
        setLoading(false);
      });
    }
  }
  async function handleSignUp() {
    if (passwordSU !== confirmPasswordSU) return message.error('Confirming password different from password');
    setLoading(true);
    const resp = await UsersService.signUp({ name, email: emailSU, password: passwordSU });
    if (resp.error) {
      if (resp.error.code === 11000) message.error('E-mail already exists');
      else message.error(resp.error.message);
      dispatch(setLogged(false));
      return setLoading(false);
    }
    if (resp.token) {
      await localStorage.setItem('token', resp.token);
      dispatch(setLogged(true));
      dispatch(setAccounts(resp.accounts));
      dispatch(setDefaults(resp.defaults));
      setRedirect({ bool: true, to: `${process.env.PUBLIC_URL}/Settings` });
      return setLoading(false);
    }
    return message.error('error Signing Up');
  }

  if (loading) return <Loading />;
  if (redirect.bool) return <Redirect to={redirect.to} />;
  return (
    <div className="view">
      <Flags />
      <div id="loginDiv" className="flex-column">
        <img src={Logo} alt="logo" width="15%" />
        <h1>{LoginMsgs[locale].login}</h1>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              label={LoginMsgs[locale].email}
              required
            >
              <Input
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              label={LoginMsgs[locale].pw}
              required
            >
              <Input.Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          onClick={handleLogin}
        >
          {LoginMsgs[locale].login}
        </Button>
      </div>
      <div id="signUpDiv" className="flex-column">
        <h1>{LoginMsgs[locale].signUp}</h1>
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              label={LoginMsgs[locale].name}
              required
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item
              label={LoginMsgs[locale].email}
              required
            >
              <Input
                value={emailSU}
                type="email"
                onChange={(e) => setEmailSU(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              label={LoginMsgs[locale].pw}
              required
            >
              <Input.Password
                value={passwordSU}
                onChange={(e) => setPasswordSU(e.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              label={LoginMsgs[locale].cpw}
              required
            >
              <Input.Password
                value={confirmPasswordSU}
                onChange={(e) => setConfirmPasswordSU(e.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          onClick={handleSignUp}
        >
          {LoginMsgs[locale].signUp}
        </Button>
      </div>
    </div>
  );
}
