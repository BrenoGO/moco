import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import TopTabNavigator from './components/TopTabNavigator';
import PrivateRoute from './components/PrivateRoute';

import Login from './views/Login';
import Loading from './components/Loading';
import Root from './components/Root';
import Operations from './views/Operations';
import Accounts from './views/Accounts';
import Reports from './views/Reports';
import Settings from './views/Settings';

export default function Routes() {
  const logged = useSelector((state) => state.LoginReducer.logged);
  if (logged === undefined) return <Loading />;

  return (
    <div className="App">
      <Router>
        {logged && <TopTabNavigator />}
        <Switch>
          <Route
            path={`${process.env.PUBLIC_URL}/`}
            logged={logged}
            exact
            component={Root}
          />
          <Route
            path={`${process.env.PUBLIC_URL}/login`}
            logged={logged}
            exact
            component={Login}
          />
          <PrivateRoute
            path={`${process.env.PUBLIC_URL}/Operations`}
            component={Operations}
          />
          <PrivateRoute
            path={`${process.env.PUBLIC_URL}/Accounts`}
            component={Accounts}
          />
          <PrivateRoute
            path={`${process.env.PUBLIC_URL}/Reports`}
            component={Reports}
          />
          <PrivateRoute
            path={`${process.env.PUBLIC_URL}/Settings`}
            component={Settings}
          />
        </Switch>
      </Router>
    </div>
  );
}
