import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Bill from './Bill';
import Select from '../Select';
import Spinner from '../Spinner';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';
import { RegistersService } from '../../services/RegistersService';
import { OperationsService } from '../../services/OperationsService';

import { resetBalance } from '../../actions/DefaultsActions';

import './ListOfBills.css';

export default function ListOfBills(props) {
  const { bill, setAction } = props;

  const { defaultAccounts, balances, locale } = useSelector((state) => state.DefaultsReducer);
  const accounts = useSelector((state) => state.AccountsReducer.accounts);

  const whereAccountsToSelect = helper.organizedAccounts(
    accounts,
    defaultAccounts.currentAccounts,
  );

  const [paymentDate, setPaymentDate] = useState(new Date());
  const [whereAccountId, setWhereAccountId] = useState(
    defaultAccounts.whereAccounts.AtSight,
  );
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  async function handlePayment() {
    setLoading(true);
    if (bill.group) {
      bill.bills.forEach(async (item) => {
        await BillsService.pay(item._id, { paymentDate });
      });
    } else {
      await BillsService.pay(bill._id, { paymentDate });
    }

    const whereAccountBalance = balances.filter((ac) => ac.accountId === whereAccountId);

    const newBalance = bill.type === 'ToPay'
      ? Number((whereAccountBalance[0].balance - bill.value).toFixed(2))
      : Number((whereAccountBalance[0].balance + bill.value).toFixed(2));

    dispatch(resetBalance({ accountId: whereAccountId, balance: newBalance }));

    if (bill.group) {
      const register = await RegistersService.store({
        opType: 'payment',
        emitDate: paymentDate,
        whereAccountId,
        whereAccountBalance: newBalance,
        value: bill.type === 'ToPay' ? Number((-bill.value).toFixed(2)) : Number(bill.value.toFixed(2)),
      });
      await OperationsService.store({
        bills: bill.bills.map((item) => item._id),
        registers: [register._id],
        emitDate: paymentDate,
        description: 'Group Payment',
      });
    } else {
      await RegistersService.store({
        opType: 'payment',
        emitDate: paymentDate,
        whereAccountId,
        whereAccountBalance: newBalance,
        value: bill.type === 'ToPay' ? -bill.value : bill.value,
        bill: bill._id,
      });
    }
    setLoading(false);
    return setAction({ name: 'listBills', params: {} });
  }

  return (
    <>
      {loading && <Spinner />}
      <div id="payingBill">
        {OperMsgs[locale].payDate}
        <input
          type="date"
          value={helper.dateToInput(paymentDate)}
          onChange={(e) => setPaymentDate(helper.inputDateToNewDate(e.target.value))}
        />
        <div id="selectWhereAccount" className="selectAccount">
          <div id="whereAccountsSelectorLabel">{OperMsgs[locale].currAc}</div>
          <Select
            id="whereAccountsSelector"
            value={whereAccountId}
            onChange={setWhereAccountId}
            options={whereAccountsToSelect.map((account) => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name,
            }))}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handlePayment}>
          {OperMsgs[locale].confirmA}
        </button>
      </div>
      <Bill bill={bill} where="payBill" />
      <span
        className="returnToListBut actionBut"
        onClick={() => setAction({ name: 'listBills', params: {} })}
      >
        {OperMsgs[locale].returnList}
      </span>
    </>
  );
}
