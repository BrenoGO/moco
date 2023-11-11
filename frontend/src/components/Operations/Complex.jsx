/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';

import './operations.css';
import './Complex.css';

import { OperMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { BillsService } from '../../services/BillsService';
import { RegistersService } from '../../services/RegistersService';
import { OperationsService } from '../../services/OperationsService';

import { resetBalance } from '../../actions/DefaultsActions';

import ImgX from '../../imgs/Button_X.png';
import ImgChecked from '../../imgs/checked.png';

import InputValue from '../InputValue';
import Select from '../Select';
import Spinner from '../Spinner';
import MultipleWhatAcc from './MultipleWhatAccs';

export default function Complex() {
  const accounts = useSelector((state) => state.AccountsReducer.accounts);
  const { defaultAccounts, balances, locale } = useSelector((state) => state.DefaultsReducer);

  const today = new Date();
  const todayPlus30 = new Date();
  todayPlus30.setDate(todayPlus30.getDate() + 30);

  const [whatAccounts, setWhatAccounts] = useState([
    {
      id: defaultAccounts?.whatAccounts?.expense || 'temp',
      value: 0,
      description: '',
      notes: '',
    },
  ]);
  const [whereAccounts, setWhereAccounts] = useState([
    {
      id: defaultAccounts?.whereAccounts?.AtSight || 'temp',
      value: 0,
      type: 'AtSight',
    },
  ]);
  const [whatAccountToSelect, setWhatAccountToSelect] = useState({
    id: defaultAccounts?.expense,
    name: 'expense',
  });

  useEffect(() => {
    if (defaultAccounts?.whatAccounts) {
      setWhatAccounts([
        {
          id: defaultAccounts.whatAccounts.expense,
          value: 0,
          description: '',
          notes: '',
        },
      ]);
      setWhereAccounts([
        {
          id: defaultAccounts.whereAccounts.AtSight,
          value: 0,
          type: 'AtSight',
        },
      ]);
      setWhatAccountToSelect({
        id: defaultAccounts.expense,
        name: 'expense',
      });
    }
  }, [defaultAccounts]);

  const [emitDate, setEmitDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);
  const ToReceiveAccounts = helper.organizedAccounts(accounts, defaultAccounts.ToReceive);
  const ToPayAccounts = helper.organizedAccounts(accounts, defaultAccounts.ToPay);
  const sumWhatAccounts = whatAccounts.reduce((ac, current) => ac + current.value, 0);
  const sumWhereAccounts = whereAccounts.reduce((ac, current) => ac + current.value, 0);

  const dispatch = useDispatch();

  function setAccounts(type) {
    if (type === 'expense') {
      setWhatAccountToSelect({ id: defaultAccounts[type], name: 'expense' });
      setWhereAccounts(
        whereAccounts.map((item) => {
          if (item.type === 'ToPay' || item.type === 'AtSight') return item;
          return { ...item, type: 'ToPay' };
        }),
      );
    } else {
      setWhatAccountToSelect({ id: defaultAccounts[type], name: 'income' });
      setWhereAccounts(
        whereAccounts.map((item) => {
          if (item.type === 'ToReceive' || item.type === 'AtSight') return item;
          return { ...item, type: 'ToReceive' };
        }),
      );
    }
  }

  function editBillValue(index, billI, value) {
    setWhereAccounts(
      whereAccounts.map((whereAccount, i1) => {
        if (index !== i1) return whereAccount;
        return {
          ...whereAccount,
          bills: whereAccount.bills.map((bill, i2) => {
            if (billI !== i2) return bill;
            return { ...bill, value };
          }),
        };
      }),
    );
  }

  function editBillDate(index, billI, value) {
    setWhereAccounts(
      whereAccounts.map((whereAccount, i1) => {
        if (index !== i1) return whereAccount;
        return {
          ...whereAccount,
          bills: whereAccount.bills.map((bill, i2) => {
            if (billI !== i2) return bill;
            return { ...bill, date: value };
          }),
        };
      }),
    );
  }

  function editOnBlur(index) {
    const sum = whereAccounts[index].bills.reduce((a, b, i) => {
      if (i === 1) {
        return a.value + b.value;
      }
      return a + b.value;
    });

    setWhereAccounts(
      whereAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, value: sum };
      }),
    );
  }

  function distributeValue(value, tempBills) {
    const installments = tempBills.length;

    const instVal = Number((value / installments).toFixed(2));
    return tempBills.map((bill, index) => {
      if (index === 0) {
        if (value !== instVal * installments) {
          const dif = value - instVal * installments;
          const newValue = instVal + dif;
          return { ...bill, value: newValue };
        }
      }
      return { ...bill, value: instVal };
    });
  }

  function runExtraValueChangedActions(_index, _value, sum) {
    setWhereAccounts([
      {
        ...whereAccounts[0],
        value: sum,
      },
    ]);
  }

  function reSetState() {
    setWhatAccounts([
      {
        id: defaultAccounts.whatAccounts.expense,
        value: 0,
        description: '',
        notes: '',
      },
    ]);
    setWhereAccounts([
      {
        id: defaultAccounts.whereAccounts.AtSight,
        value: 0,
        type: 'AtSight',
      },
    ]);
    setWhatAccountToSelect({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(new Date());
  }

  function handleWhereTypeChange(type, index) {
    setWhereAccounts(
      whereAccounts.map((item, i) => {
        if (i !== index) return item;
        const newObj = {
          ...item,
          type,
          id: defaultAccounts.whereAccounts[type],
        };
        if (type === 'AtSight') newObj.bills = null;
        else newObj.bills = [{ date: todayPlus30, value: item.value }];

        return newObj;
      }),
    );
  }

  function handleWhereAccountsIdChange(index, id) {
    setWhereAccounts(
      whereAccounts.map((item, i) => {
        if (index !== i) return item;
        return { ...item, id };
      }),
    );
  }

  function handleWhereValueChange(value, index, type) {
    if (type === 'ToPay' || type === 'ToReceive') {
      const newBills = distributeValue(value, whereAccounts[index].bills);
      setWhereAccounts(
        whereAccounts.map((item, i) => {
          if (i !== index) return item;
          return { ...item, value, bills: newBills };
        }),
      );
    } else {
      setWhereAccounts(
        whereAccounts.map((item, i) => {
          if (i !== index) return item;
          return { ...item, value };
        }),
      );
    }
  }

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

  function handleCloseWhereAccount(index) {
    setWhereAccounts([
      ...whereAccounts.slice(0, index),
      ...whereAccounts.slice(index + 1, whereAccounts.length),
    ]);
  }

  function handleInstallmentsChange(index, installments) {
    let newBills = [];
    if (installments > whereAccounts[index].bills.length) {
      // aumentou parcela
      if (installments - whereAccounts[index].bills.length === 1) {
        const date = new Date(whereAccounts[index].bills[installments - 2].date);
        date.setDate(date.getDate() + 30);
        newBills = [...whereAccounts[index].bills, { date, value: 0 }];
      } else {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < installments; i++) {
          if (i === 0) {
            newBills.push({ date: todayPlus30, value: 0 });
          } else {
            const date = new Date(newBills[i - 1].date);
            date.setDate(date.getDate() + 30);
            newBills.push({ date, value: 0 });
          }
        }
      }
    } else if (installments > 1) newBills = whereAccounts[index].bills.slice(0, installments);
    else newBills = whereAccounts[index].bills.slice(0, 1);
    newBills = distributeValue(whereAccounts[index].value, newBills);
    setWhereAccounts(
      whereAccounts.map((item, i) => {
        if (i !== index) return item;
        return { ...item, bills: newBills };
      }),
    );
  }

  function calcNewBalance(accId, value) {
    const lastWhereAccountBalance = balances.filter((item) => item.accountId === accId)[0].balance;
    return Number((lastWhereAccountBalance + value).toFixed(2));
  }

  async function submit() {
    setLoading(true);
    if (sumWhatAccounts === 0) return alert('value is 0!');
    if (sumWhatAccounts.toFixed(2) !== sumWhereAccounts.toFixed(2)) {
      return alert('The sum of what accounts have to be iqual the sum of where accounts');
    }

    const allBills = [];
    whereAccounts.forEach((whereAccount) => {
      if (whereAccount.bills) {
        whereAccount.bills.forEach((bill, index) => {
          let type = 'ToPay';
          if (whatAccountToSelect.name === 'income') type = 'ToReceive';
          allBills.push({
            type,
            value: bill.value,
            dueDate: bill.date,
            emitDate,
            installment: `${index + 1}/${whereAccount.bills.length}`,
            whereAccount: whereAccount.id,
          });
        });
      }
    });

    const billsResp = await BillsService.store(allBills);
    let billsIds = [];
    if (Array.isArray(billsResp)) {
      billsIds = billsResp.map((bill) => bill._id);
    }

    let boolDispBal = false;
    let balance = 0;
    const allRegs = whatAccounts.map((whatAccount, i) => {
      let signal = 1;
      if (whatAccountToSelect.name === 'expense') {
        signal = -1;
      }
      const value = whatAccount.value * signal;
      const newObj = {
        opType: 'complex',
        emitDate,
        whatAccountId: whatAccount.id,
        value,
      };
      if (whatAccount.description) newObj.description = whatAccount.description;
      if (whatAccount.notes) newObj.notes = whatAccount.notes;

      if (whereAccounts.length === 1) {
        newObj.whereAccountId = whereAccounts[0].id;
        newObj.opType = `${whatAccountToSelect.name}${whereAccounts[0].type}`;
        if (whereAccounts[0].type === 'AtSight') {
          boolDispBal = true;
          if (i === 0) {
            balance = calcNewBalance(whereAccounts[0].id, value);
          } else {
            balance += value;
          }
          balance = Number(balance.toFixed(2));

          newObj.emitDate = dayjs(emitDate).add(i, 'milliseconds').toDate();
          newObj.whereAccountBalance = balance;
        }
      } else {
        const distinctTypes = [...new Set(whereAccounts.map((item) => item.type))];
        if (distinctTypes.length === 1) {
          newObj.opType = `${whatAccountToSelect.name}${whereAccounts[0].type}`;
        }
      }
      return newObj;
    });

    if (boolDispBal) {
      dispatch(resetBalance({ accountId: whereAccounts[0].id, balance }));
    }

    if (whereAccounts.length > 1) {
      whereAccounts.forEach((whereAccount) => {
        if (whereAccount.type === 'AtSight') {
          let { value } = whereAccount;
          const newObj = {
            opType: `${whatAccountToSelect.name}${whereAccount.type}`,
            emitDate,
            whereAccountId: whereAccount.id,
            value,
          };
          if (whatAccountToSelect.name === 'expense') {
            value = -value;
          }
          const newBalance = calcNewBalance(whereAccount.id, value);
          newObj.whereAccountBalance = newBalance;
          dispatch(resetBalance({ accountId: whereAccount.id, balance: newBalance }));
          allRegs.push(newObj);
        }
      });
    }
    const regIds = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const reg of allRegs) {
      //  ensure syncronism
      // eslint-disable-next-line no-await-in-loop
      const resp = await RegistersService.store(reg);
      regIds.push(resp._id);
    }

    const operObj = {
      registers: regIds,
      bills: billsIds,
      emitDate,
    };

    await OperationsService.store(operObj);
    setLoading(false);
    return reSetState();
  }

  return (
    <>
      {loading && <Spinner />}
      <div id="divSelectExpenseOrIncome">
        <div>
          {OperMsgs[locale].emitDate}
          <input
            type="date"
            value={helper.dateToInput(emitDate)}
            onChange={(e) => setEmitDate(helper.inputDateToNewDate(e.target.value))}
          />
        </div>
        <label htmlFor="selectExpenseOrIncome">
          {OperMsgs[locale].expOrInc}
          <select
            id="selectExpenseOrIncome"
            value={whatAccountToSelect.name}
            onChange={(e) => setAccounts(e.target.value)}
          >
            <option value="expense">{OperMsgs[locale].expense}</option>
            <option value="income">{OperMsgs[locale].income}</option>
          </select>
        </label>
      </div>
      <MultipleWhatAcc
        setWhatAccounts={setWhatAccounts}
        whatAccounts={whatAccounts}
        runExtraValueChangedActions={runExtraValueChangedActions}
        whatAccountToSelect={whatAccountToSelect}
      />
      <div id="whereAccountsRegisters">
        <div id="titleWhereAccountsRegisters">
          <h3>{OperMsgs[locale].howPaym}</h3>
        </div>
        {whereAccounts.map((whereAccount, index) => {
          let whereAccountToSelect = [];
          switch (whereAccount.type) {
            case 'AtSight':
              whereAccountToSelect = currentAccounts;
              break;
            case 'ToPay':
              whereAccountToSelect = ToPayAccounts;
              break;
            case 'ToReceive':
              whereAccountToSelect = ToReceiveAccounts;
              break;
            default:
              break;
          }
          return (
            <div className="whereAccountReg" key={index}>
              <div className="whereAccountContent">
                <select
                  value={whereAccount.type}
                  onChange={(e) => handleWhereTypeChange(e.target.value, index)}
                >
                  <option value="AtSight">{OperMsgs[locale].optAtSight}</option>
                  <option value={whatAccountToSelect.name === 'expense' ? 'ToPay' : 'ToReceive'}>
                    {whatAccountToSelect.name === 'expense'
                      ? OperMsgs[locale].optToPay
                      : OperMsgs[locale].optToRec}
                  </option>
                </select>
                <div id={`selectWhereAccount-${index}`} className="selectAccount">
                  <div id={`whereAccountSelectorLabel-${index}`}>{OperMsgs[locale].whereAc}</div>
                  <Select
                    id={`whatAccountSelector-${index}`}
                    value={whereAccount.id}
                    onChange={(id) => handleWhereAccountsIdChange(index, id)}
                    options={whereAccountToSelect.map((account) => ({
                      value: account.id,
                      disabled: !account.allowValue,
                      label: account.name,
                    }))}
                  />
                </div>

                <InputValue
                  label={OperMsgs[locale].value}
                  value={whereAccount.value}
                  onChange={(v) => handleWhereValueChange(v, index, whereAccount.type)}
                />
                {whereAccount.bills && (
                  <div className="whereBillsDiv">
                    <div className="divPaymentInstallments">
                      <label htmlFor="paymentInstallments">
                        {OperMsgs[locale].installments}
                        <select
                          id="paymentInstallments"
                          value={whereAccount.bills.length}
                          onChange={(e) => handleInstallmentsChange(index, e.target.value)}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="installmentsDiv">
                      {whereAccount.bills.map((bill, billI) => (
                        <div key={billI} className="installment">
                          <div className="installmentDate">
                            {OperMsgs[locale].date}
                            <input
                              type="date"
                              value={helper.dateToInput(bill.date)}
                              onChange={(e) => editBillDate(index, billI, helper.inputDateToNewDate(e.target.value))}
                            />
                          </div>
                          <div className="installmentValue">
                            <InputValue
                              label={OperMsgs[locale].value}
                              value={bill.value}
                              onChange={(e) => editBillValue(index, billI, e.target.value)}
                              onBlur={() => editOnBlur(index)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="closeWhereAccount">
                <button type="button" className="smallBut" onClick={() => handleCloseWhereAccount(index)}>
                  X
                </button>
              </div>
            </div>
          );
        })}
        <div id="divAddWhereAccount">
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
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>
          {OperMsgs[locale].regBut}
        </button>
      </div>
    </>
  );
}
