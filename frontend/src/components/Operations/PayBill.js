import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Bill from './Bill';
import Select from '../Select';

import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';
import { RegistersService } from '../../services/RegistersService';

import { resetBalance } from '../../actions/DefaultsActions';

import './ListOfBills.css';


export default function ListOfBills(props) {
  const { bill, setAction } = props;

  const { defaultAccounts, balances } = useSelector(state => state.DefaultsReducer);
  const accounts = useSelector(state => state.AccountsReducer.accounts);

  const whereAccountsToSelect = helper.organizedAccounts(
    accounts,
    defaultAccounts.currentAccounts
  );

  const [paymentDate, setPaymentDate] = useState(new Date());
  const [whereAccountId, setWhereAccountId] = useState(
    defaultAccounts.whereAccounts.AtSight
  );

  const dispatch = useDispatch();

  async function handlePayment() {
    await BillsService.pay(bill._id, { paymentDate });

    const whereAccountBalance = balances.filter(ac => ac.accountId === whereAccountId);

    const newBalance = bill.type === 'ToPay'
      ? whereAccountBalance[0].balance - bill.value
      : whereAccountBalance[0].balance + bill.value;

    dispatch(resetBalance({ accountId: whereAccountId, balance: newBalance }));

    await RegistersService.store({
      opType: 'payment',
      emitDate: paymentDate,
      whereAccountId,
      whereAccountBalance: newBalance,
      value: bill.value,
      bill: bill._id
    });

    setAction({ name: 'listBills', params: {} });
  }

  return (
    <>
      <div id="payingBill">
        Payment Date:
        {' '}
        <input
          type="date"
          value={helper.dateToInput(paymentDate)}
          onChange={e => setPaymentDate(helper.inputDateToNewDate(e.target.value))}
        />
        <div id="selectWhereAccount" className="selectAccount">
          <div id="whereAccountsSelectorLabel">Payment Option:</div>
          <Select
            id="whereAccountsSelector"
            value={whereAccountId}
            onChange={setWhereAccountId}
            options={whereAccountsToSelect.map(account => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name
            }))}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handlePayment}>Confirm!</button>
      </div>
      <Bill bill={bill} where="payBill" />
      <span
        className="returnToListBut actionBut"
        onClick={() => setAction({ name: 'listBills', params: {} })}
      >
        Return to List
      </span>
    </>
  );
}
