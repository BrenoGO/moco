import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import './views.css';

import AtSight from '../components/Operations/AtSight';

export default function Operations() {
  const [opType, setOpType] = useState('atSight');

  const accounts = useSelector(state => state.AccountsReducer.accounts);

  function getChildren(id) {
    const children = accounts.filter(
      ac => (ac.parents[ac.parents.length - 1] === id)
    ).sort((a, b) => (a.id - b.id));
    return children;
  }
  function organizedAccounts(id) {
    const rootAccs = getChildren(id);
    const orgAc = [];

    function loopChildren(children) {
      if (children.length > 0) {
        children.forEach((child) => {
          orgAc.push(child);
          loopChildren(getChildren(child.id));
        });
      }
    }
    loopChildren(rootAccs);
    return (orgAc);
  }

  function typeComponent() {
    switch (opType) {
      case 'atSight':
        return (
          <AtSight organizedAccounts={organizedAccounts} />
        );
      default:
        return false;
    }
  }

  return (
    <div className="view">
      <div id="operationView">
        <div id="header"><h1>Operations</h1></div>
        <div id="divOpTypeSelect">
          <label htmlFor="opType">
            Type:
            <select id="opType" value={opType} onChange={e => setOpType(e.target.value)}>
              <option value="atSight">At Sight</option>
              <option value="generateBill">Generate Bill</option>
              <option value="payOrReceiveBill">Pay or Receive Bill</option>
              <option value="transference">Transference</option>
            </select>
          </label>
        </div>
        {typeComponent()}
      </div>
    </div>
  );
}
