import React, { useState, useEffect } from 'react';
import './App.css';
import './AppMobile.css';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import auth from './services/Auth';
import TopTabNavigator from './components/TopTabNavigator';
import PrivateRoute from './components/PrivateRoute';
import Login from './views/Login';
import Operations from './views/Operations';
import Accounts from './views/Accounts';
import Reports from './views/Reports';
import Settings from './views/Settings';

export default function App() {
  const [pageTo, setPageTo] = useState('/');

  useEffect(() => {
    if (localStorage.getItem('token')) {
      auth.login(() => setPageTo('/Accounts'));
    } else {
      auth.logout(() => setPageTo('/login'));
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <TopTabNavigator />
        <Switch>
          <Route
            path="/"
            exact
            component={() => <Redirect to={pageTo} />}
          />
          <Route
            path="/login"
            component={Login}
          />
          <PrivateRoute
            path="/Operations"
            component={Operations}
          />
          <PrivateRoute
            path="/Accounts"
            component={Accounts}
          />
          <PrivateRoute
            path="/Reports"
            component={Reports}
          />
          <PrivateRoute
            path="/Settings"
            component={Settings}
          />
        </Switch>
      </Router>
    </div>
  );
}
