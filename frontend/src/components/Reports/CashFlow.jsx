import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import Spinner from '../Spinner';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { ReportsService } from '../../services/ReportsService';

export default function CashFlow() {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);

  const { locale } = useSelector((state) => state.DefaultsReducer);

  const [initDate, setInitDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let mounted = true;
    ReportsService.cashFlow({
      initDate,
      endDate,
    }).then((regs) => {
      setLoading(false);
      if (mounted) setData(regs);
    }).catch((err) => {
      console.error('error getting report data', err);
      message.error('Erro buscando dados do relatório, tente novmente. Persistindo contate suporte');
    });
    return () => { mounted = false; };
  }, [initDate, endDate]);


  function handleDateChange(when, date) {
    switch (when) {
      case 'init':
        setInitDate(helper.inputDateToNewDate(date));
        break;
      case 'final':
        setEndDate(helper.inputDateToNewDate(date));
        break;
      default:
        break;
    }
  }

  let totalInitialBalance = 0;
  let totalIncomeAtSight = 0;
  let totalExpensesAtSight = 0;
  let totalPayments = 0;
  let totalTransferences = 0;
  let totalFinalBalance = 0;
  return (
    <div>
      {loading && <Spinner />}
      <div id="form">
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
            value={helper.dateToInput(endDate)}
            onChange={(e) => handleDateChange('final', e.target.value)}
          />
        </div>
      </div>
      <div id="report" className="table-responsive">
        <table className="table bigger-responsive-table">
          <thead>
            <tr>
              <td>{RepMsgs[locale].thAcc}</td>
              <td>{RepMsgs[locale].initialBalance}</td>
              <td>{RepMsgs[locale].incomeAtSight}</td>
              <td>{RepMsgs[locale].expensesAtSight}</td>
              <td>{RepMsgs[locale].payments}</td>
              <td>{RepMsgs[locale].transferences}</td>
              <td>{RepMsgs[locale].finalBalance}</td>
            </tr>
          </thead>
          <tbody>
            {data.map((accountData, i) => {
              totalInitialBalance += accountData.initialBalance;
              totalIncomeAtSight += accountData.incomeAtSight;
              totalExpensesAtSight += accountData.expenseAtSight;
              totalPayments += accountData.payment;
              totalTransferences += accountData.transference;
              totalFinalBalance += accountData.finalBalance;
              return (
                <tr key={accountData.id} className="register cash-flow-row">
                  <td>{accountData.accountName}</td>
                  <td className={`text-nowrap ${accountData.initialBalance < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, accountData.initialBalance)}</td>
                  <td className={`text-nowrap ${accountData.incomeAtSight < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, accountData.incomeAtSight)}</td>
                  <td className={`text-nowrap ${accountData.expenseAtSight < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, accountData.expenseAtSight)}</td>
                  <td className={`text-nowrap ${accountData.payment < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, accountData.payment)}</td>
                  <td className={`text-nowrap ${accountData.transference < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, accountData.transference)}</td>
                  <td className={`text-nowrap ${accountData.finalBalance < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, accountData.finalBalance)}</td>
                </tr>
              );
            })}
            <tr className="cash-flow-row cash-flow-row-total">
                <td>{RepMsgs[locale].total}</td>
                <td className={`text-nowrap ${totalInitialBalance < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, totalInitialBalance)}</td>
                <td className={`text-nowrap ${totalIncomeAtSight < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, totalIncomeAtSight)}</td>
                <td className={`text-nowrap ${totalExpensesAtSight < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, totalExpensesAtSight)}</td>
                <td className={`text-nowrap ${totalPayments < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, totalPayments)}</td>
                <td className={`text-nowrap ${totalTransferences < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, totalTransferences)}</td>
                <td className={`text-nowrap ${totalFinalBalance < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, totalFinalBalance)}</td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
