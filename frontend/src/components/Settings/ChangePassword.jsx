import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { UsersService } from '../../services/UsersService';
import { SettingsMsgs } from '../../services/Messages';

export default function ChangePassword() {
  const { locale } = useSelector((state) => state.DefaultsReducer);
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
        <h3>
          {SettingsMsgs[locale].changePW}
        </h3>
      </div>
      <div className="setContent flex-column">
        <label htmlFor="newPass">
          {SettingsMsgs[locale].newPW}
          <input type="password" id="newPass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        <label htmlFor="confirmPass">
          {SettingsMsgs[locale].confirmNewPW}
          <input type="password" id="confirmPass" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        {newPassword && confirmPassword && (
          <div className="setButton">
            <button type="button" className="btn btn-warning" onClick={changePass}>
              {SettingsMsgs[locale].saveChanges}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
