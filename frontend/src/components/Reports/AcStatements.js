import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Select from '../Select';

import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';
import internacionalization from '../../services/Internacionalization';

export default function AcStatements() {
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts } = useSelector(state => state.DefaultsReducer);
  const curAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);

  const [acId, setAcId] = useState(defaultAccounts.whereAccounts.AtSight);
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);
  const [initDate, setInitDate] = useState(new Date(initialDate));
  const [finalDate, setFinalDate] = useState(new Date());
  const [registers, setRegisters] = useState([]);

  useEffect(() => {
    let mounted = true;
    RegistersService.search({
      whereAccountId: acId,
      emitDate: {
        $gt: initDate,
        $lt: finalDate
      }
    }).then((regs) => {
      if (mounted) setRegisters(regs);
    });
    return () => { mounted = false; };
  }, [acId, initDate, finalDate]);

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
        <table className="table">
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
