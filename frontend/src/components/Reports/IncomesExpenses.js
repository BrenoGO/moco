import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Select from '../Select';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

import './IncomesExpenses.css';

export default function Expenses() {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);
  const initialType = 'expense';
  let total = 0;

  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector(state => state.DefaultsReducer);

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
    return () => { mounted = false; };
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
          <option value="expense">{RepMsgs[locale].expenses}</option>
          <option value="income">{RepMsgs[locale].incomes}</option>
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
      <div id="report">
        <table className="table">
          <thead>
            <tr>
              <td>{RepMsgs[locale].date}</td>
              <td>{RepMsgs[locale].value}</td>
              <td>{RepMsgs[locale].total}</td>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => {
              const emitDate = helper.formatDateAndTime(locale, new Date(reg.emitDate));
              const { value } = reg;
              total += value;
              return (
                <tr key={reg._id} className="register">
                  <td>{emitDate}</td>
                  <td className={value < 0 ? 'red' : ''}>{helper.currencyFormatter(locale, value)}</td>
                  <td>{helper.currencyFormatter(locale, total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
