import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import TopTabNavigator from './components/TopTabNavigator';
import PrivateRoute from './components/PrivateRoute';

import brazilFlag from './imgs/brazil.svg';
import usFlag from './imgs/united-states.svg';
import internacionalization from './services/Internacionalization';

import Login from './views/Login';
import Loading from './components/Loading';
import Root from './components/Root';
import Operations from './views/Operations';
import Accounts from './views/Accounts';
import Reports from './views/Reports';
import Settings from './views/Settings';

export default function Routes({ logged }) {
  if (logged === undefined) return <Loading />;

  return (
    <div className="App">
      <div id="flags">
        <img
          src={brazilFlag}
          className="flagImg"
          alt="brazilFlag"
          onClick={() => { internacionalization.setInitials('pt-BR'); }}
        />
        <img
          src={usFlag}
          className="flagImg"
          alt="usFlag"
          onClick={() => { internacionalization.setInitials('en-US'); }}
        />
      </div>
      <Router>
        <TopTabNavigator />
        <Switch>
          <Route
            path="/"
            exact
            component={Root}
          />
          <Route
            path="/login"
            exact
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
