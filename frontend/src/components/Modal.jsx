import React from 'react';

import './Modal.css';

export default function Modal(props) {
  const {
    children: message, buttonMessage, close, title, type, confirmFunction
  } = props;

  return (
    <>
      <div id="backDrop" />
      <div id={`${type === 'error' ? 'error' : ''}Modal`}>
        <div id="headerModal">
          <h2>{title}</h2>
          <button type="button" id="closeModalBut" onClick={close}>X</button>
        </div>
        <div id="Body">
          <p>{message}</p>
          <button
            type="button"
            className={
              `but-primary-${
                type === 'error' || type === 'danger' || type === 'confirm-danger'
                  ? 'danger'
                  : 'normal'
              }`
            }
            onClick={confirmFunction || close}
          >
            { buttonMessage }
          </button>
        </div>
      </div>
    </>
  );
}
