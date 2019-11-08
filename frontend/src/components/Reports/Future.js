import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';

import './IncomesExpenses.css';

export default function Future() {
  const initialType = 'ToPay';
  let total = 0;

  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector(state => state.DefaultsReducer);

  const Accs = {
    ToPay: helper.organizedAccounts(accounts, defaultAccounts.ToPay),
    ToReceive: helper.organizedAccounts(accounts, defaultAccounts.ToReceive)
  };

  const [type, setType] = useState(initialType);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    let mounted = true;
    BillsService.getTyped(type).then((resp) => {
      if (mounted)setBills(resp);
    });
    return () => { mounted = false; };
  }, [type]);

  return (
    <div>
      <div>
        <select id="typeSelect" value={type} onChange={(e) => { setBills([]); setType(e.target.value); }}>
          <option value="ToPay">{RepMsgs[locale].toPay}</option>
          <option value="ToReceive">{RepMsgs[locale].toReceive}</option>
        </select>
      </div>
      <div id="report" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <td>{RepMsgs[locale].date}</td>
              <td>{RepMsgs[locale].where}</td>
              <td>{RepMsgs[locale].due}</td>
              <td>{RepMsgs[locale].value}</td>
              <td>{RepMsgs[locale].total}</td>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              const emitDate = helper.formatDate(locale, new Date(bill.emitDate));
              const dueDate = helper.formatDate(locale, new Date(bill.dueDate));
              const { value } = bill;
              total += value;
              const { name } = Accs[type].find(item => item.id === bill.whereAccount);
              return (
                <tr key={bill._id} className="register">
                  <td>{emitDate}</td>
                  <td>{name}</td>
                  <td>{dueDate}</td>
                  <td className={value < 0 ? 'red' : ''}>
                    {helper.currencyFormatter(locale, value)}
                  </td>
                  <td className={total < 0 ? 'red' : ''}>
                    {helper.currencyFormatter(locale, total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
