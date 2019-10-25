import React from 'react';
import { useSelector } from 'react-redux';

import { RepMsgs } from '../../services/Messages';

export default function Future() {
  const { locale } = useSelector(state => state.DefaultsReducer);

  return (
    <div><h1>{RepMsgs[locale].future}</h1></div>
  );
}
