import React from 'react';
import { useSelector } from 'react-redux';

import helper from '../../services/helper';
import internacionalization from '../../services/Internacionalization';

export default function Bill(props) {
  const { bill, handlePayClick, where } = props;
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const whereAccount = accounts.filter(item => item.id === bill.whereAccount);

  return (
    <div className="eachBill">
      Payment Option:
      {' '}
      {whereAccount[0].name}
      {' '}
      <br />
          Due Date:
      {internacionalization.formatDate(helper.dbDateToNewDate(bill.dueDate))}
      {' '}
          Value:
      {' '}
      {internacionalization.currencyFormatter(bill.value)}
      <br />
          Emit Date:
      {' '}
      {internacionalization.formatDate(helper.dbDateToNewDate(bill.emitDate))}
      {' '}
          Installment:
      {' '}
      {bill.installment}
      {where === 'list' && (
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span className="payBut actionBut" onClick={() => handlePayClick(bill)}>
            {bill.type === 'ToPay' ? 'Pay!' : 'Receive!'}
          </span>
        </>
      )}

    </div>
  );
}
