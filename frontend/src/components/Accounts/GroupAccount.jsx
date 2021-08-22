import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './GroupAccount.css';

import { AccountsService } from '../../services/AccountsService';
import { RegistersService } from '../../services/RegistersService';
import { SettingsService } from '../../services/SettingsService';
import { AccMsgs } from '../../services/Messages';
import helper from '../../services/helper';

import { addAccount, deleteAccounts, updateAccount } from '../../actions/AccountsActions';
import { updateDefault } from '../../actions/DefaultsActions';

import FinalAccount from './FinalAccount';
import Modal from '../Modal';

export default function GroupAccount(props) {
  const { account } = props;

  const accounts = useSelector(state => state.AccountsReducer.accounts);
  const { locale, defaultAccounts, balances } = useSelector(state => state.DefaultsReducer);
  const defaultInitialValue = locale !== 'pt-BR' ? 'Initial: $ 0.00' : 'Initial: R$ 0,00';

  const [opened, setOpened] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [addForm, setAddForm] = useState({
    name: '',
    allowValue: false
  });
  const [boolWarning, setBoolWarning] = useState(false);
  const [initialValue, setInitialValue] = useState(defaultInitialValue);

  const dispatch = useDispatch();

  const childrenAc = helper.getChildren(accounts, account.id);

  async function addChild() {
    const id = accounts.reduce((ac, atual) => (atual.id > ac.id ? atual : ac)).id + 1;
    const newAccount = await AccountsService.store(
      { ...addForm, parents: [...account.parents, account.id], id }
    );
    if (newAccount[0].parents.includes(3)) {
      const value = helper.toNumber(initialValue);
      await RegistersService.store({
        opType: 'incomeAtSight',
        whereAccountId: newAccount[0].id,
        whereAccountBalance: value,
        description: 'Initial Balance',
        value
      });
    }

    dispatch(addAccount(newAccount[0]));
    setAddForm({ name: '', allowValue: false });
    setAdding(false);
  }

  async function deleteAccount() {
    const deletedIds = await AccountsService.delete(account.id);
    if (deletedIds.ok) {
      setBoolWarning(false);
      deletedIds.ok.forEach(async (id) => {
        const acc = accounts.find(item => item.id === id);
        if (acc.parents.includes(defaultAccounts.currentAccounts) && acc.allowValue) {
          // is a final current account
          const newBalances = balances.filter(item => item.accountId !== account.id);
          dispatch(updateDefault('balances', newBalances));
        }
        const newDeAccs = JSON.parse(JSON.stringify(defaultAccounts));
        let boolChanged = false;
        for (const key in newDeAccs) {
          if (newDeAccs[key] === id) {
            newDeAccs[key] = null;
            boolChanged = true;
          }
          if (typeof (newDeAccs[key]) === 'object') {
            for (const k2 in newDeAccs[key]) {
              if (newDeAccs[key][k2] === id) {
                newDeAccs[key][k2] = null;
                boolChanged = true;
              }
            }
          }
        }
        if (boolChanged) {
          console.log(newDeAccs);
          dispatch(updateDefault('defaultAccounts', newDeAccs));
          await SettingsService.update('defaultAccounts', { data: newDeAccs });
        }
      });
      dispatch(deleteAccounts(deletedIds.ok));
    }
  }

  function edit() {
    AccountsService.update(account.id, { name: newName });
    dispatch(updateAccount(account.id, newName));
    setEditing(false);
  }

  return (
    <>
      {boolWarning && (
        <Modal
          buttonMessage={AccMsgs[locale].butMsgWarningDeleteAc}
          type="confirm-danger"
          close={() => setBoolWarning(false)}
          title={AccMsgs[locale].titleWarningDeleteAc}
          confirmFunction={deleteAccount}
        >
          {`${AccMsgs[locale].initWarningDeleteAc}${account.name}${AccMsgs[locale].endWarningDeleteAc}`}
        </Modal>
      )}
      { editing
        ? (
          <div id={account.id} className={`inAction ${account.parents.length === 0 ? 'rootAccount' : 'groupAccount'}`}>
            <label htmlFor={`editing-${account.id}`} className="addingLabel">
              {AccMsgs[locale].editing}
              <input type="text" id={`editing-${account.id}`} value={newName} onChange={e => setNewName(e.target.value)} />
            </label>
            <button type="button" className="btn smallBut btn-danger" onClick={() => setEditing(!editing)}>
              {AccMsgs[locale].cancel}
            </button>
            <button type="button" className="btn smallBut btn-primary" onClick={edit}>
              {AccMsgs[locale].edit}
            </button>
          </div>
        )
        : (
          <div id={account.id} className={`account ${account.parents.length === 0 ? 'rootAccount' : 'groupAccount'}`}>
            <div className="accountName">
              <span className="spanGroupName">{account.name}</span>
            </div>
            <div className="actions">
              <button type="button" className={`btn smallBut ${adding ? 'btn-danger' : 'groupAcBtn'}`} onClick={() => setAdding(!adding)}>
                {!adding
                  ? AccMsgs[locale].add
                  : AccMsgs[locale].cancel
                }
              </button>
              {!adding
                && (
                <button type="button" className="btn smallBut groupAcBtn" onClick={() => setEditing(!editing)}>
                  {!editing
                    ? AccMsgs[locale].edit
                    : AccMsgs[locale].cancel
                  }
                </button>
                )
              }

              {account.parents.length > 0 && !adding && (
                <button
                  type="button"
                  className="btn smallBut btn-danger"
                  onClick={() => setBoolWarning(true)}
                >
                  {AccMsgs[locale].delete}
                </button>
              )}
            </div>
            <div className="thirdDiv">
              {
                !adding && childrenAc.length > 0 ? (
                  <button type="button" onClick={() => setOpened(!opened)} className="btn openAccount smallBut">
                    { opened ? '-' : '+' }
                  </button>
                )
                  : <span> </span>
              }
            </div>
          </div>
        )
        }
      {adding && (
        <div className="inAction">
          <div className="inputingField">
            <label htmlFor={`addingName${account.id}`} className="addingLabel">
              {AccMsgs[locale].adding}
              <input
                id={`addingName${account.id}`}
                type="text"
                placeholder={AccMsgs[locale].name}
                name="name"
                value={addForm.name}
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
              />
            </label>
          </div>
          <div className="acceptAndBut">
            <label className="addingLabel" htmlFor={`allowValue${account.id}`}>
              <input
                type="checkbox"
                id={`allowValue${account.id}`}
                checked={addForm.allowValue}
                onChange={() => setAddForm({ ...addForm, allowValue: !addForm.allowValue })}
              />
              {AccMsgs[locale].acceptVal}
            </label>
            {addForm.allowValue && (account.id === 3 || account.parents.includes(3)) && (
              <input
                type="text"
                value={initialValue}
                onChange={
                  e => setInitialValue(helper.currencyFormatter(locale, e.target.value))
                }
              />
            )}
            <button type="button" className="btn smallBut btn-primary" onClick={addChild}>
              {AccMsgs[locale].addA}
            </button>
          </div>
        </div>
      )}
      {opened && (
        childrenAc.map((childAccount) => {
          if (childAccount.allowValue) {
            return <FinalAccount key={childAccount._id} account={childAccount} />;
          }
          return (
            <GroupAccount
              key={childAccount._id}
              account={childAccount}
            />
          );
        })
      )}
    </>
  );
}
