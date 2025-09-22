import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RepMsgs } from '../../services/Messages';
import helper from '../../services/helper';
import { ReportsService } from '../../services/ReportsService';

import Spinner from '../Spinner';
// import GeneralsAccs from './GeneralsAccs';
import { Table } from 'antd';

import './General.css';

export default function General() {
  const initialDate = new Date();
  initialDate.setDate(initialDate.getDate() - 30);

  const { locale, defaultAccounts } = useSelector(state => state.DefaultsReducer);
  const { accounts } = useSelector(state => state.AccountsReducer);

  console.log('accounts', accounts);
  const [initDate, setInitDate] = useState(initialDate);
  const [finalDate, setFinalDate] = useState(new Date());
  // const [incomeAcs, setIncomeAcs] = useState([defaultAccounts.income]);
  // const [expenseAcs, setExpenseAcs] = useState([defaultAccounts.expense]);

  const [registers, setRegisters] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let mounted = true;
    ReportsService.general({
      initDate,
      endDate: finalDate
    })
      .then((resp) => {
        setLoading(false);
        if (mounted) setRegisters(resp);
      });
    return () => { mounted = false; };
  }, [initDate, finalDate]);

  console.log('registers', registers);

  const allIncomes = accounts.filter(item => item.parents.includes(defaultAccounts.income))
    .map(item => item.id);
  const incomes = registers.filter(item => allIncomes.includes(item.whatAccountId));
  let totalIncomes = 0;
  if (incomes.length > 0) {
    totalIncomes = incomes.reduce((acc, curr) => acc + curr.value, 0);
  }

  const allExpenses = accounts.filter(item => item.parents.includes(defaultAccounts.expense))
    .map(item => item.id);
  const expenses = registers.filter(item => allExpenses.includes(item.whatAccountId));
  let totalExpenses = 0;
  if (expenses.length > 0) {
    totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);
  }

  function handleDateChange(when, date) {
    switch (when) {
      case 'init':
        setInitDate(helper.inputDateToNewDate(date));
        break;
      case 'final':
        setFinalDate(helper.inputDateToNewDate(date));
        break;
      default:
        break;
    }
  }

  const { columns, dataSource } = useMemo(() => {
    const allColumns = registers.reduce((acc, curr) => {
      const isToPay = curr.opType.endsWith('ToPay');
      if (isToPay) {
        return acc;
      }
      if (!acc.includes(curr.whereAccountId)) {
        return [
          curr.whereAccountId,
          ...acc,
        ]
      }
      return acc;
    }, ['to_pay']);
    allColumns.push('total');

    console.log('allColumns:', allColumns);
    
    // array of objects. each element is an row
    const matrix = registers.reduce((acc, curr) => {
      const isToPay = curr.opType.endsWith('ToPay');
      if (!acc.find(item => item.whatAccountId === curr.whatAccountId)) {
        // no expense/income yet

        const columns = {
          ...allColumns.reduce((a, c) => ({ ...a, [c]: 0 }), {}),
          [isToPay ? 'to_pay' : curr.whereAccountId]: curr.value,
          total: curr.value,
        }
        const isIncome = curr.opType.startsWith('income');
        if (isIncome) {
          // put up
          return [
            {
              whatAccountId: curr.whatAccountId,
              columns,
            },
            ...acc,
          ]
        }
        return [...acc, {
          whatAccountId: curr.whatAccountId,
          columns,
        }]
      }
      
      const index = acc.findIndex(item => item.whatAccountId === curr.whatAccountId);
      const column = isToPay ? 'to_pay' : curr.whereAccountId;
      return [
        ...acc.slice(0, index),
        {
          ...acc[index],
          columns: {
            ...acc[index].columns,
            [column]: (acc[index].columns[column] || 0) + curr.value,
            total: (acc[index].columns.total) + curr.value,
          }
        },
        ...acc.slice(index + 1)
      ];
    }, [])

    console.log('matrix:', matrix);

    const columns = allColumns.map(col => ({
      title: col === 'to_pay' ? 'Prazo' : col === 'total' ? 'Total' : accounts.find(ac => ac.id === col)?.name || 'N/A',
      dataIndex: col,
      key: col,
      render: (value) => {
        if (col === 'total') {
          return <b>{helper.currencyFormatter(locale, value || 0)}</b>
        }
        return helper.currencyFormatter(locale, value || 0);
      },
      align: 'right',
    }));

    columns.unshift({
      title: 'Entrada/Saída',
      dataIndex: 'key',
      rowScope: 'row',
      render: (value) => accounts.find(ac => ac.id === value)?.name || 'N/A'
    })

    const dataSource = matrix.map(item => ({
      key: item.whatAccountId,
      account: accounts.find(ac => ac.id === item.whatAccountId)?.name || 'N/A',
      ...item.columns
    }))

    return { columns, dataSource };
  }, [registers, accounts, locale]);

  console.log('columns:', columns);
  console.log('dataSource:', dataSource);
  return (
    <div>
      <div><h2>Geral</h2></div>
      {loading && <Spinner />}
      <div id="form">
        {/* <GeneralsAccs type="groupAG" title="Incomes" acId={defaultAccounts.income} /> */}
        {/* <GeneralsAccs type="groupAG" title="Expenses" acId={defaultAccounts.expense} /> */}
        <div>
          {RepMsgs[locale].initial}
          <input
            type="date"
            value={helper.dateToInput(initDate)}
            onChange={e => handleDateChange('init', e.target.value)}
          />
        </div>
        <div>
          {RepMsgs[locale].final}
          <input
            type="date"
            value={helper.dateToInput(finalDate)}
            onChange={e => handleDateChange('final', e.target.value)}
          />
        </div>
      </div>
      <div id="content" className='mt-3'>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content' }}
          />
        <p>
          Total de entradas:
          {' '}
          {helper.currencyFormatter(locale, totalIncomes)}
        </p>
        <p>
          Total de saídas:
          {' '}
          {helper.currencyFormatter(locale, totalExpenses)}
        </p>
        <p>
          Lucro:
          {' '}
          {helper.currencyFormatter(locale, (totalIncomes + totalExpenses))}
        </p>
      </div>
    </div>
  );
}
