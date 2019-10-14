import React, { useState } from 'react';

import './views.css';
import './Reports.css';

import AcStatements from '../components/Reports/AcStatements';
import IncomesExpenses from '../components/Reports/IncomesExpenses';
import Future from '../components/Reports/Future';
import General from '../components/Reports/General';


export default function Reports() {
  const [chosen, setChosen] = useState('acStat');

  return (
    <div className="view">
      <div id="header"><h1>Reports</h1></div>
      <div id="internalNav">
        <div className={`options ${chosen === 'acStat' ? 'chosen' : ''}`} onClick={() => setChosen('acStat')}>
          Account Statements
        </div>
        <div className={`options ${chosen === 'incomesExpenses' ? 'chosen' : ''}`} onClick={() => setChosen('incomesExpenses')}>
          Incomes / Expenses
        </div>
        <div className={`options ${chosen === 'future' ? 'chosen' : ''}`} onClick={() => setChosen('future')}>
          Future
        </div>
        <div className={`options ${chosen === 'general' ? 'chosen' : ''}`} onClick={() => setChosen('general')}>
          General
        </div>
      </div>
      {chosen === 'acStat' && <AcStatements />}
      {chosen === 'incomesExpenses' && <IncomesExpenses />}
      {chosen === 'future' && <Future />}
      {chosen === 'general' && <General />}
    </div>
  );
}
