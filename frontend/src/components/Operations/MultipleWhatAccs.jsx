import React from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import helper from '../../services/helper';
import { OperMsgs } from '../../services/Messages';
import SingleWhatAcc from './SingleWhatAcc';

export default function MultipleWhatAcc({
  setWhatAccounts, whatAccounts, runExtraValueChangedActions, whatAccountToSelect,
}) {
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

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

  return (
    <div id="whatAccountsRegisters">
      <div className="titleOfWhatAcRegs">
        <h3>
          {whatAccountToSelect.name === 'expense' ? OperMsgs[locale].expenses : OperMsgs[locale].incomes}
        </h3>
      </div>
      {whatAccounts.map((whatAccount, index) => (
        <SingleWhatAcc
          key={`whatAcc-${index}`}
          setWhatAccounts={setWhatAccounts}
          whatAccounts={whatAccounts}
          whatAccount={whatAccount}
          index={index}
          whatAccountToSelect={whatAccountToSelect}
          runExtraValueChangedActions={runExtraValueChangedActions}
        />
      ))}
      <div style={{ marginTop: '15px' }}>
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
