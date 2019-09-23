import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

import Select from '../Select';

import { RegistersService } from '../../services/RegistersService';
import internacionalization from '../../services/Internacionalization';

export default function AcStatements({ curAccounts }) {
  const [acId, setAcId] = useState(10);
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);
  const [initDate, setInitDate] = useState(new Date(initialDate));
  const [finalDate, setFinalDate] = useState(new Date());
  const [registers, setRegisters] = useState([]);

  const accounts = useSelector(state => state.AccountsReducer.accounts);

  useEffect(() => {
    RegistersService.search({
      whereAccountId: acId,
      emitDate: {
        $gt: initDate,
        $lt: finalDate
      }
    }).then((regs) => {
      setRegisters(regs);
    });
  }, [acId, initDate, finalDate]);

  function handleDateChange(when, date) {
    switch (when) {
      case 'init':
        setInitDate(date);
        break;
      case 'final':
        setFinalDate(date);
        break;
      default:
    }
  }
  return (
    <div>
      <div><h3>Current Accounts Statements</h3></div>
      <div id="form">
        <Select
          value={acId}
          onChange={setAcId}
          options={curAccounts.map(account => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name
          }))}
        />
        <div>
          Initial:
          {' '}
          <DatePicker selected={initDate} onChange={d => handleDateChange('init', d)} />
        </div>
        <div>
          Final:
          {' '}
          <DatePicker selected={finalDate} onChange={d => handleDateChange('final', d)} />
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
              <td>Balance</td>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => {
              const whatAc = accounts.filter(item => item.id === reg.whatAccountId)[0];
              const emitDate = internacionalization.formatDateAndTime(new Date(reg.emitDate));
              return (
                <tr key={reg._id} className="register">
                  <td>{reg.opType}</td>
                  <td>{emitDate}</td>
                  <td>{whatAc ? whatAc.name : ''}</td>
                  <td>{internacionalization.currencyFormatter(reg.value)}</td>
                  <td>{internacionalization.currencyFormatter(reg.whereAccountBalance)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
