import React from 'react';
import { useSelector } from 'react-redux';

import { RepMsgs } from '../../services/Messages';

export default function General() {
  const { locale } = useSelector(state => state.DefaultsReducer);
  return (
    <div><h1>{RepMsgs[locale].general}</h1></div>
  );
}
