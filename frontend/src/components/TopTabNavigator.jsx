import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { NavBarMsgs } from '../services/Messages';
import './TopTabNavigator.css';

export default function TopTabNavigator() {
  const { locale } = useSelector((state) => state.DefaultsReducer);

  return (
    <nav id="topTabNav">
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Operations`}>
        {NavBarMsgs[locale].oper}
      </NavLink>
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Accounts`}>
        {NavBarMsgs[locale].acc}
      </NavLink>
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Reports`}>
        {NavBarMsgs[locale].reports}
      </NavLink>
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Settings`}>
        {NavBarMsgs[locale].settings}
      </NavLink>
    </nav>
  );
}
