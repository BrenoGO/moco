import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Form, DatePicker, Select, message,
} from 'antd';
import moment from 'moment';

import './operations.css';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';

import { resetBalance } from '../../actions/DefaultsActions';

import SelectAccount from '../Select';
import Spinner from '../Spinner';

export default function AtSight() {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, balances, locale } = useSelector((state) => (state.DefaultsReducer));
  const initialValue = locale !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';
  const dispatch = useDispatch();

  const [opValue, setOpValue] = useState(initialValue);
  const [opDesc, setOpDesc] = useState('');
  const [opNotes, setOpNotes] = useState('');
  const [whatAccountId, setWhatAccountId] = useState(defaultAccounts.whatAccounts.expense);
  const [whereAccountId, setWhereAccountId] = useState(
    defaultAccounts.whereAccounts.AtSight,
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

  function reSetState() {
    setOpValue(initialValue);
    setOpDesc('');
    setOpNotes('');
    setWhatAccountId(defaultAccounts.whatAccounts.expense);
    setWhereAccountId(defaultAccounts.whereAccounts.AtSight);
    setWhatAccounts({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(moment());
  }

  function submit() {
    setLoading(true);
    let value = helper.toNumber(opValue);

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
    <Form>
      {loading && <Spinner />}
      <div id="divSelectExpenseOrIncome">
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
      </div>
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
      <div id="selectWhereAccount" className="selectAccount">
        <div id="whereAccountsSelectorLabel">{OperMsgs[locale].currAc}</div>
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
      </div>
      <div id="selectWhatAccount" className="selectAccount">
        <div id="whatAccountSelectorLabel">{OperMsgs[locale].whatAc}</div>
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
      </div>
      <div id="divValue">
        <label htmlFor="opValue">
          {OperMsgs[locale].value}
          <input
            type="text"
            id="opValue"
            className="inValue"
            value={opValue}
            onChange={(e) => setOpValue(helper.currencyFormatter(locale, e.target.value))}
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={() => setOpValue(
              opValue.substring(0, 1) === '-'
                ? helper.currencyFormatter(locale, opValue.substring(1))
                : helper.currencyFormatter(locale, `-${opValue}`),
            )}
          >
            {opValue.substring(0, 1) === '-' ? '+' : '-'}
          </button>
        </label>
      </div>
      <div id="divDescription">
        <label htmlFor="opDesc">
          {OperMsgs[locale].desc}
          <input type="text" id="opDesc" value={opDesc} onChange={(e) => setOpDesc(e.target.value)} />
        </label>
      </div>
      <div id="divNotes">
        <label htmlFor="opNotes">
          {OperMsgs[locale].notes}
          <input type="text" id="opNotes" value={opNotes} onChange={(e) => setOpNotes(e.target.value)} />
        </label>
      </div>
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </Form>
  );
}
