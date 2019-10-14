import React from 'react';
import { NavLink } from 'react-router-dom';

import './TopTabNavigator.css';

export default function TopTabNavigator() {
  return (
    <nav id="topTabNav">
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Operations`}><span>Operations</span></NavLink>
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Accounts`}>Accounts</NavLink>
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Reports`}>Reports</NavLink>
      <NavLink className="navLink" activeClassName="active" to={`${process.env.PUBLIC_URL}/Settings`}>Settings</NavLink>
    </nav>
  );
}
