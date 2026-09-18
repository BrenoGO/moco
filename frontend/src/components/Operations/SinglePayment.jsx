import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Form } from 'antd';

import SelectAccount from '../Select';
import InputValue from '../InputValue';

import helper from '../../services/helper';
import { OperMsgs } from '../../services/Messages';

export default function SinglePayment({
  payment,
  whatAccountToSelect,
  index,
  payments,
  setPayments,
}) {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);
  const ToReceiveAccounts = helper.organizedAccounts(accounts, defaultAccounts.ToReceive);
  const ToPayAccounts = helper.organizedAccounts(accounts, defaultAccounts.ToPay);

  const todayPlus30 = dayjs()
    .add(30, 'days')
    .set('hour', 12)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();

  const whereAccountToSelect = useMemo(() => {
    switch (payment.type) {
      case 'AtSight':
        return currentAccounts;
      case 'ToPay':
        return ToPayAccounts;
      case 'ToReceive':
        return ToReceiveAccounts;
      default:
        break;
    }
  }, [payment.type, currentAccounts, ToPayAccounts, ToReceiveAccounts])

  function handleWhereTypeChange(type) {
    setPayments(
      payments.map((item, i) => {
        if (i !== index) return item;
        const newObj = {
          ...item,
          type,
          id: defaultAccounts.whereAccounts[type],
        };
        if (type === 'AtSight') newObj.bills = null;
        else newObj.bills = [{ date: todayPlus30, value: item.value }];

        return newObj;
      }),
    );
  }

  function handleWhereAccountsIdChange(id) {
    setPayments(
      payments.map((item, i) => {
        if (index !== i) return item;
        return { ...item, id };
      }),
    );
  }

  function editBillValue(billI, value) {
    setPayments(
      payments.map((payment, i1) => {
        if (index !== i1) return payment;
        return {
          ...payment,
          bills: payment.bills.map((bill, i2) => {
            if (billI !== i2) return bill;
            return { ...bill, value };
          }),
        };
      }),
    );
  }

  function editBillDate(billI, value) {
    setPayments(
      payments.map((payment, i1) => {
        if (index !== i1) return payment;
        return {
          ...payment,
          bills: payment.bills.map((bill, i2) => {
            if (billI !== i2) return bill;
            return { ...bill, date: new Date(value.setHours(12, 0, 0, 0)) };
          }),
        };
      }),
    );
  }

  function editOnBlur() {
    const sum = payments[index].bills.reduce((a, b, i) => {
      if (i === 1) {
        return a.value + b.value;
      }
      return a + b.value;
    });

    setPayments(
      payments.map((item, i) => {
        if (index !== i) return item;
        return { ...item, value: sum };
      }),
    );
  }

  function handleWhereValueChange(value, type) {
    if (type === 'ToPay' || type === 'ToReceive') {
      const newBills = distributeValue(value, payments[index].bills);
      setPayments(
        payments.map((item, i) => {
          if (i !== index) return item;
          return { ...item, value, bills: newBills };
        }),
      );
    } else {
      setPayments(
        payments.map((item, i) => {
          if (i !== index) return item;
          return { ...item, value };
        }),
      );
    }
  }

  function handleCloseWhereAccount(index) {
    setPayments([
      ...payments.slice(0, index),
      ...payments.slice(index + 1, payments.length),
    ]);
  }

  function distributeValue(value, tempBills) {
    const installments = tempBills.length;

    const instVal = Number((value / installments).toFixed(2));

    return tempBills.map((bill, index) => {
      if (index === 0) {
        if (value !== instVal * installments) {
          const dif = value - instVal * installments;
          const newValue = instVal + dif;
          return { ...bill, value: Number(newValue.toFixed(2)) };
        }
      }
      return { ...bill, value: instVal };
    });
  }

  function handleInstallmentsChange(installments) {
    let newBills = [];
    if (installments > payments[index].bills.length) {
      // aumentou parcela
      if (installments - payments[index].bills.length === 1) {
        const date = new Date(payments[index].bills[installments - 2].date);
        date.setDate(date.getDate() + 30);
        newBills = [...payments[index].bills, { date, value: 0 }];
      } else {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < installments; i++) {
          if (i === 0) {
            newBills.push({ date: todayPlus30, value: 0 });
          } else {
            const date = new Date(newBills[i - 1].date);
            date.setDate(date.getDate() + 30);
            newBills.push({ date, value: 0 });
          }
        }
      }
    } else if (installments > 1) newBills = payments[index].bills.slice(0, installments);
    else newBills = payments[index].bills.slice(0, 1);
    newBills = distributeValue(payments[index].value, newBills);
    setPayments(
      payments.map((item, i) => {
        if (i !== index) return item;
        return { ...item, bills: newBills };
      }),
    );
  }

  return (
    <Card
      extra={
        <button type="button" className="smallBut" onClick={() => handleCloseWhereAccount(index)}>
          X
        </button>
      }
      style={{ marginTop: '3px' }}
      title={
        <select
          value={payment.type}
          onChange={(e) => handleWhereTypeChange(e.target.value)}
        >
          <option value="AtSight">{OperMsgs[locale].optAtSight}</option>
          <option value={whatAccountToSelect.name === 'expense' ? 'ToPay' : 'ToReceive'}>
            {whatAccountToSelect.name === 'expense'
              ? OperMsgs[locale].optToPay
              : OperMsgs[locale].optToRec}
          </option>
        </select>
      }
    >
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item label={OperMsgs[locale].whereAc} >
              <SelectAccount
                value={payment.id}
                onChange={(id) => handleWhereAccountsIdChange(id)}
                options={whereAccountToSelect.map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: account.name,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <InputValue
              label={OperMsgs[locale].value}
              value={payment.value}
              onChange={(v) => handleWhereValueChange(v, payment.type)}
            />
          </Col>
        </Row>

        {payment.bills && (
          <div className="whereBillsDiv">
            <div className="divPaymentInstallments">
              <label htmlFor="paymentInstallments">
                {OperMsgs[locale].installments}
                <select
                  id="paymentInstallments"
                  value={payment.bills.length}
                  onChange={(e) => handleInstallmentsChange(e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="installmentsDiv">
              {payment.bills.map((bill, billI) => (
                <div key={billI} className="installment">
                  <div className="installmentDate">
                    <label htmlFor={`installmentDate${billI}`}>
                      {OperMsgs[locale].date}{' '}
                    </label>
                    <input
                      id={`installmentDate${billI}`}
                      type="date"
                      value={helper.dateToInput(bill.date)}
                      onChange={(e) => editBillDate(billI, helper.inputDateToNewDate(e.target.value))}
                    />
                  </div>
                  <div className="installmentValue">
                    <InputValue
                      label={OperMsgs[locale].value}
                      value={bill.value}
                      onChange={(value) => editBillValue(billI, value)}
                      onBlur={() => editOnBlur()}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </Card>
  );
}
