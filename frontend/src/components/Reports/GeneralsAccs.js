import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import helper from '../../services/helper';

export default function GeneralsAccs(props) {
  const accounts = useSelector(state => state.AccountsReducer.accounts);

  const { type, title, acId } = props;
  const [opened, setOpened] = useState(false);

  function showDownAccs() {
    const children = helper.getChildren(accounts, acId);

    return (
      children.map(ac => (
        <GeneralsAccs
          title={ac.name}
          type={ac.allowValue ? 'finalAG' : 'groupAG'}
          acId={ac.id}
        />
      ))
    );
  }

  return (
    <>
      <div className={`AcSelect ${type}`}>
        {title}
        <input type="checkbox" checked readOnly />
        {type === 'groupAG' && (
          <button type="button" onClick={() => setOpened(!opened)} className="btn openAccount smallBut">
            { opened ? '-' : '+' }
          </button>
        )}
      </div>
      {opened && showDownAccs()}
    </>
  );
}
