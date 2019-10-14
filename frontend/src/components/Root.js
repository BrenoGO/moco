import React from 'react';

import { Redirect } from 'react-router-dom';

export default function Root({ logged }) {
  if (logged) return <Redirect to={`${process.env.PUBLIC_URL}/Operations`} />;
  return <Redirect to={`${process.env.PUBLIC_URL}/login`} />;
}
