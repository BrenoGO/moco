import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import editBut from '../../imgs/editBut.png';

import './Bill.css';
import ModalEditBill from './ModalEditBill';

export default function Bill(props) {
  const { bill, handlePayClick, where } = props;

  Bill.propTypes = {
    bill: PropTypes.shape({}).isRequired,
    handlePayClick: PropTypes.func,
    where: PropTypes.string.isRequired,
  };

  Bill.defaultValues = {
    handlePayClick: () => {},
    setBills: () => {},
    billIndex: 0,
  }

  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { locale } = useSelector((state) => state.DefaultsReducer);

  const whereAccount = bill.group
    ? accounts.filter((item) => item.id === bill.bills[0].whereAccount)
    : accounts.filter((item) => item.id === bill.whereAccount);

  const [isPayingBill, setIsPayingBill] = useState(
    where === 'payBill'
      ? true
      : false
  );

  const [editModalVisible, setEditModalVisible] = useState(false);

  if (bill.group) {
    let sumValue = 0;
    bill.bills.forEach((item) => {
      sumValue += item.value;
    });
    bill.value = sumValue;
    bill.dueDate = bill.bills[0].dueDate;
  }

  const renderBillRegisters = () => {
    // console.log(bill);
    if (!bill.operation?.registers?.[0]) {
      return null;
    }
    if (bill.operation.registers?.length === 1) {
      return bill.operation.registers[0].description
    }

    return (
      <div>
        {
          bill.operation.registers.map((register) => {
            if (!register) {
              console.log('bill with operation with falsy register');
              console.log(bill)
              return null;
            }
            const whatAccount = accounts.find((acc) => acc.id === register.whatAccountId);
            const whereAccount = accounts.find((acc) => acc.id === register.whereAccountId);
            // console.log('whatAccount:', whatAccount);
            // console.log('whereAccount:', whereAccount);

            if (register.whatAccountId && !register.whereAccountId) {
              let description = `${whatAccount?.name} - ${register.description || bill.operation.description || ''}`;
              return (
                <div key={`bill-register-${register._id}`}>
                  {description}:{' '}{helper.currencyFormatter(locale, register.value)}
                </div>
              )
            }
            if (register.whereAccountId && !register.whatAccountId) {
              return (
                <div key={`bill-register-${register._id}`}>
                  Pago a vista:{' '}{helper.currencyFormatter(locale, register.value)}{' em '}{whereAccount.name}
                </div>
              )
            }
            return (
              <div key={`bill-register-${register._id}`}>
                {whereAccount.name}:{' '}{whatAccount.name}{' - '}{helper.currencyFormatter(locale, register.value)}
              </div>
            )
          })
        }
      </div>
    )
  }

  if (isPayingBill && bill.bills) {
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
      {
        !bill.group && !isPayingBill && (
        <img
          onClick={() => setEditModalVisible(!editModalVisible)}
          style={{ marginLeft: '20px' }}
          src={editBut}
          width="16px"
          alt="editBut"
        />
      )}
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
            <span className="payBut actionBut" onClick={() => setIsPayingBill(true)}>
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
      <ModalEditBill
        editModalVisible={editModalVisible}
        setEditModalVisible={setEditModalVisible}
        bill={bill}
      />
    </div>
  );
}
