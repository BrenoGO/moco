import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { message } from 'antd';
import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { OperationsService } from '../../services/OperationsService';

import { resetBalance } from '../../actions/DefaultsActions';

import Select from '../Select';
import Spinner from '../Spinner';

export default function Transference() {
  const { defaultAccounts, balances, locale } = useSelector((state) => state.DefaultsReducer);
  const { accounts } = useSelector((state) => state.AccountsReducer);
  const initialValue = locale !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';

  const whereAccountsToSelect = helper.organizedAccounts(
    accounts,
    defaultAccounts.currentAccounts,
  );

  const [transferenceDate, setTransferenceDate] = useState(new Date());
  const [whereAccountIdTo, setWhereAccountIdTo] = useState(defaultAccounts.transferences.to);
  const [whereAccountIdFrom, setWhereAccountIdFrom] = useState(defaultAccounts.transferences.from);
  const [strValue, setStrValue] = useState(initialValue);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  function reSetState() {
    setTransferenceDate(new Date());
    setWhereAccountIdTo(defaultAccounts.transferences.to);
    setWhereAccountIdFrom(defaultAccounts.transferences.from);
    setStrValue(initialValue);
  }

  async function transfer() {
    setLoading(true);
    try {
      const value = helper.toNumber(strValue);

      await OperationsService.storeTransferOperation({
        fromWhereAccountId: whereAccountIdFrom,
        toWhereAccountId: whereAccountIdTo,
        value,
        description,
        emitDate: transferenceDate,
      });

      const fromAccountBalance = balances.filter((ac) => ac.accountId === whereAccountIdFrom);
      const newFromBalance = fromAccountBalance[0].balance - value;

      const toAccountBalance = balances.filter((ac) => ac.accountId === whereAccountIdTo);
      const newToBalance = toAccountBalance[0].balance + value;

      dispatch(resetBalance({ accountId: whereAccountIdFrom, balance: newFromBalance }));
      dispatch(resetBalance({ accountId: whereAccountIdTo, balance: newToBalance }));
      reSetState();
    } catch (err) {
      console.log('error trying to execute transfer');
      console.log(err);
      message.error(`Error! ${err.message || 'Unknown Error!'}`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div id="transferenceDiv">
      {loading && <Spinner />}
      <div>
        {OperMsgs[locale].transfDate}
        <input
          type="date"
          value={helper.dateToInput(transferenceDate)}
          onChange={(e) => setTransferenceDate(helper.inputDateToNewDate(e.target.value))}
        />
      </div>
      <div id="selectFromAccount" className="selectAccount">
        <div id="fromSelectorLabel">{OperMsgs[locale].transFromAc}</div>
        <Select
          value={whereAccountIdFrom}
          onChange={setWhereAccountIdFrom}
          options={whereAccountsToSelect.map((account) => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name,
          }))}
        />
      </div>
      <div id="selectToAccount" className="selectAccount">
        <div id="toSelectorLabel">{OperMsgs[locale].transToAc}</div>
        <Select
          value={whereAccountIdTo}
          onChange={setWhereAccountIdTo}
          options={whereAccountsToSelect.map((account) => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name,
          }))}
        />
      </div>
      <div>
        {OperMsgs[locale].value}
        <input
          type="text"
          className="inValue"
          inputMode="numeric"
          value={strValue}
          onChange={(e) => setStrValue(helper.currencyFormatter(locale, e.target.value))}
        />
        <button
          type="button"
          onClick={() => setStrValue(
            strValue.substring(0, 1) === '-'
              ? helper.currencyFormatter(locale, strValue.substring(1))
              : helper.currencyFormatter(locale, `-${strValue}`),
          )}
        >
          {strValue.substring(0, 1) === '-' ? '+' : '-'}
        </button>
      </div>
      <div className="mt-10">
        <label htmlFor="description">
          {OperMsgs[locale].desc}
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </div>
      <div>
        <button type="button" className="btn btn-primary" onClick={transfer}>
          {OperMsgs[locale].transfA}
        </button>
      </div>
    </div>
  );
}
