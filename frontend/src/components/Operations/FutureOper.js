import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import './operations.css';

import internacionalization from '../../services/Internacionalization';
import { RegistersService } from '../../services/RegistersService';

import { resetBalance } from '../../actions/AccountsActions';

import Select from '../Select';

export default function FutureOper(props) {
  const initialValue = internacionalization.getInitials() !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';
  const initialWhereId = 31;
  const today = new Date();
  const todayPlus30 = new Date();
  todayPlus30.setDate(todayPlus30.getDate() + 30);

  const { organizedAccounts } = props;

  const defaults = useSelector(state => (state.AccountsReducer.defaults));
  const dispatch = useDispatch();

  const [bills, setBills] = useState([
    {
      date: todayPlus30,
      value: initialValue
    }
  ]);
  const [opValue, setOpValue] = useState(initialValue);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaults.defaultAccounts.whatId);
  const [whereAccountId, setWhereAccountId] = useState(initialWhereId);
  const [whatAccounts, setWhatAccounts] = useState({ id: 2, name: 'expense' });
  const [emitDate, setEmitDate] = useState(today);

  const futureAccounts = organizedAccounts(4);
  const whatAccountsToSelect = organizedAccounts(whatAccounts.id);

  useEffect(() => {
    if (defaults.defaultAccounts.whatId) setWhatAccountId(defaults.defaultAccounts.whatId);
  }, [defaults]);

  function editBillValue(index, value) {
    setBills(bills.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value: internacionalization.currencyFormatter(value) };
    }));
  }

  function editOnBlur() {
    const sum = bills.reduce((a, b, i) => {
      if (i === 1) {
        return internacionalization.toNumber(a.value) + internacionalization.toNumber(b.value);
      }
      return a + internacionalization.toNumber(b.value);
    });
    setOpValue(internacionalization.currencyFormatter(sum));
  }

  function editBillDate(index, value) {
    setBills(bills.map((item, i) => {
      if (index !== i) return item;
      return { ...item, date: value };
    }));
  }

  function distributeValue(strValue, tempBills) {
    const installments = tempBills.length;
    const value = internacionalization.toNumber(strValue);
    const instVal = Number((value / installments).toFixed(2));
    return (tempBills.map((bill, index) => {
      if (index === 0) {
        if (value !== instVal * installments) {
          const dif = value - instVal * installments;
          const newValue = instVal + dif;
          return { ...bill, value: internacionalization.currencyFormatter(newValue) };
        }
      }
      return { ...bill, value: internacionalization.currencyFormatter(instVal) };
    }));
  }

  function reSetState() {
    setBills([
      {
        date: todayPlus30,
        value: initialValue
      }
    ]);
    setOpValue(initialValue);
    setOpDesc('');
    setOpNotes('');
    setWhatAccountId(defaults.defaultAccounts.whatId);
    setWhereAccountId(initialWhereId);
    setWhatAccounts({ id: 2, name: 'expense' });
    setEmitDate(new Date());
  }

  function handleValueChange(value) {
    setOpValue(internacionalization.currencyFormatter(value));
    const newBills = distributeValue(value, bills);
    setBills(newBills);
  }

  function handleInstallmentsChange(e) {
    const installments = e.target.value;
    let newBills = [];
    if (installments > bills.length) { // aumentou parcela
      const date = new Date(bills[installments - 2].date);
      date.setDate(date.getDate() + 30);
      newBills = [...bills, { date, value: initialValue }];
    } else if (installments > 1) newBills = bills.slice(0, installments);
    else newBills = bills.slice(0, 1);
    newBills = distributeValue(opValue, newBills);
    setBills(newBills);
  }

  function submit() {
    const lastWhereAccountBalance = defaults.balances.filter(
      item => item.accountId === whereAccountId
    )[0].balance;

    const value = internacionalization.toNumber(opValue);
    if (value === 0) return alert('value is 0!');

    const whereAccountBalance = lastWhereAccountBalance + value;
    reSetState();
    dispatch(resetBalance({ accountId: whereAccountId, balance: whereAccountBalance }));
    const Obj = {
      opType: `${whatAccounts.name}AtSight`,
      whereAccountId,
      whatAccountId,
      whereAccountBalance,
      value,
    };

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
          <DatePicker selected={emitDate} onChange={d => setEmitDate(d)} />
        </div>
        <label htmlFor="selectExpenseOrIncome">
          Expense or Income:
          <select
            id="selectExpenseOrIncome"
            value={whatAccounts.name}
            onChange={e => setWhatAccounts(
              e.target.value === 'expense' ? { id: 2, name: 'expense' } : { id: 1, name: 'income' }
            )}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>
      <div id="selectWhereAccount" className="selectAccount">
        <div id="whereAccountsSelectorLabel">Future Account:</div>
        <Select
          id="whereAccountsSelector"
          value={whereAccountId}
          onChange={setWhereAccountId}
          options={futureAccounts.map(account => ({
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
          <input
            type="text"
            id="opValue"
            value={opValue}
            onChange={e => handleValueChange(e.target.value)}
          />
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
      <div id="bills">
        <div id="divPaymentInstallments">
          <label htmlFor="paymentInstallments">
            Installments:
            {' '}
            <input type="number" value={bills.length} onChange={e => handleInstallmentsChange(e)} />
          </label>
          {bills.map((bill, index) => (
            <div key={index} className="installment">
              <div className="installmentDate">
                Date:
                {' '}
                <DatePicker selected={bill.date} onChange={d => editBillDate(index, d)} />
              </div>
              <div className="installmentValue">
                Value:
                {' '}
                <input
                  type="text"
                  value={bill.value}
                  onChange={e => editBillValue(index, e.target.value)}
                  onBlur={e => editOnBlur(index, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        {}
      </div>
      <div id="divButRegister">
        <button type="button" className="but-primary-neutral" onClick={submit}>Register</button>
      </div>
    </>
  );
}
