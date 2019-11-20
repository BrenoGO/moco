import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

import Spinner from '../Spinner';
import GeneralsAccs from './GeneralsAccs';

import './General.css';

export default function General() {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);

  const { locale, defaultAccounts } = useSelector(state => state.DefaultsReducer);
  const { accounts } = useSelector(state => state.AccountsReducer);

  const [initDate, setInitDate] = useState(initialDate);
  const [finalDate, setFinalDate] = useState(new Date());
  // const [incomeAcs, setIncomeAcs] = useState([defaultAccounts.income]);
  // const [expenseAcs, setExpenseAcs] = useState([defaultAccounts.expense]);

  const [registers, setRegisters] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let mounted = true;
    RegistersService.search({
      whatAccountId: { $exists: true },
      emitDate: {
        $gt: initDate,
        $lt: finalDate
      }
    })
      .then((resp) => {
        setLoading(false);
        if (mounted) setRegisters(resp);
      });
    return () => { mounted = false; };
  }, [initDate, finalDate]);


  const allIncomes = accounts.filter(item => item.parents.includes(defaultAccounts.income))
    .map(item => item.id);
  const incomes = registers.filter(item => allIncomes.includes(item.whatAccountId));
  let totalIncomes = 0;
  if (incomes.length > 0) {
    totalIncomes = incomes.reduce((a, b, i) => {
      if (i === 1) return a.value + b.value;
      return a + b.value;
    });
  }

  const allExpenses = accounts.filter(item => item.parents.includes(defaultAccounts.expense))
    .map(item => item.id);
  const expenses = registers.filter(item => allExpenses.includes(item.whatAccountId));
  let totalExpenses = 0;
  if (expenses.length > 0) {
    totalExpenses = expenses.reduce((a, b, i) => {
      if (i === 1) return a.value + b.value;
      return a + b.value;
    });
  }

  function handleDateChange(when, date) {
    switch (when) {
      case 'init':
        setInitDate(helper.inputDateToNewDate(date));
        break;
      case 'final':
        setFinalDate(helper.inputDateToNewDate(date));
        break;
      default:
        break;
    }
  }

  return (
    <div>
      <div><h2>In development</h2></div>
      {loading && <Spinner />}
      <div id="form">
        <GeneralsAccs type="groupAG" title="Incomes" acId={defaultAccounts.income} />
        <GeneralsAccs type="groupAG" title="Expenses" acId={defaultAccounts.expense} />
        <div>
          {RepMsgs[locale].initial}
          <input
            type="date"
            value={helper.dateToInput(initDate)}
            onChange={e => handleDateChange('init', e.target.value)}
          />
        </div>
        <div>
          {RepMsgs[locale].final}
          <input
            type="date"
            value={helper.dateToInput(finalDate)}
            onChange={e => handleDateChange('final', e.target.value)}
          />
        </div>
      </div>
      <div id="content">
        <p>
          Total of incomes:
          {' '}
          {helper.currencyFormatter(locale, totalIncomes)}
        </p>
        <p>
          Total of expenses:
          {' '}
          {helper.currencyFormatter(locale, totalExpenses)}
        </p>
        <p>
          Profit:
          {' '}
          {helper.currencyFormatter(locale, (totalIncomes - totalExpenses))}
        </p>
      </div>
    </div>
  );
}
