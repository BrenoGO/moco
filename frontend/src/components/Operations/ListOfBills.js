import React, { useState, useEffect } from 'react';

import { BillsService } from '../../services/BillsService';

import './ListOfBills.css';

import Bill from './Bill';

export default function ListOfBills(props) {
  const { type, setAction } = props; // 'ToPay' or 'ToReceive'

  const [bills, setBills] = useState([]);

  useEffect(() => {
    BillsService.getTyped(type)
      .then((resp) => {
        setBills(resp);
      });
  }, [type]);

  function handlePayClick(bill) {
    setAction({ name: 'payBill', params: { bill } });
  }

  return (
    <div id="listOfBills">
      {bills.map(bill => (
        <Bill bill={bill} key={bill._id} handlePayClick={handlePayClick} where="list" />
      ))}

    </div>
  );
}
