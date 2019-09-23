import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import './views.css';
import './Reports.css';

import AcStatements from '../components/Reports/AcStatements';
import Expenses from '../components/Reports/Expenses';
import Future from '../components/Reports/Future';
import General from '../components/Reports/General';

import Helper from '../services/helper';

export default function Reports() {
  const [chosen, setChosen] = useState('acStat');

  const accounts = useSelector(state => state.AccountsReducer.accounts);

  return (
    <div className="view">
      <div id="header"><h1>Reports</h1></div>
      <div id="internalNav">
        <div className={`options ${chosen === 'acStat' ? 'chosen' : ''}`} onClick={() => setChosen('acStat')}>
          Account Statements
        </div>
        <div className={`options ${chosen === 'expenses' ? 'chosen' : ''}`} onClick={() => setChosen('expenses')}>
          Expenses
        </div>
        <div className={`options ${chosen === 'future' ? 'chosen' : ''}`} onClick={() => setChosen('future')}>
          Future
        </div>
        <div className={`options ${chosen === 'general' ? 'chosen' : ''}`} onClick={() => setChosen('general')}>
          General
        </div>
      </div>
      {chosen === 'acStat' && <AcStatements curAccounts={Helper.organizedAccounts(accounts, 3)} />}
      {chosen === 'expenses' && <Expenses />}
      {chosen === 'future' && <Future />}
      {chosen === 'general' && <General />}
    </div>
  );
}
