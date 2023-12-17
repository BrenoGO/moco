import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Form, DatePicker, Select, Row, Col, Input, message,
} from 'antd';
import dayjs from 'dayjs';
import InputValue from '../InputValue';

import './operations.css';

import SelectAccount from '../Select';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { OperationsService } from '../../services/OperationsService';

import Spinner from '../Spinner';
import PaymentInstallments from './PaymentInstallments';

const INIT_TYPE = 'expense';

export default function FutureOper() {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector((state) => (state.DefaultsReducer));

  const initialValue = 0;
  const today = new Date();
  const todayPlus30 = new Date();
  todayPlus30.setDate(todayPlus30.getDate() + 30);

  const [bills, setBills] = useState([
    {
      date: todayPlus30,
      value: initialValue,
    },
  ]);

  const [opValue, setOpValue] = useState(initialValue);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaultAccounts.whatAccounts?.expense);
  const [whereAccountId, setWhereAccountId] = useState(defaultAccounts.whereAccounts?.ToPay);
  const [whatAccounts, setWhatAccounts] = useState({ id: defaultAccounts.expense, name: 'expense' });
  const [whereAccounts, setWhereAccounts] = useState({ id: defaultAccounts.ToPay, name: 'ToPay' });
  const [emitDate, setEmitDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [whatAccountsToSelect, setWhatAccountsToSelect] = useState([]);
  const [whereAccountsToSelect, setWhereAccountsToSelect] = useState([]);

  useEffect(() => {
    if (defaultAccounts?.whatAccounts) {
      setWhatAccounts({ id: defaultAccounts.expense, name: 'expense' });
      setWhereAccounts({ id: defaultAccounts.ToPay, name: 'ToPay' });
      setWhatAccountId(defaultAccounts.whatAccounts.expense);
      setWhereAccountId(defaultAccounts.whereAccounts.ToPay);
    }
  }, [defaultAccounts]);

  useEffect(() => {
    if (whatAccounts?.id) {
      setWhatAccountsToSelect(helper.organizedAccounts(accounts, whatAccounts.id));
    }
  }, [whatAccounts, accounts]);

  useEffect(() => {
    if (whereAccounts?.id) {
      setWhereAccountsToSelect(helper.organizedAccounts(accounts, whereAccounts.id));
    }
  }, [whereAccounts, accounts]);

  function setAccounts(type) {
    if (type === 'expense') {
      setWhatAccounts({ id: defaultAccounts[type], name: type });
      setWhatAccountId(defaultAccounts.whatAccounts[type]);
      setWhereAccounts({ id: defaultAccounts.ToPay, name: 'ToPay' });
      setWhereAccountId(defaultAccounts.whereAccounts.ToPay);
    } else {
      setWhatAccounts({ id: defaultAccounts.income, name: 'income' });
      setWhatAccountId(defaultAccounts.whatAccounts.income);
      setWhereAccounts({ id: defaultAccounts.ToReceive, name: 'ToReceive' });
      setWhereAccountId(defaultAccounts.whereAccounts.ToReceive);
    }
  }

  function distributeValue(value, tempBills) {
    const installments = tempBills.length;
    const instVal = Number((value / installments).toFixed(2));
    return (tempBills.map((bill, index) => {
      if (index === 0) {
        if (value !== instVal * installments) {
          const dif = value - instVal * installments;
          const newValue = instVal + dif;
          return { ...bill, value: newValue };
        }
      }
      return { ...bill, value: instVal };
    }));
  }

  function reSetState() {
    setBills([
      {
        date: todayPlus30,
        value: initialValue,
      },
    ]);
    setOpValue(initialValue);
    setOpDesc('');
    setOpNotes('');
    setWhatAccountId(defaultAccounts.whatAccounts[INIT_TYPE]);
    setWhereAccountId(defaultAccounts.whereAccounts?.ToPay);
    setWhatAccounts({ id: 2, name: 'expense' });
  }

  function handleValueChange(value) {
    setOpValue(value);
    const newBills = distributeValue(value, bills);
    setBills(newBills);
  }

  function handleInstallmentsChange(installments) {
    let newBills = [];
    if (installments > bills.length) { // added installment
      if (installments - bills.length === 1) {
        const date = new Date(bills[installments - 2].date);
        date.setDate(date.getDate() + 30);
        newBills = [...bills, { date, value: initialValue }];
      } else {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < installments; i++) {
          if (i === 0) {
            newBills.push({ date: todayPlus30, value: initialValue });
          } else {
            const date = new Date(newBills[i - 1].date);
            date.setDate(date.getDate() + 30);
            newBills.push({ date, value: initialValue });
          }
        }
      }
    } else if (installments > 1) newBills = bills.slice(0, installments);
    else newBills = bills.slice(0, 1);
    newBills = distributeValue(opValue, newBills);
    setBills(newBills);
  }

  async function submit() {
    setLoading(true);

    try {
      let value = helper.toNumber(opValue);
      if (value === 0) return alert('value is 0!');

      let type = 'ToReceive';
      if (whatAccounts.name === 'expense') {
        type = 'ToPay';
        value = -value;
      }
      const billsModel = bills.map((bill, index) => ({
        type,
        value: bill.value,
        dueDate: bill.date,
        emitDate,
        installment: `${index + 1}/${bills.length}`,
        whereAccount: whereAccountId,
      }));

      const reg = {
        opType: `${whatAccounts.name}${whereAccounts.name}`,
        description: opDesc,
        emitDate,
        whereAccountId,
        whatAccountId,
        value,
      };

      const resp = await OperationsService.storeFutureOperation({
        registers: [reg],
        bills: billsModel,
        emitDate,
        description: opDesc,
        notes: opNotes,
      });
      console.log('resp:', resp);

      reSetState();
    } catch (err) {
      console.log('error trying to submit');
      console.log(err);
      message.error(`Error! ${err.message || 'Error desconhecido! Abra o console tira um print e mande para suporte'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      layout="vertical"
      form={form}
    >
      {loading && <Spinner />}
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].expOrInc}
            name="expenseOrIncome"
            initialValue={whatAccounts.name}
          >
            <Select
              value={whatAccounts.name}
              onChange={setAccounts}
            >
              <Select.Option value="expense">{OperMsgs[locale].expense}</Select.Option>
              <Select.Option value="income">{OperMsgs[locale].income}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].emitDate}
            name="emitDate"
            initialValue={dayjs().startOf('day')}
            rules={[{ required: true, message: 'Data de emissão é obrigatório!' }]}
          >
            <DatePicker
              onChange={setEmitDate}
              value={emitDate}
              format="DD/MM/YYYY"
              showNow
              changeOnBlur
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].paymentOptions}
          >
            <SelectAccount
              id="whereAccountsSelector"
              value={whereAccountId}
              onChange={setWhereAccountId}
              options={whereAccountsToSelect.map((account) => ({
                value: account.id,
                disabled: !account.allowValue,
                label: account.name,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].whatAc}
          >
            <SelectAccount
              id="whatAccountSelector"
              value={whatAccountId}
              onChange={setWhatAccountId}
              options={whatAccountsToSelect.map((account) => ({
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
            value={opValue}
            onChange={handleValueChange}
          />
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].desc}
          >
            <Input
              value={opDesc}
              onChange={(e) => setOpDesc(e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].notes}
          >
            <Input
              value={opNotes}
              onChange={(e) => setOpNotes(e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].installments}
            initialValue={bills.length}
          >
            <Select
              value={bills.length}
              onChange={handleInstallmentsChange}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({
                value: n,
                label: n,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <PaymentInstallments bills={bills} setBills={setBills} setOpValue={setOpValue} />
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </Form>
  );
}
