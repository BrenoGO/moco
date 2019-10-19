import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './operations.css';

import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

import { resetBalance } from '../../actions/DefaultsActions';

import Select from '../Select';

export default function AtSight() {
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts, balances, locale } = useSelector(state => (state.DefaultsReducer));
  const initialValue = locale !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';
  const dispatch = useDispatch();

  const [opValue, setOpValue] = useState(initialValue);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaultAccounts.whatAccounts.expense);
  const [whereAccountId, setWhereAccountId] = useState(
    defaultAccounts.whereAccounts.AtSight
  );
  const [whatAccounts, setWhatAccounts] = useState({ id: defaultAccounts.expense, name: 'expense' });
  const [emitDate, setEmitDate] = useState(new Date());

  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);
  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccounts.id);

  function editOpValue(value) {
    setOpValue(helper.currencyFormatter(locale, value));
  }

  function handleWhatAccountsChange(type) {
    setWhatAccounts({ id: defaultAccounts[type], name: type });
    setWhatAccountId(defaultAccounts.whatAccounts[type]);
  }

  function reSetState() {
    setOpValue(initialValue);
    setOpDesc('');
    setOpNotes('');
    setWhatAccountId(defaultAccounts.whatAccounts.expense);
    setWhereAccountId(defaultAccounts.whereAccounts.AtSight);
    setWhatAccounts({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(new Date());
  }

  function submit() {
    const value = helper.toNumber(opValue);

    if (value === 0) return alert('value is 0!');

    const lastWhereBalance = balances.filter(
      item => item.accountId === whereAccountId
    )[0].balance;

    const whereAccountBalance = whatAccounts.name === 'expense'
      ? lastWhereBalance - value
      : lastWhereBalance + value;

    dispatch(resetBalance({ accountId: whereAccountId, balance: whereAccountBalance }));
    const Obj = {
      opType: `${whatAccounts.name}AtSight`,
      whereAccountId,
      whatAccountId,
      whereAccountBalance,
      value,
      emitDate
    };
    reSetState();

    if (opDesc) Obj.description = opDesc;
    if (opNotes) Obj.notes = opNotes;

    return RegistersService.store(Obj);
  }

  return (
    <>
      <div id="divSelectExpenseOrIncome">
        <div>
          Emit date:
          {' '}
          <input
            type="date"
            value={helper.dateToInput(emitDate)}
            onChange={e => setEmitDate(helper.inputDateToNewDate(e.target.value))}
          />
        </div>
        <label htmlFor="selectExpenseOrIncome">
          Expense or Income:
          <select
            id="selectExpenseOrIncome"
            value={whatAccounts.name}
            onChange={e => handleWhatAccountsChange(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>
      <div id="selectWhereAccount" className="selectAccount">
        <div id="whereAccountsSelectorLabel">Current Account:</div>
        <Select
          id="whereAccountsSelector"
          value={whereAccountId}
          onChange={setWhereAccountId}
          options={currentAccounts.map(account => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name
          }))}
        />
      </div>
      <div id="selectWhatAccount" className="selectAccount">
        <div id="whatAccountSelectorLabel">What Account:</div>
        <Select
          id="whatAccountSelector"
          value={whatAccountId}
          onChange={setWhatAccountId}
          options={whatAccountsToSelect.map(account => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name
          }))}
        />
      </div>
      <div id="divValue">
        <label htmlFor="opValue">
          Value:
          <input type="text" id="opValue" value={opValue} onChange={e => editOpValue(e.target.value)} />
        </label>
      </div>
      <div id="divDescription">
        <label htmlFor="opDesc">
          Description:
          <input type="text" id="opDesc" value={opDesc} onChange={e => setOpDesc(e.target.value)} />
        </label>
      </div>
      <div id="divNotes">
        <label htmlFor="opNotes">
          Notes:
          <input type="text" id="opNotes" value={opNotes} onChange={e => setOpNotes(e.target.value)} />
        </label>
      </div>
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>Register</button>
      </div>
    </>
  );
}
