import React, { useState, useEffect } from 'react';

import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';

import './ListOfBills.css';

import Bill from './Bill';
import Spinner from '../Spinner';

export default function ListOfBills(props) {
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
        return newBills.push(bill);
      }
      const dueA = helper.dateToInput(helper.dbDateToNewDate(bills[index - 1].dueDate));
      const dueB = helper.dateToInput(helper.dbDateToNewDate(bills[index].dueDate));

      if (dueA === dueB && bills[index - 1].whereAccount === bill.whereAccount) {
        //  same date and payment option
        if (!newBills[newBills.length - 1].group) {
          newBills[newBills.length - 1] = {
            type: bill.type,
            group: true,
            _id: bills[index - 1]._id,
            bills: [bills[index - 1], bill],
          };
          return newBills;
        }
        return newBills[newBills.length - 1].bills.push(bill);
      }
      return newBills.push(bill);
    });
    return newBills;
  }

  return (
    <>
      {loading && <Spinner />}
      <div id="listOfBills">
        {billGroups().map(bill => (
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

// {bills.map(bill => (
//   <Bill bill={bill} key={bill._id} handlePayClick={handlePayClick} where="list" />
// ))}
