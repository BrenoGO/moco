import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Select from '../Select';

import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';
import internacionalization from '../../services/Internacionalization';

import './IncomesExpenses.css';

export default function Expenses() {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);
  const initialType = 'expense';
  let total = 0;

  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts } = useSelector(state => state.DefaultsReducer);

  const expenseAccounts = helper.organizedAccounts(accounts, defaultAccounts.expense);
  const incomeAccounts = helper.organizedAccounts(accounts, defaultAccounts.income);

  const [type, setType] = useState(initialType);
  const [acId, setAcId] = useState(defaultAccounts.whatAccounts[initialType]);
  const [initDate, setInitDate] = useState(initialDate);
  const [finalDate, setFinalDate] = useState(new Date());
  const [registers, setRegisters] = useState([]);

  useEffect(() => {
    let mounted = true;
    RegistersService.search({
      whatAccountId: acId,
      emitDate: {
        $gt: initDate,
        $lt: finalDate
      }
    }).then((regs) => {
      if (mounted)setRegisters(regs);
    });
    return () => {
      mounted = false;
    };
  }, [acId, initDate, finalDate]);

  function handleTypeChange(newType) {
    setType(newType);
    setAcId(defaultAccounts.whatAccounts[newType]);
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
      <div>
        <select id="typeSelect" value={type} onChange={e => handleTypeChange(e.target.value)}>
          <option value="expense">Expenses</option>
          <option value="income">Incomes</option>
        </select>
      </div>
      <div id="form">
        <Select
          value={acId}
          onChange={setAcId}
          options={type === 'expense'
            ? expenseAccounts.map(account => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name
            }))
            : incomeAccounts.map(account => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name
            }))
          }
        />
        <div>
      Initial:
          {' '}
          <input
            type="date"
            value={helper.dateToInput(initDate)}
            onChange={e => handleDateChange('init', e.target.value)}
          />
        </div>
        <div>
      Final:
          {' '}
          <input
            type="date"
            value={helper.dateToInput(finalDate)}
            onChange={e => handleDateChange('final', e.target.value)}
          />
        </div>
      </div>
      <div id="report">
        <table>
          <thead>
            <tr>
              <td>opType</td>
              <td>Date</td>
              <td>what</td>
              <td>value</td>
              <td>Total</td>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => {
              const whatAc = accounts.filter(item => item.id === reg.whatAccountId)[0];
              const emitDate = internacionalization.formatDateAndTime(new Date(reg.emitDate));
              total += reg.value;
              return (
                <tr key={reg._id} className="register">
                  <td>{reg.opType}</td>
                  <td>{emitDate}</td>
                  <td>{whatAc ? whatAc.name : ''}</td>
                  <td>{internacionalization.currencyFormatter(reg.value)}</td>
                  <td>{internacionalization.currencyFormatter(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
