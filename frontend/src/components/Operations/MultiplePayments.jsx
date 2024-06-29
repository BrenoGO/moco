import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import helper from '../../services/helper';
import { OperMsgs } from '../../services/Messages';

import SinglePayment from './SinglePayment';

import ImgX from '../../imgs/Button_X.png';
import ImgChecked from '../../imgs/checked.png';

export default function MultiplePayments({
  setWhereAccounts,
  whereAccounts,
  whatAccounts,
  whatAccountToSelect
}) {
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const sumWhatAccounts = whatAccounts.reduce((ac, current) => ac + current.value, 0);
  const sumWhereAccounts = useMemo(
    () => whereAccounts.reduce((ac, current) => ac + current.value, 0),
    [whereAccounts]
  );

  MultiplePayments.propTypes = {
    whatAccountToSelect: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired,
    whatAccounts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setWhereAccounts: PropTypes.func.isRequired,
    whereAccounts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  function handleAddWhereAccount() {
    setWhereAccounts([
      ...whereAccounts,
      {
        id: defaultAccounts.whereAccounts.AtSight,
        value: 0,
        type: 'AtSight',
      },
    ]);
  }

  return (
    <div style={{ marginTop: '30px' }}>
        <div id="titleWhereAccountsRegisters">
          <h3>{OperMsgs[locale].howPaym}</h3>
        </div>
        {whereAccounts.map((whereAccount, index) =>
          <SinglePayment
            key={`single-payment-${index}`}
            whereAccount={whereAccount}
            whatAccountToSelect={whatAccountToSelect}
            index={index}
            setWhereAccounts={setWhereAccounts}
            whereAccounts={whereAccounts}
          />
        )}
        <div style={{ marginTop: '15px' }}>
          <button type="button" id="butAddWhereAccount" onClick={handleAddWhereAccount}>
            {OperMsgs[locale].addPaymBut}
          </button>
        </div>
        <div id="TotalWhereAccount">
          <span>
            {OperMsgs[locale].total}
            {helper.currencyFormatter(locale, sumWhereAccounts)}
            {sumWhatAccounts.toFixed(2) === sumWhereAccounts.toFixed(2) ? (
              <img src={ImgChecked} width="20px" alt="checked" className="ifCheckedImg" />
            ) : (
              <span>
                <img src={ImgX} width="20px" alt="not checked" className="ifCheckedImg" />
                {OperMsgs[locale].diff}
                {(sumWhatAccounts - sumWhereAccounts).toFixed(2)}
              </span>
            )}
          </span>
        </div>
      </div>
  );
}
