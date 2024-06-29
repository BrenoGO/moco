/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import {
  Form, DatePicker, Row, Col, Select, Input, message
} from 'antd';

import './operations.css';

import { OperMsgs } from '../../services/Messages';
import { OperationsService } from '../../services/OperationsService';

import Spinner from '../Spinner';
import MultipleWhatAcc from './MultipleWhatAccs';
import MultiplePayments from './MultiplePayments';

export default function Complex() {
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');

  const [whatAccounts, setWhatAccounts] = useState([
    {
      id: defaultAccounts?.whatAccounts?.expense || 'temp',
      value: 0,
      description: '',
      notes: '',
    },
  ]);
  const [whereAccounts, setWhereAccounts] = useState([
    {
      id: defaultAccounts?.whereAccounts?.AtSight || 'temp',
      value: 0,
      type: 'AtSight',
    },
  ]);
  const [whatAccountToSelect, setWhatAccountToSelect] = useState({
    id: defaultAccounts?.expense,
    name: 'expense',
  });

  const [form] = Form.useForm();

  useEffect(() => {
    if (defaultAccounts?.whatAccounts) {
      setWhatAccounts([
        {
          id: defaultAccounts.whatAccounts.expense,
          value: 0,
          description: '',
          notes: '',
        },
      ]);
      setWhereAccounts([
        {
          id: defaultAccounts.whereAccounts.AtSight,
          value: 0,
          type: 'AtSight',
        },
      ]);
      setWhatAccountToSelect({
        id: defaultAccounts.expense,
        name: 'expense',
      });
    }
  }, [defaultAccounts]);

  const [emitDate, setEmitDate] = useState(dayjs().startOf('day'));
  const [loading, setLoading] = useState(false);

  const sumWhatAccounts = useMemo(
    () => whatAccounts.reduce((ac, current) => ac + current.value, 0),
    [whatAccounts]
  );
  const sumWhereAccounts = useMemo(
    () => whereAccounts.reduce((ac, current) => ac + current.value, 0),
    [whereAccounts]
  );

  function setAccounts(type) {
    if (type === 'expense') {
      setWhatAccountToSelect({ id: defaultAccounts[type], name: 'expense' });
      setWhereAccounts(
        whereAccounts.map((item) => {
          if (item.type === 'ToPay' || item.type === 'AtSight') return item;
          return { ...item, type: 'ToPay' };
        }),
      );
    } else {
      setWhatAccountToSelect({ id: defaultAccounts[type], name: 'income' });
      setWhereAccounts(
        whereAccounts.map((item) => {
          if (item.type === 'ToReceive' || item.type === 'AtSight') return item;
          return { ...item, type: 'ToReceive' };
        }),
      );
    }
  }

  function runExtraValueChangedActions(_index, _value, sum) {
    setWhereAccounts([
      {
        ...whereAccounts[0],
        value: sum,
      },
    ]);
  }

  function reSetState() {
    setWhatAccounts([
      {
        id: defaultAccounts.whatAccounts.expense,
        value: 0,
        description: '',
        notes: '',
      },
    ]);
    setWhereAccounts([
      {
        id: defaultAccounts.whereAccounts.AtSight,
        value: 0,
        type: 'AtSight',
      },
    ]);
    setWhatAccountToSelect({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(new Date());
    setOpDesc('');
    setOpNotes('');
  }

  async function submit() {
    if (sumWhatAccounts === 0) return alert('value is 0!');
    if (sumWhatAccounts.toFixed(2) !== sumWhereAccounts.toFixed(2)) {
      return alert('A soma de gastos/receitas deve ser igual a soma de pagamentos');
    }

    setLoading(true);
    const opType = whatAccountToSelect.name;
    const payments = whereAccounts;

    try {
      await OperationsService.storeComplexOperation({
        emitDate,
        opType,
        opDesc,
        opNotes,
        whatAccounts,
        payments,
      });

      reSetState();
    } catch (err) {
      console.log('error trying to submit complex operation');
      console.log(err);
      message.error(`Erro! ${err.message || 'Ocorreu um error desconhecido! Tente novamente. Se persistir entre em contato com suporte'}`);
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
            initialValue={whatAccountToSelect.name}
          >
            <Select
              value={whatAccountToSelect.name}
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
      </Row>
      <MultipleWhatAcc
        setWhatAccounts={setWhatAccounts}
        whatAccounts={whatAccounts}
        runExtraValueChangedActions={runExtraValueChangedActions}
        whatAccountToSelect={whatAccountToSelect}
      />
      <MultiplePayments
        setWhereAccounts={setWhereAccounts}
        whatAccounts={whatAccounts}
        whatAccountToSelect={whatAccountToSelect}
        whereAccounts={whereAccounts}
      />
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </Form>
  );
}
