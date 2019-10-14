import React, { useState } from 'react';

import './operations.css';

import ListOfBills from './ListOfBills';
import PayBill from './PayBill';

export default function PayOrReceiveBill() {
  const [type, setType] = useState('ToPay');
  const [action, setAction] = useState({ name: 'listBills', params: {} });

  return (
    <>
      <div id="divSelectExpenseOrIncome">
        <label htmlFor="selectExpenseOrIncome">
          To Pay or To Receive:
          <select
            id="selectExpenseOrIncome"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="ToPay">To Pay</option>
            <option value="ToReceive">To Receive</option>
          </select>
        </label>
      </div>
      {action.name === 'listBills' && <ListOfBills type={type} setAction={setAction} />}
      {action.name === 'payBill' && <PayBill bill={action.params.bill} setAction={setAction} />}
    </>
  );
}
