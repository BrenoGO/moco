import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';

import Select from '../Select';
import Spinner from '../Spinner';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { RegistersService } from '../../services/RegistersService';
import ModalEditRegister from '../Registers/ModalEditRegister';
import editBut from '../../imgs/editBut.png';

export default function AcStatements() {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, locale, balances } = useSelector((state) => state.DefaultsReducer);
  const curAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);

  const [acId, setAcId] = useState(defaultAccounts?.whereAccounts?.AtSight);
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);
  const [initDate, setInitDate] = useState(new Date(initialDate));
  const [finalDate, setFinalDate] = useState(new Date());
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [registerEditing, setRegisterEditing] = useState(null);

  useEffect(() => {
    if (defaultAccounts?.whereAccounts?.AtSight) {
      setAcId(defaultAccounts?.whereAccounts?.AtSight);
    }
  }, [defaultAccounts]);

  useEffect(() => {
    setLoading(true);
    let mounted = true;
    RegistersService.search({
      whereAccountId: acId,
      emitDate: {
        $gt: initDate,
        $lt: finalDate,
      },
    }).then((regs) => {
      setLoading(false);
      if (mounted) setRegisters(regs);
    });
    return () => { mounted = false; };
  }, [acId, initDate, finalDate]);

  function handleDateChange(when, date) {
    switch (when) {
      case 'init':
        setInitDate(helper.inputDateToNewDate(date));
        break;
      case 'final':
        setFinalDate(helper.inputDateToNewDate(date));
        break;
      default:
        break;
    }
  }

  function getBalance(accountId) {
    if (!accountId) return 0;
    const { balance } = balances.find((item) => item.accountId === accountId);
    return helper.currencyFormatter(locale, balance);
  }

  function handleEditClick(reg) {
    setEditModalVisible(true);
    setRegisterEditing({ ...reg, emitDate: moment(reg.emitDate) });
  }

  return (
    <div>
      {loading && <Spinner />}
      <div><h3>{RepMsgs[locale].statemTitle}</h3></div>
      <div id="form">
        <Select
          value={acId}
          onChange={setAcId}
          options={curAccounts.map((account) => ({
            value: account.id,
            disabled: !account.allowValue,
            label: account.name,
          }))}
        />
        <div>
          {RepMsgs[locale].initial}
          <input
            type="date"
            value={helper.dateToInput(initDate)}
            onChange={(e) => handleDateChange('init', e.target.value)}
          />
        </div>
        <div>
          {RepMsgs[locale].final}
          <input
            type="date"
            value={helper.dateToInput(finalDate)}
            onChange={(e) => handleDateChange('final', e.target.value)}
          />
        </div>
      </div>
      <div id="finalBalance">
        <h3>
          {RepMsgs[locale].balanceP}
          {' '}
          {getBalance(acId)}
        </h3>
      </div>
      <div id="report" className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <td>{RepMsgs[locale].date}</td>
              <td>{RepMsgs[locale].thAcc}</td>
              <td>{RepMsgs[locale].value}</td>
              <td>{RepMsgs[locale].balance}</td>
              <td />
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => {
              const desc = RegistersService.getRegDescToShow(reg);
              const emitDate = helper.formatDateAndTime(locale, new Date(reg.emitDate));
              const { value, whereAccountBalance: balance } = reg;
              return (
                <tr key={reg._id} className="register">
                  <td>{emitDate}</td>
                  <td>{desc}</td>
                  <td className={`text-nowrap ${value < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, value)}</td>
                  <td className={`text-nowrap ${balance < 0 ? 'red' : ''}`}>{helper.currencyFormatter(locale, balance || 0)}</td>
                  <td><img onClick={() => handleEditClick(reg)} src={editBut} width="10px" alt="editBut" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ModalEditRegister
          registerInitData={registerEditing}
          editModalVisible={editModalVisible}
          setEditModalVisible={setEditModalVisible}
          registers={registers}
          setRegisters={setRegisters}
        />
      </div>
    </div>
  );
}
