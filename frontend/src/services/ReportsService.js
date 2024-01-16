import { ApiService } from './ApiService';

const endpoint = 'reports';

export const ReportsService = {
  incomeOrExpense: (data) => ApiService.post(`${endpoint}/incomeOrExpense`, data),
  cashFlow: ({ initDate, endDate }) => {
    return ApiService.get(`${endpoint}/cashFlow?initDate=${initDate}&endDate=${endDate}`)
  },
};
