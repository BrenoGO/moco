import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { message } from 'antd';

import { SettingsMsgs } from '../../services/Messages';
import { SettingsService } from '../../services/SettingsService';
import { updateDefault } from '../../actions/DefaultsActions';

export default function MaxInstallments() {
  const { locale, maxInstallments = 12 } = useSelector((state) => state.DefaultsReducer);
  const [chosenMax, setChosenMax] = useState(maxInstallments || 12);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  async function saveMaxInstallments() {
    setSaving(true);
    try {
      const setting = await SettingsService.update('maxInstallments', { data: chosenMax });
      dispatch(updateDefault('maxInstallments', setting.data.maxInstallments));
    } catch (error) {
      message.error(SettingsMsgs[locale].saveSettingsError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-column">
      <h3>
        <label htmlFor="maxInstallments">{SettingsMsgs[locale].maxInstallments}</label>
      </h3>
      <div>
        <select
          id="maxInstallments"
          value={chosenMax}
          disabled={saving}
          onChange={(event) => setChosenMax(Number(event.target.value))}
        >
          {[6, 12, 24, 36, 48, 60].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        {chosenMax !== (maxInstallments || 12) && (
          <div>
            <button
              type="button"
              className="but-primary-neutral"
              disabled={saving}
              onClick={saveMaxInstallments}
            >
              {SettingsMsgs[locale].saveChanges}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
