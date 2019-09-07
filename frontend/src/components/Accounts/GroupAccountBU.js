import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import FinalAccount from './FinalAccount';

export default function GroupAccount(props) {
  const { account } = props;

  const [opened, setOpened] = useState(false);

  const accounts = useSelector(state => state.AccountReducer.accounts);

  const childrenAc = accounts.filter(
    ac => ac.parent === account._id
  );

  console.log('in group account:', childrenAc);
  const group = !account.allowValue && childrenAc.length > 0;
  return (
    <>
      <div className="account GroupAccount">
        <div className="accountHeader">
          <span className="accountName">{account.name}</span>
          {
            group
              ? (
                <button type="button" onClick={() => setOpened(!opened)} className="openAccount">
                  { opened ? '-' : '+' }
                </button>
              )
              : <span> </span>
          }
        </div>
      </div>
      {opened && (
        childrenAc.map((childAccount) => {
          if (childAccount.children.length === 0) {
            return <FinalAccount account={childAccount} />;
          }
          return <GroupAccount key={childAccount._id} account={childAccount} />;
        })
      )}
    </>
  );
}
