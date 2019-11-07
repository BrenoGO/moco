import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import './operations.css';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';
import { RegistersService } from '../../services/RegistersService';
import { OperationsService } from '../../services/OperationsService';


import Select from '../Select';


export default function FutureOper() {
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector(state => (state.DefaultsReducer));

  const initialValue = locale !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';
  const initialWhatId = defaultAccounts.whatAccounts.expense;
  const initialWhereId = defaultAccounts.whereAccounts.ToPay;
  const today = new Date();
  const todayPlus30 = new Date();
  todayPlus30.setDate(todayPlus30.getDate() + 30);

  const [bills, setBills] = useState([
    {
      date: todayPlus30,
      value: initialValue
    }
  ]);
  const [opValue, setOpValue] = useState(initialValue);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(initialWhatId);
  const [whereAccountId, setWhereAccountId] = useState(initialWhereId);
  const [whatAccounts, setWhatAccounts] = useState({ id: defaultAccounts.expense, name: 'expense' });
  const [whereAccounts, setWhereAccounts] = useState({ id: defaultAccounts.toPay, name: 'ToPay' });
  const [emitDate, setEmitDate] = useState(today);

  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccounts.id);
  const whereAccountsToSelect = helper.organizedAccounts(accounts, whereAccounts.id);

  function setAccounts(type) {
    if (type === 'expense') {
      setWhatAccounts({ id: defaultAccounts.expense, name: 'expense' });
      setWhatAccountId(defaultAccounts.whatAccounts.expense);
      setWhereAccounts({ id: defaultAccounts.ToPay, name: 'ToPay' });
      setWhatAccountId(defaultAccounts.whereAccounts.ToPay);
    } else {
      setWhatAccounts({ id: defaultAccounts.income, name: 'income' });
      setWhatAccountId(defaultAccounts.whatAccounts.income);
      setWhereAccounts({ id: defaultAccounts.ToReceive, name: 'ToReceive' });
      setWhatAccountId(defaultAccounts.whereAccounts.ToReceive);
    }
  }

  function editBillValue(index, value) {
    setBills(bills.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value: helper.currencyFormatter(locale, value) };
    }));
  }

  function editOnBlur() {
    const sum = bills.reduce((a, b, i) => {
      if (i === 1) {
        return helper.toNumber(a.value) + helper.toNumber(b.value);
      }
      return a + helper.toNumber(b.value);
    });
    setOpValue(helper.currencyFormatter(locale, sum));
  }

  function editBillDate(index, value) {
    setBills(bills.map((item, i) => {
      if (index !== i) return item;
      return { ...item, date: value };
    }));
  }

  function distributeValue(strValue, tempBills) {
    const installments = tempBills.length;
    const value = helper.toNumber(strValue);
    const instVal = Number((value / installments).toFixed(2));
    return (tempBills.map((bill, index) => {
      if (index === 0) {
        if (value !== instVal * installments) {
          const dif = value - instVal * installments;
          const newValue = instVal + dif;
          return { ...bill, value: helper.currencyFormatter(locale, newValue) };
        }
      }
      return { ...bill, value: helper.currencyFormatter(locale, instVal) };
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
    setWhatAccountId(initialWhatId);
    setWhereAccountId(initialWhereId);
    setWhatAccounts({ id: 2, name: 'expense' });
    setEmitDate(new Date());
  }

  function handleValueChange(value) {
    setOpValue(helper.currencyFormatter(locale, value));
    const newBills = distributeValue(value, bills);
    setBills(newBills);
  }

  function handleInstallmentsChange(e) {
    const installments = e.target.value;
    let newBills = [];
    if (installments > bills.length) { // added installment
      if (installments - bills.length === 1) {
        const date = new Date(bills[installments - 2].date);
        date.setDate(date.getDate() + 30);
        newBills = [...bills, { date, value: initialValue }];
      } else {
        for (let i = 0; i < installments; i++) {
          if (i === 0) {
            newBills.push({ date: todayPlus30, value: initialValue });
          } else {
            const date = new Date(newBills[i - 1].date);
            date.setDate(date.getDate() + 30);
            newBills.push({ date, value: initialValue });
          }
        }
      }
    } else if (installments > 1) newBills = bills.slice(0, installments);
    else newBills = bills.slice(0, 1);
    newBills = distributeValue(opValue, newBills);
    setBills(newBills);
  }

  async function submit() {
    const value = helper.toNumber(opValue);
    if (value === 0) return alert('value is 0!');

    let type = 'ToPay';
    if (whatAccounts.name === 'income') type = 'ToReceive';

    const billsResp = await BillsService.store(bills.map((bill, index) => ({
      type,
      value: helper.toNumber(bill.value),
      dueDate: bill.date,
      emitDate,
      installment: `${index + 1}/${bills.length}`,
      whereAccount: whereAccountId
    })));

    const regResp = await RegistersService.store({
      opType: `${whatAccounts.name}${whereAccounts.name}`,
      emitDate,
      whereAccountId,
      whatAccountId,
      value: helper.toNumber(opValue),
    });

    const operObj = {
      registers: [regResp._id],
      bills: billsResp.map(bill => bill._id),
      emitDate,
      description: opDesc,
      notes: opNotes
    };
    if (opDesc) operObj.description = opDesc;
    if (opNotes) operObj.notes = opNotes;

    await OperationsService.store(operObj);

    return reSetState();
  }

  return (
    <>
      <div id="divSelectExpenseOrIncome">
        <div>
          {OperMsgs[locale].emitDate}
          <input
            type="date"
            value={helper.dateToInput(emitDate)}
            onChange={e => setEmitDate(helper.inputDateToNewDate(e.target.value))}
          />
        </div>
        <label htmlFor="selectExpenseOrIncome">
          {OperMsgs[locale].expOrInc}
          <select
            id="selectExpenseOrIncome"
            value={whatAccounts.name}
            onChange={e => setAccounts(e.target.value)}
          >
            <option value="expense">{OperMsgs[locale].expense}</option>
            <option value="income">{OperMsgs[locale].income}</option>
          </select>
        </label>
      </div>
      <div id="selectWhereAccount" className="selectAccount">
        <div id="whereAccountsSelectorLabel">{OperMsgs[locale].paymentOptions}</div>
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
      <div id="selectWhatAccount" className="selectAccount">
        <div id="whatAccountSelectorLabel">{OperMsgs[locale].whatAc}</div>
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
          {OperMsgs[locale].value}
          <input
            type="text"
            className="inValue"
            inputMode="numeric"
            id="opValue"
            value={opValue}
            onChange={e => handleValueChange(e.target.value)}
          />
          <button
            type="button"
            onClick={() => handleValueChange(
              opValue.substring(0, 1) === '-'
                ? opValue.substring(1)
                : `-${opValue}`,
            )}
          >
            {opValue.substring(0, 1) === '-' ? '+' : '-'}
          </button>
        </label>
      </div>
      <div id="divDescription">
        <label htmlFor="opDesc">
          {OperMsgs[locale].desc}
          <input type="text" id="opDesc" value={opDesc} onChange={e => setOpDesc(e.target.value)} />
        </label>
      </div>
      <div id="divNotes">
        <label htmlFor="opNotes">
          {OperMsgs[locale].notes}
          <input type="text" id="opNotes" value={opNotes} onChange={e => setOpNotes(e.target.value)} />
        </label>
      </div>
      <div id="bills">
        <div id="divPaymentInstallments">
          <label htmlFor="paymentInstallments">
            {OperMsgs[locale].installments}
            <select id="paymentInstallments" value={bills.length} onChange={e => handleInstallmentsChange(e)}>
              {
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (<option value={i}>{i}</option>))
              }
            </select>
          </label>
          {bills.map((bill, index) => (
            <div key={index} className="installment">
              <div className="installmentDate">
                {OperMsgs[locale].date}
                <input
                  type="date"
                  value={helper.dateToInput(bill.date)}
                  onChange={e => editBillDate(index, helper.inputDateToNewDate(e.target.value))}
                />
              </div>
              <div className="installmentValue">
                {OperMsgs[locale].value}
                <input
                  type="text"
                  className="inValue"
                  inputMode="numeric"
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
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </>
  );
}
