import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Select from '../Select';
import helpers from '../../services/helper';

import { SettingsService } from '../../services/SettingsService';

import { updateDefault } from '../../actions/DefaultsActions';

export default function DefaultAccounts() {
  const { defaultAccounts } = useSelector(state => state.DefaultsReducer);
  const accounts = useSelector(state => state.AccountsReducer.accounts);

  const [chosenAccounts, setChosenAccounts] = useState({
    income: defaultAccounts.whatAccounts.income,
    expense: defaultAccounts.whatAccounts.expense,
  });

  const dispatch = useDispatch();

  async function changeAccounts() {
    const setting = await SettingsService.update('defaultAccounts', {
      data: {
        ...defaultAccounts,
        whatAccounts: {
          income: chosenAccounts.income,
          expense: chosenAccounts.expense,
        }
      }
    });
    dispatch(updateDefault('defaultAccounts', setting.data));
  }

  return (
    <div className="flex-column">
      <div id="defAcHeader">
        <h3>Default Accounts:</h3>
      </div>
      <div id="defAcContent">
        <div id="selectWhatIncomes" className="selectAccount">
          <div id="whatIncomesAccountSelectorLabel">Incomes:</div>
          <Select
            id="whatIncomesAccountSelector"
            value={chosenAccounts.income}
            onChange={id => setChosenAccounts({ ...chosenAccounts, income: id })}
            options={
              helpers.organizedAccounts(accounts, defaultAccounts.income)
                .map(account => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: `[${account.id}] ${account.name}`
                }))}
          />
        </div>
        <div id="selectWhatExpenses" className="selectAccount">
          <div id="whatExpensesAccountSelectorLabel">Expenses:</div>
          <Select
            id="whatExpensesAccountSelector"
            value={chosenAccounts.expense}
            onChange={id => setChosenAccounts({ ...chosenAccounts, expense: id })}
            options={
              helpers.organizedAccounts(accounts, defaultAccounts.expense)
                .map(account => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: `[${account.id}] ${account.name}`
                }))}
          />
        </div>
      </div>
      {
        ((defaultAccounts.whatAccounts.income !== chosenAccounts.income)
        || (defaultAccounts.whatAccounts.expense !== chosenAccounts.expense))
          && (
            <div id="diffAcDiv">
              <button type="button" className="but-primary-neutral" onClick={changeAccounts}>
                Save Changes
              </button>
            </div>
          )
      }
    </div>

  );
}
