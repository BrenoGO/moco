import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';
import { OperationsService } from '../../services/OperationsService';

import { resetBalance } from '../../actions/DefaultsActions';

import Select from '../Select';

export default function Transference() {
  const { defaultAccounts, balances, locale } = useSelector(state => state.DefaultsReducer);
  const { accounts } = useSelector(state => state.AccountsReducer);
  const initialValue = locale !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';

  const whereAccountsToSelect = helper.organizedAccounts(
    accounts,
    defaultAccounts.currentAccounts
  );

  const [transferenceDate, setTransferenceDate] = useState(new Date());
  const [whereAccountIdTo, setWhereAccountIdTo] = useState(defaultAccounts.transferences.to);
  const [whereAccountIdFrom, setWhereAccountIdFrom] = useState(defaultAccounts.transferences.from);
  const [strValue, setStrValue] = useState(initialValue);

  const dispatch = useDispatch();

  function reSetState() {
    setTransferenceDate(new Date());
    setWhereAccountIdTo(defaultAccounts.transferences.to);
    setWhereAccountIdFrom(defaultAccounts.transferences.from);
    setStrValue(initialValue);
  }

  async function transfer() {
    const value = helper.toNumber(strValue);

    const fromAccountBalance = balances.filter(ac => ac.accountId === whereAccountIdFrom);
    const newFromBalance = fromAccountBalance[0].balance - value;
    const RegFrom = await RegistersService.store({
      opType: 'transference',
      emitDate: transferenceDate,
      whereAccountId: whereAccountIdFrom,
      whereAccountBalance: newFromBalance,
      value: -value,
    });
    dispatch(resetBalance({ accountId: whereAccountIdFrom, balance: newFromBalance }));

    const toAccountBalance = balances.filter(ac => ac.accountId === whereAccountIdTo);
    const newToBalance = toAccountBalance[0].balance + value;
    const RegTo = await RegistersService.store({
      opType: 'transference',
      emitDate: transferenceDate,
      whereAccountId: whereAccountIdTo,
      whereAccountBalance: newToBalance,
      value,
    });
    dispatch(resetBalance({ accountId: whereAccountIdTo, balance: newToBalance }));

    await OperationsService.store({
      registers: [RegFrom, RegTo],
      emitDate: transferenceDate
    });

    reSetState();
  }
  return (
    <div id="transferenceDiv">
      <div>
        {OperMsgs[locale].transfDate}
        <input
          type="date"
          value={helper.dateToInput(transferenceDate)}
          onChange={e => setTransferenceDate(helper.inputDateToNewDate(e.target.value))}
        />
      </div>
      <div id="selectFromAccount" className="selectAccount">
        <div id="fromSelectorLabel">{OperMsgs[locale].transFromAc}</div>
        <Select
          value={whereAccountIdFrom}
          onChange={setWhereAccountIdFrom}
          options={whereAccountsToSelect.map(account => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name
          }))}
        />
      </div>
      <div id="selectToAccount" className="selectAccount">
        <div id="toSelectorLabel">{OperMsgs[locale].transToAc}</div>
        <Select
          value={whereAccountIdTo}
          onChange={setWhereAccountIdTo}
          options={whereAccountsToSelect.map(account => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name
          }))}
        />
      </div>
      <div>
        {OperMsgs[locale].value}
        <input
          type="text"
          value={strValue}
          onChange={e => setStrValue(helper.currencyFormatter(locale, e.target.value))}
        />
      </div>
      <div>
        <button type="button" className="btn btn-primary" onClick={transfer}>
          {OperMsgs[locale].transfA}
        </button>
      </div>
    </div>
  );
}
