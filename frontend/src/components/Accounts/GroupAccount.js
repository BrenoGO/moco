import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './GroupAccount.css';

import { AccountsService } from '../../services/AccountsService';
import { RegistersService } from '../../services/RegistersService';
import helper from '../../services/helper';
import internacionalization from '../../services/Internacionalization';

import { addAccount, deleteAccounts, updateAccount } from '../../actions/AccountsActions';

import FinalAccount from './FinalAccount';
import Modal from '../Modal';

export default function GroupAccount(props) {
  const { account } = props;

  const [opened, setOpened] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [addForm, setAddForm] = useState({
    name: '',
    allowValue: false
  });
  const [boolWarning, setBoolWarning] = useState(false);
  const [initialValue, setInitialValue] = useState(internacionalization.getInitials() !== 'pt-BR' ? 'Initial: $ 0.00' : 'Initial: R$ 0,00');

  const accounts = useSelector(state => state.AccountsReducer.accounts);

  const dispatch = useDispatch();

  const childrenAc = accounts.filter(
    ac => ac.parents[ac.parents.length - 1] === account.id
  ).sort((a, b) => {
    if (b.allowValue) return 1;
    return b.id - a.id;
  });

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
    setBoolWarning(false);
    dispatch(deleteAccounts(deletedIds.ok.map(item => item.id)));
  }

  function edit() {
    AccountsService.update(account.id, { ...account, name: newName });
    dispatch(updateAccount(account.id, newName));
    setEditing(false);
  }

  return (
    <>
      {boolWarning && (
        <Modal
          buttonMessage="Delete"
          type="confirm-danger"
          close={() => setBoolWarning(false)}
          title="Are You Sure?"
          confirmFunction={deleteAccount}
        >
          {`Are you sure you want to delete the
            ${account.name}
            account and all its children?`}
        </Modal>
      )}
      { editing
        ? (
          <div className={`inAction ${account.parents.length === 0 ? 'rootAccount' : 'groupAccount'}`}>
            <label htmlFor={`editing-${account.id}`} className="addingLabel">
                  Editing:
              <input type="text" id={`editing-${account.id}`} value={newName} onChange={e => setNewName(e.target.value)} />
            </label>
            <button type="button" className="btn smallBut btn-danger" onClick={() => setEditing(!editing)}>Cancel</button>
            <button type="button" className="btn smallBut btn-primary" onClick={edit}>Edit</button>
          </div>
        )
        : (
          <div className={`account ${account.parents.length === 0 ? 'rootAccount' : 'groupAccount'}`}>
            <div className="accountName">
              <span className="spanGroupName">{account.name}</span>
            </div>
            <div className="actions">
              <button type="button" className={`btn smallBut ${adding ? 'btn-danger' : 'groupAcBtn'}`} onClick={() => setAdding(!adding)}>{!adding ? 'Add' : 'cancel'}</button>
              {!adding
                && <button type="button" className="btn smallBut groupAcBtn" onClick={() => setEditing(!editing)}>{!editing ? 'Edit' : 'cancel'}</button>
              }

              {account.parents.length > 0 && !adding && (
                <button
                  type="button"
                  className="btn smallBut btn-danger"
                  onClick={() => setBoolWarning(true)}
                >
                  Delete
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
              Adding:
              <input
                id={`addingName${account.id}`}
                type="text"
                placeholder="Name"
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
              Accept Value
            </label>
            {addForm.allowValue && (account.id === 3 || account.parents.includes(3)) && (
              <input
                type="text"
                placeholder="initial value"
                value={initialValue}
                onChange={
                  e => setInitialValue(internacionalization.currencyFormatter(e.target.value))
                }
              />
            )}
            <button type="button" className="btn smallBut btn-primary" onClick={addChild}>Add!</button>
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
