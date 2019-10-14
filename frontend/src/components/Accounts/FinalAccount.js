import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import Modal from '../Modal';

import { AccountsService } from '../../services/AccountsService';

import { deleteAccounts, updateAccount } from '../../actions/AccountsActions';

export default function FinalAccount(props) {
  const { account } = props;
  const [boolWarning, setBoolWarning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const dispatch = useDispatch();

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

  function warning() {
    if (boolWarning) {
      return (
        <Modal
          buttonMessage="Delete"
          type="confirm-danger"
          close={() => setBoolWarning(false)}
          title="Are You Sure?"
          confirmFunction={deleteAccount}
        >
          {`Are you sure you want to delete the
        ${account.name}
        account?`}
        </Modal>
      );
    }
    return '';
  }

  if (editing) {
    return (
      <div className="inAction">
        {warning()}
        <label htmlFor={`editing-${account.id}`} className="addingLabel">
            Editing:
          <input type="text" id={`editing-${account.id}`} value={newName} onChange={e => setNewName(e.target.value)} />
        </label>
        <button type="button" className="btn smallBut btn-danger" onClick={() => setEditing(!editing)}>Cancel</button>
        <button type="button" className="btn smallBut btn-primary" onClick={edit}>Edit</button>
      </div>
    );
  }
  return (
    <div className="account">
      {warning()}
      <div className="accountName">
        <span className="spanName">{account.name}</span>
      </div>
      <div className="actions">
        <button type="button" className="btn smallBut btn-primary" onClick={() => setEditing(!editing)}>{!editing ? 'Edit' : 'cancel'}</button>
        <button type="button" className="btn smallBut btn-danger" onClick={() => setBoolWarning(true)}>Delete</button>
      </div>
    </div>
  );
}
