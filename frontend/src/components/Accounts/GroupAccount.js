import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './GroupAccount.css';

import { AccountsService } from '../../services/AccountsService';
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

  const accounts = useSelector(state => state.AccountsReducer.accounts);

  const dispatch = useDispatch();

  const childrenAc = accounts.filter(
    ac => ac.parents[ac.parents.length - 1] === account.id
  );

  async function addChild() {
    const id = accounts.reduce((ac, atual) => (atual.id > ac.id ? atual : ac)).id + 1;
    const newAccount = await AccountsService.store(
      { ...addForm, parents: [...account.parents, account.id], id }
    );
    dispatch(addAccount(newAccount[0]));
    setAddForm({ name: '', allowValue: false });
    setAdding(false);
  }
  async function deleteAccount() {
    const deletedIds = await AccountsService.delete(account.id);
    console.log(deletedIds);
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
      <div className={`account ${account.parents.length === 0 ? 'rootAccount' : 'groupAccount'}`}>
        <div className="accountName">
          {
            editing
              ? (
                <div className="divEdit">
                  <label htmlFor="newName">
                    Editing:
                    <input type="text" syze="10" id="newName" value={newName} onChange={e => setNewName(e.target.value)} />
                  </label>
                  <button type="button" className="smallBut" onClick={edit}>Edit</button>
                </div>
              )
              : <span className="spanName">{account.name}</span>
          }
        </div>
        <div className="actions">
          <button type="button" className="smallBut" onClick={() => setAdding(!adding)}>{!adding ? 'Add' : 'cancel'}</button>
          <button type="button" className="smallBut" onClick={() => setEditing(!editing)}>{!editing ? 'Edit' : 'cancel'}</button>
          {account.parents.length > 0 && (
            <button
              type="button"
              className="smallBut"
              onClick={() => setBoolWarning(true)}
            >
              Delete
            </button>
          )}
        </div>
        <div className="thirdDiv">
          {
            childrenAc.length > 0 ? (
              <button type="button" onClick={() => setOpened(!opened)} className="openAccount smallBut">
                { opened ? '-' : '+' }
              </button>
            )
              : <span> </span>
          }
        </div>
      </div>
      {adding && (
        <div className="account">
          <div className="accountHeader">
            <span className="accountName">Adding: </span>
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={addForm.name}
              onChange={e => setAddForm({ ...addForm, name: e.target.value })}
            />
            <label htmlFor="allowValue">
              <input
                type="checkbox"
                id="allowValue"
                checked={addForm.allowValue}
                onChange={() => setAddForm({ ...addForm, allowValue: !addForm.allowValue })}
              />
              Accept Value
            </label>
            <button type="button" onClick={addChild}>Add!</button>
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
