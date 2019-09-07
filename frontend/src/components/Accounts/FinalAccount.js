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
          account?`}
        </Modal>
      )}
      <div className="account">
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
          <button type="button" className="smallBut" onClick={() => setEditing(!editing)}>Edit</button>
          <button type="button" className="smallBut" onClick={() => setBoolWarning(true)}>Delete</button>
        </div>
      </div>
    </>
  );
}
