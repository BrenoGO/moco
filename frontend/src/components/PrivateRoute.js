import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import auth from '../services/Auth';

export default function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => (
        auth.isAuth() === true
          ? <Component {...props} />
          : <Redirect to="/login" />
      )}
    />
  );
}
