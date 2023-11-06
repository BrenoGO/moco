import React from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
// import {
//   Form, DatePicker, Row, Col,
// } from 'antd';
import Select from '../Select';

import helper from '../../services/helper';
import { OperMsgs } from '../../services/Messages';
import InputValue from '../InputValue';

export default function MultipleWhatAcc({
  setWhatAccounts, whatAccounts, runExtraValueChangedActions, whatAccountToSelect,
}) {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccountToSelect.id);
  const sumWhatAccounts = whatAccounts.reduce((ac, current) => ac + current.value, 0);

  MultipleWhatAcc.propTypes = {
    whatAccountToSelect: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired,
    whatAccounts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setWhatAccounts: PropTypes.func.isRequired,
    runExtraValueChangedActions: PropTypes.func,
  };
  MultipleWhatAcc.defaultProps = {
    runExtraValueChangedActions: undefined,
  };

  function handleWhatAccountsIdChange(index, id) {
    setWhatAccounts(
      whatAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, id };
      }),
    );
  }

  function handleWhatDescChange(description, index) {
    setWhatAccounts(
      whatAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, description };
      }),
    );
  }

  function handleWhatNotesChange(notes, index) {
    setWhatAccounts(
      whatAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, notes };
      }),
    );
  }

  function handleAddWhatAccount() {
    setWhatAccounts([
      ...whatAccounts,
      {
        id: defaultAccounts.whatAccounts.expense,
        value: 0,
        description: '',
        notes: '',
      },
    ]);
  }

  function handleWhatAccountsValueChange(index, value) {
    const newWhatAccounts = whatAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value };
    });

    setWhatAccounts(newWhatAccounts);
    if (runExtraValueChangedActions) {
      runExtraValueChangedActions(index, value, newWhatAccounts.reduce((ac, current) => ac + current.value, 0));
    }
  }

  function handleCloseWhatAccount(index) {
    setWhatAccounts([...whatAccounts.slice(0, index), ...whatAccounts.slice(index + 1, whatAccounts.length)]);
  }

  return (
    <div id="whatAccountsRegisters">
      <div className="titleOfWhatAcRegs">
        <h3>
          {whatAccountToSelect.name === 'expense' ? OperMsgs[locale].expenses : OperMsgs[locale].incomes}
        </h3>
      </div>
      {whatAccounts.map((whatAccount, index) => (
        <div key={index} className="whatAccountReg">
          <div className="whatAccountContent">
            <div id={`selectWhatAccount-${index}`} className="selectAccount">
              <div id={`whatAccountSelectorLabel-${index}`}>{OperMsgs[locale].whatAc}</div>
              <Select
                id={`whatAccountSelector-${index}`}
                value={whatAccount.id}
                onChange={(id) => handleWhatAccountsIdChange(index, id)}
                options={whatAccountsToSelect.map((account) => ({
                  value: account.id,
                  disabled: !account.allowValue,
                  label: account.name,
                }))}
              />
            </div>
            <div className="whatAccountValue">
              <InputValue
                label={OperMsgs[locale].value}
                value={whatAccount.value}
                onChange={(v) => handleWhatAccountsValueChange(index, v)}
              />
            </div>
            <div className="divWhatDescription">
              <label htmlFor={`whatDesc-${index}`}>
                {OperMsgs[locale].desc}
                <input
                  id={`whatDesc-${index}`}
                  type="text"
                  value={whatAccount.description}
                  onChange={(e) => handleWhatDescChange(e.target.value, index)}
                />
              </label>
            </div>
            <div className="divWhatNotes">
              <label htmlFor={`whatNotes-${index}`}>
                {OperMsgs[locale].notes}
                <input
                  id={`whatNotes-${index}`}
                  type="text"
                  value={whatAccount.notes}
                  onChange={(e) => handleWhatNotesChange(e.target.value, index)}
                />
              </label>
            </div>
          </div>
          <div className="closeWhatAccount">
            <button className="smallBut" type="button" onClick={() => handleCloseWhatAccount(index)}>
              X
            </button>
          </div>
        </div>
      ))}
      <div id="divAddWhatAccount">
        <button type="button" id="butAddWhatAccount" onClick={handleAddWhatAccount}>
          {OperMsgs[locale].addAcBut}
        </button>
      </div>
      <div id="TotalWhatAccount">
        <span>
          {OperMsgs[locale].total}
          {helper.currencyFormatter(locale, sumWhatAccounts)}
        </span>
      </div>
    </div>
  );
}
