import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { OperMsgs } from '../../services/Messages';
import './operations.css';

import ListOfBills from './ListOfBills';
import PayBill from './PayBill';

export default function PayOrReceiveBill() {
  const { locale } = useSelector(state => state.DefaultsReducer);

  const [type, setType] = useState('ToPay');
  const [action, setAction] = useState({ name: 'listBills', params: {} });

  return (
    <>
      <div id="divSelectExpenseOrIncome">
        <label htmlFor="selectExpenseOrIncome">
          {OperMsgs[locale].toPayOrToReceive}
          <select
            id="selectExpenseOrIncome"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="ToPay">{OperMsgs[locale].optToPay}</option>
            <option value="ToReceive">{OperMsgs[locale].optToRec}</option>
          </select>
        </label>
      </div>
      {action.name === 'listBills' && <ListOfBills type={type} setAction={setAction} />}
      {action.name === 'payBill' && <PayBill bill={action.params.bill} setAction={setAction} />}
    </>
  );
}
