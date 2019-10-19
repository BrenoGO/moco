import React from 'react';
import { useDispatch } from 'react-redux';

import './Flags.css';

import auth from '../services/Auth';
import { SettingsService } from '../services/SettingsService';

import { updateDefault } from '../actions/DefaultsActions';

import brazilFlag from '../imgs/brazil.svg';
import usFlag from '../imgs/united-states.svg';


export default function Flags() {
  const dispatch = useDispatch();
  async function setLocale(locale) {
    dispatch(updateDefault('locale', locale));
    if (auth.isAuth()) {
      await SettingsService.update('locale', { data: locale });
    }
  }
  return (
    <div id="flags">
      <img
        src={brazilFlag}
        className="flagImg"
        alt="brazilFlag"
        onClick={() => { setLocale('pt-BR'); }}
      />
      <img
        src={usFlag}
        className="flagImg"
        alt="usFlag"
        onClick={() => { setLocale('en-US'); }}
      />
    </div>
  );
}
