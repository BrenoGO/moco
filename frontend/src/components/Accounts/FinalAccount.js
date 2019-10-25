import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from '../Modal';

import { AccMsgs } from '../../services/Messages';
import { AccountsService } from '../../services/AccountsService';

import { deleteAccounts, updateAccount } from '../../actions/AccountsActions';

export default function FinalAccount(props) {
  const { locale } = useSelector(state => state.DefaultsReducer);
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
          buttonMessage={AccMsgs[locale].butMsgWarningDeleteAc}
          type="confirm-danger"
          close={() => setBoolWarning(false)}
          title={AccMsgs[locale].titleWarningDeleteAc}
          confirmFunction={deleteAccount}
        >
          {`${AccMsgs[locale].initWarningDeleteAc}${account.name}${AccMsgs[locale].endWarningDeleteFiAc}`}
        </Modal>
      );
    }
    return '';
  }

  if (editing) {
    return (
      <div id={account.id} className="inAction">
        {warning()}
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
    );
  }
  return (
    <div id={account.id} className="account">
      {warning()}
      <div className="accountName">
        <span className="spanName">{account.name}</span>
      </div>
      <div className="actions">
        <button type="button" className="btn smallBut btn-primary" onClick={() => setEditing(!editing)}>
          {!editing
            ? AccMsgs[locale].edit
            : AccMsgs[locale].cancel
          }
        </button>
        <button type="button" className="btn smallBut btn-danger" onClick={() => setBoolWarning(true)}>
          {AccMsgs[locale].delete}
        </button>
      </div>
    </div>
  );
}
