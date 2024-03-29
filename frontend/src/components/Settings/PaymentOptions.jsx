import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Select from '../Select';
import helpers from '../../services/helper';
import { SettingsMsgs } from '../../services/Messages';

import { SettingsService } from '../../services/SettingsService';

import { updateDefault } from '../../actions/DefaultsActions';

export default function PaymentOptions() {
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);
  const accounts = useSelector((state) => state.AccountsReducer.accounts);

  const [chosenPayments, setChosenPayments] = useState({
    AtSight: defaultAccounts.whereAccounts.AtSight,
    ToPay: defaultAccounts.whereAccounts.ToPay,
    ToReceive: defaultAccounts.whereAccounts.ToReceive,
  });

  const dispatch = useDispatch();

  async function changePayments() {
    const setting = await SettingsService.update('defaultAccounts', {
      data: {
        ...defaultAccounts,
        whereAccounts: {
          AtSight: chosenPayments.AtSight,
          ToPay: chosenPayments.ToPay,
          ToReceive: chosenPayments.ToReceive,
        },
      },
    });
    dispatch(updateDefault('defaultAccounts', setting.data.defaultAccounts));
  }

  return (
    <div className="flex-column">
      <div id="paymentsHeader">
        <h3>{SettingsMsgs[locale].paymentOptions}</h3>
      </div>
      <div id="paymentsContent">
        <div id="selectAtSight" className="selectAccount">
          <div id="AtSightAccountSelectorLabel">{SettingsMsgs[locale].paymOptAtSight}</div>
          <Select
            id="AtSightAccountSelector"
            value={chosenPayments.AtSight}
            onChange={(id) => setChosenPayments({ ...chosenPayments, AtSight: id })}
            options={
              helpers.organizedAccounts(accounts, defaultAccounts.currentAccounts)
                .map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: `[${account.id}] ${account.name}`,
                }))
}
          />
        </div>
        <div id="selectToPay" className="selectAccount">
          <div id="ToPayAccountSelectorLabel">{SettingsMsgs[locale].paymOptToPay}</div>
          <Select
            id="ToPayAccountSelector"
            value={chosenPayments.ToPay}
            onChange={(id) => setChosenPayments({ ...chosenPayments, ToPay: id })}
            options={
              helpers.organizedAccounts(accounts, defaultAccounts.ToPay)
                .map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: `[${account.id}] ${account.name}`,
                }))
}
          />
        </div>
        <div id="selectToReceive" className="selectAccount">
          <div id="ToReceiveAccountSelectorLabel">{SettingsMsgs[locale].paymOptToRec}</div>
          <Select
            id="ToReceiveAccountSelector"
            value={chosenPayments.ToReceive}
            onChange={(id) => setChosenPayments({ ...chosenPayments, ToReceive: id })}
            options={
              helpers.organizedAccounts(accounts, defaultAccounts.ToReceive)
                .map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: `[${account.id}] ${account.name}`,
                }))
}
          />
        </div>
        {
          (
            (defaultAccounts.whereAccounts.AtSight !== chosenPayments.AtSight)
            || (defaultAccounts.whereAccounts.ToPay !== chosenPayments.ToPay)
            || (defaultAccounts.whereAccounts.ToReceive !== chosenPayments.ToReceive)
          )
            && (
              <div id="diffAcDiv">
                <button type="button" className="but-primary-neutral" onClick={changePayments}>
                  {SettingsMsgs[locale].saveChanges}
                </button>
              </div>
            )
        }
      </div>
    </div>

  );
}
