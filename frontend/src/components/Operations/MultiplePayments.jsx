import React, { useMemo } from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import helper from '../../services/helper';
import { OperMsgs } from '../../services/Messages';

import SinglePayment from './SinglePayment';

import ImgX from '../../imgs/Button_X.png';
import ImgChecked from '../../imgs/checked.png';

export default function MultiplePayments({
  setPayments,
  payments,
  whatAccounts,
  whatAccountToSelect
}) {
  const { defaultAccounts, locale } = useSelector((state) => state.DefaultsReducer);

  const sumWhatAccounts = whatAccounts.reduce((ac, current) => ac + current.value, 0);
  const sumPayments = useMemo(
    () => payments.reduce((ac, current) => ac + current.value, 0),
    [payments]
  );

  MultiplePayments.propTypes = {
    whatAccountToSelect: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }).isRequired,
    whatAccounts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    setPayments: PropTypes.func.isRequired,
    payments: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  };

  function handleAddPayment() {
    function getUniquePaymentKey() {
      // max 100 payments, should be more than enough for anyone
      let key = String(helper.random100());
      while (payments.some(payment => payment.paymentKey === key)) {
        key = String(helper.random100());
      }
      return key; 
    }

    setPayments([
      ...payments,
      {
        id: defaultAccounts.whereAccounts.AtSight,
        value: 0,
        type: 'AtSight',
        paymentKey: getUniquePaymentKey(),
      },
    ]);
  }

  return (
    <div style={{ marginTop: '30px' }}>
        <div id="titleWhereAccountsRegisters">
          <h3>{OperMsgs[locale].howPaym}</h3>
        </div>
        {payments.map((payment, index) =>
          <SinglePayment
            key={`single-payment-${index}`}
            payment={payment}
            whatAccountToSelect={whatAccountToSelect}
            index={index}
            setPayments={setPayments}
            payments={payments}
          />
        )}
        <div style={{ marginTop: '15px' }}>
          <button type="button" id="butAddWhereAccount" onClick={handleAddPayment}>
            {OperMsgs[locale].addPaymBut}
          </button>
        </div>
        <div id="TotalWhereAccount">
          <span>
            {OperMsgs[locale].total}
            {helper.currencyFormatter(locale, sumPayments)}
            {sumWhatAccounts.toFixed(2) === sumPayments.toFixed(2) ? (
              <img src={ImgChecked} width="20px" alt="checked" className="ifCheckedImg" />
            ) : (
              <span>
                <img src={ImgX} width="20px" alt="not checked" className="ifCheckedImg" />
                {OperMsgs[locale].diff}
                {(sumWhatAccounts - sumPayments).toFixed(2)}
              </span>
            )}
          </span>
        </div>
      </div>
  );
}
