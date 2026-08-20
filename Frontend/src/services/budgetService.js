import { governmentApi } from './governmentApi';
import { civicKPIs, departmentBudgets, detailedBudgets, monthlySpendingData } from '../data/mockData';

export const budgetService = {
  async getOverviewKPIs() {
    const apiRes = await governmentApi.getDashboardSummary();
    if (apiRes) {
      return {
        totalBudget: apiRes.total_allocated || civicKPIs.totalBudget,
        spentAmount: apiRes.total_spent || civicKPIs.spentAmount,
        moneyRemaining: apiRes.money_remaining || "₹4,450 Cr",
        budgetUsed: apiRes.utilization_percentage || "69%",
        isLiveAPI: true
      };
    }
    return {
      totalBudget: "₹14,290 Cr",
      spentAmount: "₹9,840 Cr",
      moneyRemaining: "₹4,450 Cr",
      budgetUsed: "69%",
      isLiveAPI: false
    };
  },

  async getDepartmentList() {
    const apiRes = await governmentApi.getDepartments();
    if (apiRes && Array.isArray(apiRes) && apiRes.length > 0) {
      return apiRes.map(dept => ({
        name: dept.name,
        allocated: dept.allocated_budget || dept.allocated,
        spent: dept.spent_amount || dept.spent,
        color: dept.color || '#3b82f6',
        code: dept.code || dept.name.substring(0, 3).toUpperCase()
      }));
    }
    return departmentBudgets;
  },

  getMonthlyTrends() {
    return monthlySpendingData;
  },

  getLineItemBudgets() {
    return detailedBudgets;
  }
};
