import React, { useState } from 'react';

export default function Option(props) {
  const [styleEvent, setStyleEvent] = useState({});
  const {
    label,
    disabled = false,
    onClick,
    index,
    style,
    mouseEnterStyle,
    mouseLeaveStyle
  } = props;

  if (disabled) {
    return (
      <div style={style}>{label}</div>
    );
  }
  return (
    <div
      onClick={() => (!disabled && onClick(index))}
      style={{ ...style, ...styleEvent }}
      onMouseEnter={() => setStyleEvent(mouseEnterStyle)}
      onMouseLeave={() => setStyleEvent(mouseLeaveStyle)}
    >
      {label}
    </div>
  );
}
