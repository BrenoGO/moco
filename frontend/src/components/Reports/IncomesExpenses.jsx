import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input } from 'antd';

import Select from '../Select';
import Spinner from '../Spinner';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { ReportsService } from '../../services/ReportsService';

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
  const [searchDesc, setSearchDesc] = useState('');
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
    let mounted = true;

    async function getReportData() {
      setLoading(true);
      const regs = await ReportsService.incomeOrExpense({
        searchDesc,
        opTypePrefix: type,
        whatAccountId: acId,
        emitDate: {
          $gt: initDate,
          $lt: finalDate,
        },
      });

      if (mounted) {
        setRegisters(regs);
        setLoading(false);
      }
    }

    if (!searchDesc) {
      getReportData()
    } else {
      helper.debounce(getReportData, 1000)();
    }

    return () => { mounted = false; };
  }, [type, acId, initDate, finalDate, searchDesc]);

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
            ? [{value: undefined, disabled: false, label: 'Vazio'}].concat(expenseAccounts.map((account) => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name,
            })))
            : [{value: undefined, disabled: false, label: 'Vazio'}].concat(incomeAccounts.map((account) => ({
              value: account.id,
              disabled: !account.allowValue,
              label: account.name,
            })))}
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
        <Form.Item
            label="Busca na Descrição"
          >
            <Input
              value={searchDesc}
              onChange={(e) => setSearchDesc(e.target.value)}
            />
          </Form.Item>
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

              if (opType.match(/expense/)) {
                value = -value;
              }
              let desc = '';

              if (!acId || !reg.description) {
                const account = type === 'expense'
                  ? expenseAccounts.find((acc) => acc.id === reg.whatAccountId)
                  : incomeAccounts.find((acc) => acc.id === reg.whatAccountId);

                if (!account) {
                  console.log('account not found:', reg.whatAccountId);
                  console.log('reg:', reg);
                  console.log('expenseAccounts:', expenseAccounts);
                  console.log('incomeAccounts:', incomeAccounts);
                } else {
                  desc = account.name;
                }
              }

              if (reg.description) {
                desc = desc ? `${desc} - ${reg.description}` : reg.description;
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
