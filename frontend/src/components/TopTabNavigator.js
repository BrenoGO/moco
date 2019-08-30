import React from 'react';
import { NavLink } from 'react-router-dom';

import './TopTabNavigator.css';

export default function TopTabNavigator() {
  return (
    <nav id="topTabNav">
      <NavLink className="navLink" activeClassName="active" to="/Operations"><span>Operations</span></NavLink>
      <NavLink className="navLink" activeClassName="active" to="/Accounts">Accounts</NavLink>
      <NavLink className="navLink" activeClassName="active" to="/Reports">Reports</NavLink>
      <NavLink className="navLink" activeClassName="active" to="/Settings">Settings</NavLink>
    </nav>
  );
}
