import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Select from '../Select';
import Spinner from '../Spinner';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

import './IncomesExpenses.css';

export default function Expenses() {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);
  const initialType = 'expense';

  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const expenseAccounts = helper.organizedAccounts(accounts, defaultAccounts.expense);
  const incomeAccounts = helper.organizedAccounts(accounts, defaultAccounts.income);

  const [type, setType] = useState(initialType);
  const [acId, setAcId] = useState(defaultAccounts.whatAccounts[initialType]);
  const [initDate, setInitDate] = useState(initialDate);
  const [finalDate, setFinalDate] = useState(new Date());
  const [registers, setRegisters] = useState([]);
  let total = 0;
  if (registers[0]) {
    if (registers[1]) {
      total = registers.reduce((a, b, i) => {
        if (i === 1) return a.value + b.value;
        return a + b.value;
      });
    } else {
      total = registers[0].value;
    }
  }

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let mounted = true;
    RegistersService.search({
      whatAccountId: acId,
      emitDate: {
        $gt: initDate,
        $lt: finalDate,
      },
    }).then((regs) => {
      setLoading(false);
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
      {loading && <Spinner />}
      <div>
        <select id="typeSelect" value={type} onChange={(e) => handleTypeChange(e.target.value)}>
          <option value="expense">{RepMsgs[locale].expenses}</option>
          <option value="income">{RepMsgs[locale].incomes}</option>
        </select>
      </div>
      <div id="form">
        <Select
          value={acId}
          onChange={setAcId}
          options={type === 'expense'
            ? expenseAccounts.map((account) => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name,
            }))
            : incomeAccounts.map((account) => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name,
            }))}
        />
        <div>
          {RepMsgs[locale].initial}
          <input
            type="date"
            value={helper.dateToInput(initDate)}
            onChange={(e) => handleDateChange('init', e.target.value)}
          />
        </div>
        <div>
          {RepMsgs[locale].final}
          <input
            type="date"
            value={helper.dateToInput(finalDate)}
            onChange={(e) => handleDateChange('final', e.target.value)}
          />
        </div>
      </div>
      <div id="report">
        <table className="table">
          <thead>
            <tr>
              <td>{RepMsgs[locale].date}</td>
              <td>{RepMsgs[locale].thAcc}</td>
              <td>{RepMsgs[locale].value}</td>
              <td>{RepMsgs[locale].total}</td>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg, i) => {
              const emitDate = helper.formatDate(locale, new Date(reg.emitDate));
              let { value } = reg;
              const { opType } = reg;
              if (i > 0) total -= registers[i - 1].value;
              // console.log(total, i);
              if (opType.match(/expense/)) {
                value = -value;
              }
              let desc = reg.description;
              if (!desc) {
                switch (reg.opType) {
                  case 'transference':
                    desc = RepMsgs[locale].transference;
                    break;
                  case 'payment':
                    desc = RepMsgs[locale].payment;
                    break;
                  default:
                    break;
                }
              }
              return (
                <tr key={reg._id} className="register">
                  <td>{emitDate}</td>
                  <td>{desc}</td>
                  <td className={value < 0 ? 'red' : ''}>{helper.currencyFormatter(locale, value)}</td>
                  <td className={total > 0 ? 'red' : ''}>{helper.currencyFormatter(locale, -total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
