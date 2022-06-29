import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';

import './ListOfBills.css';

import Bill from './Bill';
import Spinner from '../Spinner';

export default function ListOfBills(props) {
  ListOfBills.propTypes = {
    type: PropTypes.string.isRequired,
    setAction: PropTypes.func.isRequired,
  };

  const { type, setAction } = props; // 'ToPay' or 'ToReceive'

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    BillsService.getTyped(type)
      .then((resp) => {
        setBills(resp);
        setLoading(false);
      });
  }, [type]);

  function handlePayClick(bill) {
    setAction({ name: 'payBill', params: { bill } });
  }

  function billGroups() {
    const newBills = [];
    bills.forEach((bill, index) => {
      if (index === 0) {
        newBills.push(bill);
        return;
      }

      const dueCurrent = helper.dateToInput(helper.dbDateToNewDate(bills[index].dueDate));

      const sameGroupIndex = newBills.findIndex((b) => {
        const dueFinding = helper.dateToInput(helper.dbDateToNewDate(b.dueDate));
        if (dueFinding === dueCurrent && bill.whereAccount === b.whereAccount) return true;
        return false;
      });

      if (sameGroupIndex === -1) {
        newBills.push(bill);
        return;
      }

      if (newBills[sameGroupIndex].group) {
        newBills[sameGroupIndex].bills.push(bill);
        return;
      }

      newBills[sameGroupIndex] = {
        type: bill.type,
        group: true,
        _id: newBills[sameGroupIndex]._id,
        bills: [newBills[sameGroupIndex], bill],
        dueDate: bill.dueDate,
        whereAccount: bill.whereAccount,
      };
    });

    return newBills;
  }

  return (
    <>
      {loading && <Spinner />}
      <div id="listOfBills">
        {billGroups().map((bill) => (
          <Bill
            bill={bill}
            key={bill._id}
            handlePayClick={handlePayClick}
            where="list"
          />
        ))}
      </div>
    </>
  );
}
