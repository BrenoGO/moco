import React from 'react';
import { useSelector } from 'react-redux';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';

export default function Bill(props) {
  const { bill, handlePayClick, where } = props;
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { locale } = useSelector(state => state.DefaultsReducer);
  const whereAccount = accounts.filter(item => item.id === bill.whereAccount);

  return (
    <div className="eachBill">
      {OperMsgs[locale].whereAc}
      {' '}
      {whereAccount[0].name}
      {' '}
      <br />
      {OperMsgs[locale].dueDate}
      {helper.formatDate(locale, bill.dueDate)}
      {' '}
      {OperMsgs[locale].value}
      {helper.currencyFormatter(locale, bill.value)}
      <br />
      {OperMsgs[locale].emitDate}
      {helper.formatDate(locale, bill.emitDate)}
      {' '}
      {OperMsgs[locale].installment}
      {bill.installment}
      {where === 'list' && (
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span className="payBut actionBut" onClick={() => handlePayClick(bill)}>
            {bill.type === 'ToPay'
              ? OperMsgs[locale].payA
              : OperMsgs[locale].receiveA
            }
          </span>
        </>
      )}

    </div>
  );
}
