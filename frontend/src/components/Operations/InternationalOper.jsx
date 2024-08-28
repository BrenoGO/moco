import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form, DatePicker, message, Row, Col,
} from 'antd';
import dayjs from 'dayjs';

import './operations.css';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';

import { resetBalance } from '../../actions/DefaultsActions';

import SelectAccount from '../Select';
import Spinner from '../Spinner';
import InputValue from '../InputValue';
import MultipleWhatAcc from './MultipleWhatAccs';
import { OperationsService } from '../../services/OperationsService';

const INIT_TYPE = 'expense';

export default function InternationalOper() {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, balances, locale } = useSelector((state) => (state.DefaultsReducer));
  const dispatch = useDispatch();

  const [dollarValue, setDollarValue] = useState(0);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaultAccounts.whatAccounts?.expense);
  const [incomeAccountIdForLocal, setIncomeAccountIdForLocal] = useState(defaultAccounts.whatAccounts?.income);
  const [whatAccountIdForInter, setWhatAccountIdForInter] = useState(defaultAccounts.whatAccounts?.expense);
  const [internAccountId, setInternAccountId] = useState(
    defaultAccounts.whereAccounts?.AtSight,
  );
  const [localAccountId, setLocalAccountId] = useState(
    defaultAccounts.whereAccounts?.AtSight,
  );
  const [whatAccounts, setWhatAccounts] = useState([
    {
      id: defaultAccounts?.whatAccounts?.expense || 'temp',
      value: 0,
      description: '',
      notes: '',
    },
  ]);

  const sumWhatAccounts = whatAccounts.reduce((ac, current) => ac + current.value, 0);
  const [emitDate, setEmitDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);
  const whatAccountToSelect = {
    id: defaultAccounts.expense, name: 'expense',
  };
  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccountToSelect.id);

  const incomeAccountsToSelect = helper.organizedAccounts(accounts, defaultAccounts.income);

  const [form] = Form.useForm();

  useEffect(() => {
    if (defaultAccounts?.whatAccounts) {
      setWhatAccountId(defaultAccounts.whatAccounts.expense);
      setWhatAccountIdForInter(defaultAccounts.whatAccounts.expense);
      setIncomeAccountIdForLocal(defaultAccounts.whatAccounts.income);
      setLocalAccountId(defaultAccounts.whereAccounts?.AtSight);
      setInternAccountId(defaultAccounts.whereAccounts?.AtSight);
      setWhatAccounts([
        {
          id: defaultAccounts.whatAccounts.expense,
          value: 0,
          description: '',
          notes: '',
        },
      ]);
    }
  }, [defaultAccounts]);

  function reSetState() {
    setOpDesc('');
    setOpNotes('');
    setWhatAccountId(defaultAccounts.whatAccounts.expense);
    setIncomeAccountIdForLocal(defaultAccounts.whatAccounts.income);
    setLocalAccountId(defaultAccounts.whereAccounts.AtSight);
    setDollarValue(0);
    setWhatAccounts([{
      id: defaultAccounts?.whatAccounts?.expense || 'temp',
      value: 0,
      description: '',
      notes: '',
    }]);
    form.setFieldsValue({ expenseOrIncome: INIT_TYPE });
  }

  async function submit() {
    setLoading(true);

    try {
      const totalValue = -sumWhatAccounts;
      const opDollarValue = -dollarValue;

      if (totalValue === 0) {
        message.error('Valor é 0!');
        return setLoading(false);
      }

      if (opDollarValue === 0) {
        message.error('Valor em dolar é 0!');
        return setLoading(false);
      }
      if (internAccountId === localAccountId) {
        message.error('Conta internacional não pode ser a mesma que a nacional!');
        return setLoading(false);
      }
      if (whatAccountIdForInter === whatAccounts[0].id) {
        message.error('Conta de gasto internacional não pode ser a mesma que a nacional!');
        return setLoading(false);
      }

      const lastInterBalance = balances.filter(
        (item) => item.accountId === internAccountId,
      )[0].balance;
      const interAccountBalance = lastInterBalance + opDollarValue;
      dispatch(resetBalance({ accountId: internAccountId, balance: interAccountBalance }));

      const Obj = {
        localAccountId,
        whatAccountIdForInter,
        whatAccountId,
        internAccountId,
        interAccountBalance,
        whatAccounts,
        totalValue,
        dollarValue: opDollarValue,
        emitDate,
        incomeAccountIdForLocal,
      };

      if (opDesc) Obj.description = opDesc;
      if (opNotes) Obj.notes = opNotes;
      const result = await OperationsService.storeInternationalOperation(Obj);

      reSetState();

      console.log('result:', result);

      return result;
    } catch (err) {
      console.log('error trying to submit');
      console.log(err);
      message.error(`Error! ${err.message || 'Unknown Error!'}`);
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
            label={OperMsgs[locale].emitDate}
            name="emitDate"
            initialValue={dayjs()}
            rules={[{ required: true, message: 'Data de emissão é obrigatório!' }]}
          >
            <DatePicker
              onChange={setEmitDate}
              value={emitDate}
              format="DD/MM/YYYY HH:mm:ss"
              showTime={{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }}
              changeOnBlur
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label="Conta International"
          >
            <SelectAccount
              value={internAccountId}
              onChange={setInternAccountId}
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
            label="Gasto na conta international"
          >
            <SelectAccount
              value={whatAccountIdForInter}
              onChange={setWhatAccountIdForInter}
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
            label="Valor em dollar"
            value={dollarValue}
            onChange={setDollarValue}
            forcedLocale="en-US"
          />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label="Conta Local"
          >
            <SelectAccount
              value={localAccountId}
              onChange={setLocalAccountId}
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
            label="Entrada na conta local"
          >
            <SelectAccount
              value={incomeAccountIdForLocal}
              onChange={setIncomeAccountIdForLocal}
              options={incomeAccountsToSelect.map((account) => ({
                value: account.id,
                disabled: !account.allowValue,
                label: account.name,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <MultipleWhatAcc
        setWhatAccounts={setWhatAccounts}
        whatAccounts={whatAccounts}
        sumWhatAccounts={sumWhatAccounts}
        whatAccountToSelect={whatAccountToSelect}
      />
      <div>Cotação: { helper.currencyFormatter(locale, sumWhatAccounts / dollarValue) }/ US$</div>
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </Form>
  );
}
