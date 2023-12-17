import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import './views.css';
import './Reports.css';

import { RepMsgs } from '../services/Messages';

import AcStatements from '../components/Reports/AcStatements';
import IncomesExpenses from '../components/Reports/IncomesExpenses';
import Future from '../components/Reports/Future';
import General from '../components/Reports/General';

export default function Reports() {
  const { locale } = useSelector((state) => state.DefaultsReducer);
  const [chosen, setChosen] = useState('acStat');

  return (
    <div className="view">
      <div id="header"><h1>{RepMsgs[locale].title}</h1></div>
      <div id="internalNav">
        <div className={`options ${chosen === 'acStat' ? 'chosen' : ''}`} onClick={() => setChosen('acStat')}>
          {RepMsgs[locale].statements}
        </div>
        <div className={`options ${chosen === 'incomesExpenses' ? 'chosen' : ''}`} onClick={() => setChosen('incomesExpenses')}>
          {RepMsgs[locale].incomesExpenses}
        </div>
        <div className={`options ${chosen === 'future' ? 'chosen' : ''}`} onClick={() => setChosen('future')}>
          {RepMsgs[locale].future}
        </div>
        <div className={`options ${chosen === 'general' ? 'chosen' : ''}`} onClick={() => setChosen('general')}>
          {RepMsgs[locale].general}
        </div>
      </div>
      {chosen === 'acStat' && <AcStatements />}
      {chosen === 'incomesExpenses' && <IncomesExpenses />}
      {chosen === 'future' && <Future />}
      {chosen === 'general' && <General />}
    </div>
  );
}
