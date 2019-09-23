import React, { useState, useEffect, useRef } from 'react';

import Option from './Option';

import './Select.css';
import arrows from './arrows.svg';

const defaultStyle = {
  backgroundColor: '#FFF',
  width: '150px',
  height: '30px',
  cursor: 'default',
  fontSize: '12px'
};
const defaultSelectedFieldStyle = {
  display: 'grid',
  gridTemplateColumns: '90% 10%',
  height: '100%',
};
const defaultOptContainerStyle = {
  zIndex: 9,
  position: 'absolute',
  marginTop: '-40px',
  marginLeft: '10px',
  padding: '5px',
  border: '1px solid white',
  borderRadius: '5px',
  backgroundColor: 'white'
};
const defaultOptStyle = {
  backgroundColor: '#FFF',
  height: '30px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingRight: '5px',
  paddingLeft: '5px',
};
const defautOptDisabledStyle = {
  backgroundColor: 'rgba(0,0,250,0.95)',
  fontWeight: 200
};
const defaultMouseEnterOptionStyle = {
  backgroundColor: 'rgba(180,180,230,0.95)',
  color: '#FFF'
};
const defaultMouseLeaveOptionStyle = {
  backgroundColor: '#FFF',
  color: '#000'
};

export default function Select(props) {
  const {
    options = [],
    value = 0,
    onChange,
    id
  } = props;
  let {
    style = defaultStyle,
    selectedFieldStyle = defaultSelectedFieldStyle,
    optionStyle = defaultOptStyle,
    optionDisabledStyle = defautOptDisabledStyle,
    optionsContainerStyle = defaultOptContainerStyle,
    mouseEnterOptionStyle = defaultMouseEnterOptionStyle,
    mouseLeaveOptionStyle = defaultMouseLeaveOptionStyle
  } = props;

  style = { ...defaultStyle, ...style };
  selectedFieldStyle = { ...defaultSelectedFieldStyle, ...selectedFieldStyle };
  optionStyle = { ...defaultOptStyle, ...optionStyle };
  optionDisabledStyle = { ...defautOptDisabledStyle, ...optionDisabledStyle };
  optionsContainerStyle = { ...defaultOptContainerStyle, ...optionsContainerStyle };
  mouseEnterOptionStyle = { ...defaultMouseEnterOptionStyle, ...mouseEnterOptionStyle };
  mouseLeaveOptionStyle = { ...defaultMouseLeaveOptionStyle, ...mouseLeaveOptionStyle };

  const arrowsStyle = {
    height: `${style.height.split('p')[0] * 0.5}px`,
  };

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [boolOptionOpened, setboolOptionOpened] = useState(false);

  const ref = useRef(null);

  function handleClickOutside(e) {
    if (!ref.current.contains(e.target)) {
      setboolOptionOpened(false);
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    setSelectedIndex(options.findIndex(item => item.value === value) > 0
      ? options.findIndex(item => item.value === value)
      : 0);
  }, [value, options]);

  function handleOptionClick(optionIndex) {
    setSelectedIndex(optionIndex);
    setboolOptionOpened(false);
    onChange(options[optionIndex].value);
  }
  if (options.length === 0) options.push({ label: '', value: 0 });

  return (
    <div
      id={id}
      ref={ref}
      style={style}
    >
      <div
        className="selectedField"
        onClick={() => setboolOptionOpened(!boolOptionOpened)}
        style={selectedFieldStyle}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span>{options[selectedIndex].label}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={arrows} alt="arrows" style={arrowsStyle} />
        </div>
      </div>
      {boolOptionOpened && (
        <div style={optionsContainerStyle}>
          {options.map((option, index) => (
            <Option
              key={index}
              disabled={option.disabled}
              onClick={handleOptionClick}
              style={!option.disabled
                ? optionStyle
                : { ...optionStyle, ...optionDisabledStyle }
              }
              mouseEnterStyle={mouseEnterOptionStyle}
              mouseLeaveStyle={mouseLeaveOptionStyle}
              label={option.label}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
