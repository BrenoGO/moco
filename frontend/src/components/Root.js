import React from 'react';

import { Redirect } from 'react-router-dom';

import auth from '../services/Auth';

export default function Root() {
  if (auth.isAuth()) return <Redirect to="/operations" />;
  return <Redirect to="/login" />;
}
