import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form, DatePicker, Select, message, Row, Col, Input,
} from 'antd';
import moment from 'moment';

import './operations.css';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

import { resetBalance } from '../../actions/DefaultsActions';

import SelectAccount from '../Select';
import Spinner from '../Spinner';
import InputValue from '../InputValue';

export default function AtSight() {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, balances, locale } = useSelector((state) => (state.DefaultsReducer));
  const dispatch = useDispatch();

  const [opValue, setOpValue] = useState(0);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaultAccounts.whatAccounts?.expense);
  const [whereAccountId, setWhereAccountId] = useState(
    defaultAccounts.whereAccounts?.AtSight,
  );
  const [whatAccounts, setWhatAccounts] = useState({ id: defaultAccounts.expense, name: 'expense' });
  const [emitDate, setEmitDate] = useState(moment());
  const [loading, setLoading] = useState(false);

  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);
  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccounts.id);

  function handleWhatAccountsChange(type) {
    setWhatAccounts({ id: defaultAccounts[type], name: type });
    setWhatAccountId(defaultAccounts.whatAccounts[type]);
  }

  useEffect(() => {
    if (defaultAccounts?.whatAccounts && whatAccounts?.name) {
      handleWhatAccountsChange(whatAccounts.name);
      setWhereAccountId(defaultAccounts.whereAccounts?.AtSight);
    }
  }, [defaultAccounts]);

  function reSetState() {
    setOpValue(0);
    setOpDesc('');
    setOpNotes('');
    setWhatAccountId(defaultAccounts.whatAccounts.expense);
    setWhereAccountId(defaultAccounts.whereAccounts.AtSight);
    setWhatAccounts({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(moment());
  }

  function submit() {
    setLoading(true);
    let value = opValue;

    if (value === 0) {
      message.error('Valor é 0!');
      return setLoading(false);
    }
    if (whatAccounts.name === 'expense') value = -value;

    const lastWhereBalance = balances.filter(
      (item) => item.accountId === whereAccountId,
    )[0].balance;

    const whereAccountBalance = Number((lastWhereBalance + value).toFixed(2));

    dispatch(resetBalance({ accountId: whereAccountId, balance: whereAccountBalance }));
    const Obj = {
      opType: `${whatAccounts.name}AtSight`,
      whereAccountId,
      whatAccountId,
      whereAccountBalance,
      value,
      emitDate,
    };
    reSetState();

    if (opDesc) Obj.description = opDesc;
    if (opNotes) Obj.notes = opNotes;
    setLoading(false);
    return RegistersService.store(Obj);
  }

  return (
    <Form
      layout="vertical"
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
              onChange={handleWhatAccountsChange}
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
            initialValue={moment()}
            rules={[{ required: true, message: 'Data de emissão é obrigatório!' }]}
          >
            <DatePicker
              onChange={setEmitDate}
              value={emitDate}
              format="DD/MM/YYYY HH:mm:ss"
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label={OperMsgs[locale].currAc}
          >
            <SelectAccount
              id="whereAccountsSelector"
              value={whereAccountId}
              onChange={setWhereAccountId}
              options={currentAccounts.map((account) => ({
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
            onChange={setOpValue}
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
      </Row>
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </Form>
  );
}
