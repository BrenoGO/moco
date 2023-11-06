import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Select } from 'antd';

import './views.css';

import { OperMsgs } from '../services/Messages';

import AtSight from '../components/Operations/AtSight';
import FutureOper from '../components/Operations/FutureOper';
import Complex from '../components/Operations/Complex';
import PayOrReceiveBill from '../components/Operations/PayOrReceiveBill';
import Transference from '../components/Operations/Transference';
import InternationalOper from '../components/Operations/InternationalOper';

export default function Operations() {
  const { locale } = useSelector((state) => state.DefaultsReducer);

  const [opType, setOpType] = useState('atSight');

  function typeComponent() {
    switch (opType) {
      case 'atSight':
        return <AtSight />;
      case 'future':
        return <FutureOper />;
      case 'complex':
        return <Complex />;
      case 'international':
        return <InternationalOper />;
      case 'payOrReceiveBill':
        return <PayOrReceiveBill />;
      case 'transference':
        return <Transference />;
      default:
        return false;
    }
  }

  return (
    <div className="view">
      <div id="operationView">
        <div id="header">
          <h1>{OperMsgs[locale].title}</h1>
        </div>
        <Select value={opType} onChange={setOpType} className="divOpTypeSelect">
          <Select.Option value="atSight">{OperMsgs[locale].optAtSight}</Select.Option>
          <Select.Option value="future">{OperMsgs[locale].optFuture}</Select.Option>
          <Select.Option value="complex">{OperMsgs[locale].optComp}</Select.Option>
          <Select.Option value="international">{OperMsgs[locale].optInternational}</Select.Option>
          <Select.Option value="payOrReceiveBill">{OperMsgs[locale].optPayRecBill}</Select.Option>
          <Select.Option value="transference">{OperMsgs[locale].optTransf}</Select.Option>
        </Select>
        {typeComponent()}
      </div>
    </div>
  );
}
