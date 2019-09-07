import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import './operations.css';

import internacionalization from '../../services/Internacionalization';
import { RegistersService } from '../../services/RegistersService';

import Select from '../Select';

export default function AtSight(props) {
  const { organizedAccounts } = props;

  const defaults = useSelector(state => (state.AccountsReducer.defaults));

  const [opValue, setOpValue] = useState(internacionalization.getInitials() !== 'pt-BR' ? '0.00' : '0,00');
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaults.defaultAccounts.whatId);
  const [whereAccountId, setWhereAccountId] = useState(
    defaults.defaultAccounts.whereId
  );
  const [whatAccounts, setWhatAccounts] = useState({ id: 2, name: 'expense' });

  const currentAccounts = organizedAccounts(3);
  const whatAccountsToSelect = organizedAccounts(whatAccounts.id);

  useEffect(() => {
    if (defaults.defaultAccounts.whereId) setWhereAccountId(defaults.defaultAccounts.whereId);
    if (defaults.defaultAccounts.whatId) setWhatAccountId(defaults.defaultAccounts.whatId);
  }, [defaults]);

  function editOpValue(value) {
    setOpValue(internacionalization.currencyFormatter(value));
  }

  function submit() {
    const whereAccountBalance = defaults.balances.filter(
      item => item.accountId === whereAccountId
    )[0].balance;
    const Obj = {
      opType: `${whatAccounts.name}AtSight`,
      whereAccountId,
      whatAccountId,
      whereAccountBalance
    };

    // setting value and testing
    let value = (opValue.replace(/\D/gi, ''));
    if (value === '') value = '000';
    if (value.length === 1) value = `00${value}`;
    value = Number(`${value.substring(0, value.length - 2)}.${value.substr(-2, 2)}`);
    if (value === 0) return alert('value is 0!');
    Obj.value = value;

    if (opDesc) Obj.description = opDesc;
    if (opNotes) Obj.notes = opNotes;
    console.log(Obj);

    return RegistersService.store(Obj);
  }

  return (
    <>
      <div id="divSelectExpenseOrIncome">
        <label htmlFor="selectExpenseOrIncome">
          Expense or Income:
          <select
            id="selectExpenseOrIncome"
            value={whatAccounts.name}
            onChange={e => setWhatAccounts(
              e.target.value === 'expense' ? { id: 2, name: 'expense' } : { id: 1, name: 'incomes' }
            )}
          >
            <option value="expense">Expense</option>
            <option value="income">Incomes</option>
          </select>
        </label>
      </div>
      <div id="selectWhereAccount" className="selectAccount">
        <div id="whereAccountsSelectorLabel">Current Accounts:</div>
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
        <div id="whatAccountSelectorLabel">What Accounts:</div>
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
        <button type="button" className="but-primary-neutral" onClick={submit}>Register</button>
      </div>
    </>
  );
}
