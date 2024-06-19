import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';

import './Bill.css';

export default function Bill(props) {
  const { bill, handlePayClick, where } = props;

  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { locale } = useSelector((state) => state.DefaultsReducer);

  const whereAccount = bill.group
    ? accounts.filter((item) => item.id === bill.bills[0].whereAccount)
    : accounts.filter((item) => item.id === bill.whereAccount);

  const [detailed, setDetailed] = useState(
    where === 'payBill'
      ? true
      : false
  );

  if (bill.group) {
    let sumValue = 0;
    bill.bills.forEach((item) => {
      sumValue += item.value;
    });
    bill.value = sumValue;
    bill.dueDate = bill.bills[0].dueDate;
  }

  const renderBillRegisters = () => {
    if (!bill.operation?.registers?.[0]) {
      return null;
    }
    if (bill.operation.registers?.length === 1) {
      return bill.operation.registers[0].description
    }

    return (
      <div>
        {bill.operation.registers.map((register) => {
          if (!register) {
            console.log('bill with operation with falsy register');
            console.log(bill)
            return null;
          }
          return (
          <div>
              {register.description}:{' '}{helper.currencyFormatter(locale, register.value)}
          </div>
        )})}
      </div>
    )
  }

  if (detailed) {
    return (
      bill.bills
        .sort((a, b) => new Date(a.emitDate) - new Date(b.emitDate))
        .map((item) => (
          <Bill bill={item} key={item._id} handlePayClick={handlePayClick} where="list" />
        ))
    );
  }

  return (
    <div className="eachBill">
      {OperMsgs[locale].whereAc}
      {' '}
      {whereAccount[0].name}
      {' '}
      <br />
      {OperMsgs[locale].dueDate}
      {helper.formatDate(locale, helper.dbDateToNewDate(bill.dueDate))}
      {' '}
      {OperMsgs[locale].value}
      {helper.currencyFormatter(locale, bill.value)}
      <br />
      {!bill.group
        ? (
          <div>
            {OperMsgs[locale].emitDate}
            {helper.formatDate(locale, helper.dbDateToNewDate(bill.emitDate))}
            {' '}
            {OperMsgs[locale].installments}
            {bill.installment}
            <br />
            {renderBillRegisters()}
          </div>
        )
        : (
          <div>
            <span className="payBut actionBut" onClick={() => setDetailed(true)}>
              {OperMsgs[locale].detailBills}
            </span>
          </div>
        )}

      {where === 'list' && (
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span className="payBut actionBut" onClick={() => handlePayClick(bill)}>
            {bill.type === 'ToPay'
              ? OperMsgs[locale].payA
              : OperMsgs[locale].receiveA}
          </span>
        </>
      )}

    </div>
  );
}
