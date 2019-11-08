import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Select from '../Select';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

export default function AcStatements() {
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts, locale, balances } = useSelector(state => state.DefaultsReducer);
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

  function getBalance(accountId) {
    const { balance } = balances.find(item => item.accountId === accountId);
    return helper.currencyFormatter(locale, balance);
  }

  return (
    <div>
      <div><h3>{RepMsgs[locale].statemTitle}</h3></div>
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
      <div id="finalBalance">
        <h3>
          Balance:
          {' '}
          {getBalance(acId)}
        </h3>
      </div>
      <div id="report" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <td>{RepMsgs[locale].date}</td>
              <td>{RepMsgs[locale].thAcc}</td>
              <td>{RepMsgs[locale].value}</td>
              <td>{RepMsgs[locale].balance}</td>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => {
              console.log(reg);
              const whatAc = accounts.filter(item => item.id === reg.whatAccountId)[0];
              let desc = reg.description || whatAc ? whatAc.name : '';
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
              const emitDate = helper.formatDateAndTime(locale, new Date(reg.emitDate));
              let { value } = reg;
              const { opType, whereAccountBalance: balance } = reg;
              if (opType.match(/expense/)) {
                value *= -1;
              }
              return (
                <tr key={reg._id} className="register">
                  <td>{emitDate}</td>
                  <td>{desc}</td>
                  <td className={value < 0 ? 'red' : ''}>{helper.currencyFormatter(locale, value)}</td>
                  <td className={balance < 0 ? 'red' : ''}>{helper.currencyFormatter(locale, balance || 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
