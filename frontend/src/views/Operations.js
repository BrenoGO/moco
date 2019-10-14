import React, { useState } from 'react';

import './views.css';

import AtSight from '../components/Operations/AtSight';
import FutureOper from '../components/Operations/FutureOper';
import Complex from '../components/Operations/Complex';
import PayOrReceiveBill from '../components/Operations/PayOrReceiveBill';
import Transference from '../components/Operations/Transference';

export default function Operations() {
  const [opType, setOpType] = useState('atSight');

  function typeComponent() {
    switch (opType) {
      case 'atSight':
        return (
          <AtSight />
        );
      case 'future':
        return (
          <FutureOper />
        );
      case 'complex':
        return (
          <Complex />
        );
      case 'payOrReceiveBill':
        return (
          <PayOrReceiveBill />
        );
      case 'transference':
        return (
          <Transference />
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
              <option value="future">Future Operation</option>
              <option value="complex">Complex Operation</option>
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
