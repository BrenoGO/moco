import React, { useState } from 'react';

import { UsersService } from '../../services/UsersService';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function changePass() {
    if (newPassword !== confirmPassword) return alert('password is different from confirm password');

    await UsersService.change({ newPassword });
    setNewPassword('');
    return setConfirmPassword('');
  }

  return (
    <div className="flex-column">
      <div className="setItemHeader">
        <h3>Change Password:</h3>
      </div>
      <div className="setContent">
        <label htmlFor="newPass">
          New Password:
          <input type="password" id="newPass" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </label>
        <label htmlFor="confirmPass">
          Confirm New Password:
          <input type="password" id="confirmPass" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </label>
        {newPassword && confirmPassword && (
          <div className="setButton">
            <button type="button" className="btn btn-warning" onClick={changePass}>
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
