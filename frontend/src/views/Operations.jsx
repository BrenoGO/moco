import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import './views.css';

import { OperMsgs } from '../services/Messages';

import AtSight from '../components/Operations/AtSight';
import FutureOper from '../components/Operations/FutureOper';
import Complex from '../components/Operations/Complex';
import PayOrReceiveBill from '../components/Operations/PayOrReceiveBill';
import Transference from '../components/Operations/Transference';

export default function Operations() {
  const { locale } = useSelector(state => state.DefaultsReducer);

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
        <div id="header"><h1>{OperMsgs[locale].title}</h1></div>
        <div id="divOpTypeSelect">
          <label htmlFor="opType">
            {OperMsgs[locale].operType}
            <select id="opType" value={opType} onChange={e => setOpType(e.target.value)}>
              <option value="atSight">{OperMsgs[locale].optAtSight}</option>
              <option value="future">{OperMsgs[locale].optFuture}</option>
              <option value="complex">{OperMsgs[locale].optComp}</option>
              <option value="payOrReceiveBill">{OperMsgs[locale].optPayRecBill}</option>
              <option value="transference">{OperMsgs[locale].optTransf}</option>
            </select>
          </label>
        </div>
        {typeComponent()}
      </div>
    </div>
  );
}
