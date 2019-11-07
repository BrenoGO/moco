import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Select from '../Select';
import helpers from '../../services/helper';

import { SettingsMsgs } from '../../services/Messages';
import { SettingsService } from '../../services/SettingsService';

import { updateDefault } from '../../actions/DefaultsActions';

export default function DefaultAccounts() {
  const { defaultAccounts, locale } = useSelector(state => state.DefaultsReducer);
  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const [chosenAccounts, setChosenAccounts] = useState({
    income: defaultAccounts.whatAccounts.income,
    expense: defaultAccounts.whatAccounts.expense,
  });

  const dispatch = useDispatch();

  async function changeAccounts() {
    const setting = await SettingsService.update('defaultAccounts', {
      ...defaultAccounts,
      whatAccounts: {
        income: chosenAccounts.income,
        expense: chosenAccounts.expense,
      }
    });
    dispatch(updateDefault('defaultAccounts', setting.data.defaultAccounts));
  }

  return (
    <div className="flex-column">
      <div id="defAcHeader">
        <h3>{SettingsMsgs[locale].defAcc}</h3>
      </div>
      <div id="defAcContent">
        <div id="selectWhatIncomes" className="selectAccount">
          <div id="whatIncomesAccountSelectorLabel">{SettingsMsgs[locale].incomes}</div>
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
          <div id="whatExpensesAccountSelectorLabel">{SettingsMsgs[locale].expenses}</div>
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
                {SettingsMsgs[locale].saveChanges}
              </button>
            </div>
          )
      }
    </div>

  );
}
