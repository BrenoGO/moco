import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './operations.css';
import './Complex.css';

import helper from '../../services/helper';
import internacionalization from '../../services/Internacionalization';
import { BillsService } from '../../services/BillsService';
import { RegistersService } from '../../services/RegistersService';
import { OperationsService } from '../../services/OperationsService';

import { resetBalance } from '../../actions/DefaultsActions';

import ImgX from '../../imgs/Button_X.png';
import ImgChecked from '../../imgs/checked.png';

import Select from '../Select';


export default function FutureOper() {
  const initialValue = internacionalization.getInitials() !== 'pt-BR' ? '$ 0.00' : 'R$ 0,00';
  const today = new Date();
  const todayPlus30 = new Date();
  todayPlus30.setDate(todayPlus30.getDate() + 30);

  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { defaultAccounts, balances } = useSelector(state => (state.DefaultsReducer));

  const [whatAccounts, setWhatAccounts] = useState(
    [{
      id: defaultAccounts.whatAccounts.expense,
      value: initialValue,
      description: '',
      notes: ''
    }]
  );
  const [whereAccounts, setWhereAccounts] = useState(
    [{
      id: defaultAccounts.whereAccounts.AtSight,
      value: initialValue,
      type: 'AtSight',
    }]
  );
  const [whatAccountToSelect, setWhatAccountToSelect] = useState({ id: defaultAccounts.expense, name: 'expense' });
  const [emitDate, setEmitDate] = useState(today);

  const whatAccountsToSelect = helper.organizedAccounts(accounts, whatAccountToSelect.id);
  const currentAccounts = helper.organizedAccounts(accounts, defaultAccounts.currentAccounts);
  const ToReceiveAccounts = helper.organizedAccounts(accounts, defaultAccounts.ToReceive);
  const ToPayAccounts = helper.organizedAccounts(accounts, defaultAccounts.ToPay);
  const sumWhatAccounts = whatAccounts.length > 1
    ? whatAccounts.reduce((ac, current, index) => {
      if (index === 1) {
        return helper.toNumber(ac.value) + helper.toNumber(current.value);
      }
      return ac + helper.toNumber(current.value);
    })
    : whatAccounts[0]
      ? helper.toNumber(whatAccounts[0].value)
      : 0;
  const sumWhereAccounts = whereAccounts.length > 1
    ? whereAccounts.reduce((ac, current, index) => {
      if (index === 1) {
        return helper.toNumber(ac.value) + helper.toNumber(current.value);
      }
      return ac + helper.toNumber(current.value);
    })
    : whereAccounts[0]
      ? helper.toNumber(whereAccounts[0].value)
      : 0;

  const dispatch = useDispatch();

  useEffect(() => {
    if (defaultAccounts.whatAccounts.expense) {
      setWhatAccounts(
        [{
          id: defaultAccounts.whatAccounts.expense,
          value: initialValue,
          description: '',
          notes: ''
        }]
      );
    }
  }, [defaultAccounts, initialValue]);

  function setAccounts(type) {
    if (type === 'expense') {
      setWhatAccountToSelect({ id: defaultAccounts.expense, name: 'expense' });
      setWhereAccounts(whereAccounts.map((item) => {
        if (item.type === 'ToPay' || item.type === 'AtSight') return item;
        return { ...item, type: 'ToPay' };
      }));
    } else {
      setWhatAccountToSelect({ id: defaultAccounts.income, name: 'income' });
      setWhereAccounts(whereAccounts.map((item) => {
        if (item.type === 'ToReceive' || item.type === 'AtSight') return item;
        return { ...item, type: 'ToReceive' };
      }));
    }
  }

  function editBillValue(index, billI, value) {
    setWhereAccounts(whereAccounts.map((whereAccount, i1) => {
      if (index !== i1) return whereAccount;
      return {
        ...whereAccount,
        bills: whereAccount.bills.map((bill, i2) => {
          if (billI !== i2) return bill;
          return { ...bill, value: internacionalization.currencyFormatter(value) };
        })
      };
    }));
  }

  function editBillDate(index, billI, value) {
    setWhereAccounts(whereAccounts.map((whereAccount, i1) => {
      if (index !== i1) return whereAccount;
      return {
        ...whereAccount,
        bills: whereAccount.bills.map((bill, i2) => {
          if (billI !== i2) return bill;
          return { ...bill, date: value };
        })
      };
    }));
  }

  function editOnBlur(index) {
    const sum = whereAccounts[index].bills.reduce((a, b, i) => {
      if (i === 1) {
        return helper.toNumber(a.value) + helper.toNumber(b.value);
      }
      return a + helper.toNumber(b.value);
    });

    setWhereAccounts(whereAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value: internacionalization.currencyFormatter(sum) };
    }));
  }

  function distributeValue(strValue, tempBills) {
    const installments = tempBills.length;
    const value = helper.toNumber(strValue);
    const instVal = Number((value / installments).toFixed(2));
    return (tempBills.map((bill, index) => {
      if (index === 0) {
        if (value !== instVal * installments) {
          const dif = value - instVal * installments;
          const newValue = instVal + dif;
          return { ...bill, value: internacionalization.currencyFormatter(newValue) };
        }
      }
      return { ...bill, value: internacionalization.currencyFormatter(instVal) };
    }));
  }

  function reSetState() {
    setWhatAccounts([{
      id: defaultAccounts.whatAccounts.expense,
      value: initialValue,
      description: '',
      notes: ''
    }]);
    setWhereAccounts([{
      id: defaultAccounts.whereAccounts.AtSight,
      value: initialValue,
      type: 'AtSight',
    }]);
    setWhatAccountToSelect({ id: defaultAccounts.expense, name: 'expense' });
    setEmitDate(new Date());
  }

  function handleWhatAccountsIdChange(index, id) {
    setWhatAccounts(whatAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, id };
    }));
  }

  function handleWhatAccountsValueChange(index, value) {
    const strValue = internacionalization.currencyFormatter(value);

    const newWhatAccounts = whatAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, value: strValue };
    });

    if (whereAccounts.length === 1) {
      if (whatAccounts.length === 1) {
        setWhereAccounts([{ ...whereAccounts[0], value: strValue }]);
      } else {
        const sum = newWhatAccounts.reduce((a, b, i) => {
          if (i === 1) return helper.toNumber(a.value) + helper.toNumber(b.value);
          return a + helper.toNumber(b.value);
        });
        setWhereAccounts([
          {
            ...whereAccounts[0],
            value: internacionalization.currencyFormatter(sum)
          }
        ]);
      }
    }

    setWhatAccounts(newWhatAccounts);
  }

  function handleWhatDescChange(description, index) {
    setWhatAccounts(whatAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, description };
    }));
  }

  function handleWhatNotesChange(notes, index) {
    setWhatAccounts(whatAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, notes };
    }));
  }

  function handleAddWhatAccount() {
    setWhatAccounts(
      [...whatAccounts, {
        id: defaultAccounts.whatAccounts.expense,
        value: initialValue,
        description: '',
        notes: ''
      }]
    );
  }

  function handleCloseWhatAccount(index) {
    setWhatAccounts(
      [
        ...whatAccounts.slice(0, index),
        ...whatAccounts.slice(index + 1, whatAccounts.length)
      ]
    );
  }

  function handleWhereTypeChange(type, index) {
    setWhereAccounts(whereAccounts.map((item, i) => {
      if (i !== index) return item;
      const newObj = {
        ...item,
        type,
        id: defaultAccounts.whereAccounts[type]
      };
      if (type === 'AtSight') newObj.bills = null;
      else newObj.bills = [{ date: todayPlus30, value: item.value }];

      return newObj;
    }));
  }

  function handleWhereAccountsIdChange(index, id) {
    setWhereAccounts(whereAccounts.map((item, i) => {
      if (index !== i) return item;
      return { ...item, id };
    }));
  }

  function handleWhereValueChange(strValue, index, type) {
    const value = internacionalization.currencyFormatter(strValue);

    if (type === 'ToPay' || type === 'ToReceive') {
      const newBills = distributeValue(value, whereAccounts[index].bills);
      setWhereAccounts(whereAccounts.map((item, i) => {
        if (i !== index) return item;
        return { ...item, value, bills: newBills };
      }));
    } else {
      setWhereAccounts(whereAccounts.map((item, i) => {
        if (i !== index) return item;
        return { ...item, value };
      }));
    }
  }

  function handleAddWhereAccount() {
    setWhereAccounts(
      [
        ...whereAccounts,
        {
          id: defaultAccounts.whereAccounts.AtSight,
          value: initialValue,
          type: 'AtSight'
        }
      ]
    );
  }

  function handleCloseWhereAccount(index) {
    setWhereAccounts(
      [
        ...whereAccounts.slice(0, index),
        ...whereAccounts.slice(index + 1, whereAccounts.length)
      ]
    );
  }

  function handleInstallmentsChange(index, installments) {
    let newBills = [];
    if (installments > whereAccounts[index].bills.length) { // aumentou parcela
      const date = new Date(whereAccounts[index].bills[installments - 2].date);
      date.setDate(date.getDate() + 30);
      newBills = [...whereAccounts[index].bills, { date, value: initialValue }];
    } else if (installments > 1) newBills = whereAccounts[index].bills.slice(0, installments);
    else newBills = whereAccounts[index].bills.slice(0, 1);
    newBills = distributeValue(whereAccounts[index].value, newBills);
    setWhereAccounts(whereAccounts.map((item, i) => {
      if (i !== index) return item;
      return { ...item, bills: newBills };
    }));
  }

  async function submit() {
    // console.log(defaults);
    // return console.log(whereAccounts);
    if (sumWhatAccounts === 0) return alert('value is 0!');
    if (sumWhatAccounts !== sumWhereAccounts) {
      return alert(
        'The sum of what accounts have to be iqual the sum of where accounts'
      );
    }

    const allBills = [];
    whereAccounts.forEach((whereAccount) => {
      if (whereAccount.bills) {
        whereAccount.bills.forEach((bill, index) => {
          let type = 'ToPay';
          if (whatAccountToSelect.name === 'income') type = 'ToReceive';
          allBills.push({
            type,
            value: helper.toNumber(bill.value),
            dueDate: bill.date,
            emitDate,
            installment: `${index + 1}/${whereAccount.bills.length}`,
            whereAccount: whereAccount.id
          });
        });
      }
    });

    const billsResp = await BillsService.store(allBills);
    let billsIds = [];
    if (Array.isArray(billsResp)) {
      billsIds = billsResp.map(bill => bill._id);
    }

    const allRegs = whatAccounts.map((whatAccount) => {
      const value = helper.toNumber(whatAccount.value);
      const newObj = {
        opType: 'complex',
        emitDate,
        whatAccountId: whatAccount.id,
        value
      };
      if (whatAccount.description) newObj.description = whatAccount.description;
      if (whatAccount.notes) newObj.notes = whatAccount.notes;

      if (whereAccounts.length === 1) {
        newObj.whereAccountId = whereAccounts[0].id;
        newObj.opType = `${whatAccountToSelect.name}${whereAccounts[0].type}`;
      } else {
        const distinctTypes = [...new Set(whereAccounts.map(item => item.type))];
        if (distinctTypes.length === 1) {
          newObj.opType = `${whatAccountToSelect.name}${whereAccounts[0].type}`;
        }
      }
      return newObj;
    });
    if (whereAccounts.length > 1) {
      whereAccounts.forEach((whereAccount) => {
        if (whereAccount.type === 'AtSight') {
          const value = helper.toNumber(whereAccount.value);
          const newObj = {
            opType: `${whatAccountToSelect.name}${whereAccount.type}`,
            emitDate,
            whereAccountId: whereAccount.id,
            value
          };
          const lastWhereAccountBalance = balances.filter(
            item => item.accountId === whereAccount.id
          )[0].balance;

          if (whatAccountToSelect.name === 'expense') {
            const balance = lastWhereAccountBalance - value;
            newObj.whereAccountBalance = balance;
            dispatch(resetBalance({ accountId: whereAccount.id, balance }));
          }
          if (whatAccountToSelect.name === 'income') {
            const balance = lastWhereAccountBalance + value;
            newObj.whereAccountBalance = balance;
            dispatch(resetBalance({ accountId: whereAccount.id, balance }));
          }
          allRegs.push(newObj);
        }
      });
    }


    const regResp = await RegistersService.store(allRegs);

    const operObj = {
      registers: regResp.map(reg => reg._id),
      bills: billsIds,
      emitDate,
    };

    await OperationsService.store(operObj);

    return reSetState();
  }

  return (
    <>
      <div id="divSelectExpenseOrIncome">
        <div>
          Emit date:
          {' '}
          <input
            type="date"
            value={helper.dateToInput(emitDate)}
            onChange={e => setEmitDate(helper.inputDateToNewDate(e.target.value))}
          />
        </div>
        <label htmlFor="selectExpenseOrIncome">
          Expenses or Incomes:
          <select
            id="selectExpenseOrIncome"
            value={whatAccountToSelect.name}
            onChange={e => setAccounts(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      </div>
      <div id="whatAccountsRegisters">
        <div className="titleOfWhatAcRegs">
          <h3>
            {whatAccountToSelect.name === 'expense' ? 'Expenses:' : 'Incomes:'}
          </h3>
        </div>
        {whatAccounts.map((whatAccount, index) => (
          <div key={index} className="whatAccountReg">
            <div className="whatAccountContent">
              <div id={`selectWhatAccount-${index}`} className="selectAccount">
                <div id={`whatAccountSelectorLabel-${index}`}>What Account:</div>
                <Select
                  id={`whatAccountSelector-${index}`}
                  value={whatAccount.id}
                  onChange={id => handleWhatAccountsIdChange(index, id)}
                  options={whatAccountsToSelect.map(account => ({
                    value: account.id,
                    disabled: !account.allowValue,
                    label: account.name
                  }))}
                />
              </div>
              <div className="whatAccountValue">
                <label htmlFor={`whatValue-${index}`}>
                Value:
                  <input
                    type="text"
                    id={`whatValue-${index}`}
                    value={whatAccount.value}
                    onChange={e => handleWhatAccountsValueChange(index, e.target.value)}
                  />
                </label>
              </div>
              <div className="divWhatDescription">
                <label htmlFor={`whatDesc-${index}`}>
                  Description:
                  <input
                    id={`whatDesc-${index}`}
                    type="text"
                    value={whatAccount.description}
                    onChange={e => handleWhatDescChange(e.target.value, index)}
                  />
                </label>
              </div>
              <div className="divWhatNotes">
                <label htmlFor={`whatNotes-${index}`}>
                  Notes:
                  <input
                    id={`whatNotes-${index}`}
                    type="text"
                    value={whatAccount.notes}
                    onChange={e => handleWhatNotesChange(e.target.value, index)}
                  />
                </label>
              </div>
            </div>
            <div className="closeWhatAccount">
              <button className="smallBut" type="button" onClick={() => handleCloseWhatAccount(index)}>
              X
              </button>
            </div>
          </div>
        ))}
        <div id="divAddWhatAccount">
          <button type="button" id="butAddWhatAccount" onClick={handleAddWhatAccount}>
            Add What Account
          </button>
        </div>
        <div id="TotalWhatAccount">
          <span>
            Total:
            {' '}
            { internacionalization.currencyFormatter(sumWhatAccounts) }
          </span>
        </div>
      </div>
      <div id="whereAccountsRegisters">
        <div id="titleWhereAccountsRegisters">
          <h3>How was the payment?</h3>
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
                  onChange={e => handleWhereTypeChange(e.target.value, index)}
                >
                  <option value="AtSight">
                  At Sight
                  </option>
                  <option
                    value={whatAccountToSelect.name === 'expense' ? 'ToPay' : 'ToReceive'}
                  >
                    {whatAccountToSelect.name === 'expense' ? 'To Pay' : 'To Receive'}
                  </option>
                </select>
                <div id={`selectWhereAccount-${index}`} className="selectAccount">
                  <div id={`whereAccountSelectorLabel-${index}`}>Where Account:</div>
                  <Select
                    id={`whatAccountSelector-${index}`}
                    value={whereAccount.id}
                    onChange={id => handleWhereAccountsIdChange(index, id)}
                    options={whereAccountToSelect.map(account => ({
                      value: account.id,
                      disabled: !account.allowValue,
                      label: account.name
                    }))}
                  />
                </div>

                <div className="WhereValueDiv">
                  <input
                    type="text"
                    value={whereAccount.value}
                    onChange={e => handleWhereValueChange(e.target.value, index, whereAccount.type)}
                  />
                </div>
                {whereAccount.bills && (
                  <div className="whereBillsDiv">
                    <div className="divPaymentInstallments">
                      <label htmlFor="paymentInstallments">
                        Installments:
                        {' '}
                        <input type="number" value={whereAccount.bills.length} onChange={e => handleInstallmentsChange(index, e.target.value)} />
                      </label>
                    </div>
                    <div className="installmentsDiv">
                      {whereAccount.bills.map((bill, billI) => (
                        <div key={billI} className="installment">
                          <div className="installmentDate">
                          Date:
                            {' '}
                            <input
                              type="date"
                              value={helper.dateToInput(bill.date)}
                              onChange={e => editBillDate(
                                index,
                                billI,
                                helper.inputDateToNewDate(e.target.value)
                              )}
                            />
                          </div>
                          <div className="installmentValue">
                          Value:
                            {' '}
                            <input
                              type="text"
                              value={bill.value}
                              onChange={e => editBillValue(index, billI, e.target.value)}
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
            Add Payment
          </button>
        </div>
        <div id="TotalWhereAccount">
          <span>
            Total:
            {' '}
            { internacionalization.currencyFormatter(sumWhereAccounts) }
            {
              sumWhatAccounts === sumWhereAccounts
                ? <img src={ImgChecked} width="20px" alt="checked" className="ifCheckedImg" />
                : (
                  <span>
                    <img src={ImgX} width="20px" alt="not checked" className="ifCheckedImg" />
                    Diff:
                    {sumWhatAccounts - sumWhereAccounts}
                  </span>
                )
            }
          </span>
        </div>
      </div>
      <div id="divButRegister">
        <button type="button" className="btn btn-primary" onClick={submit}>Register</button>
      </div>
    </>
  );
}
