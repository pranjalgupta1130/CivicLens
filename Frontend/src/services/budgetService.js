import { governmentApi } from './governmentApi';
import { civicKPIs, departmentBudgets, detailedBudgets, monthlySpendingData } from '../data/mockData';

export const budgetService = {
  async getOverviewKPIs() {
    const apiRes = await governmentApi.getDashboardSummary();
    if (apiRes) {
      const allocated = apiRes.total_budget_amount || apiRes.total_allocated;
      const spent = apiRes.total_actual_amount || apiRes.total_spent;
      const remaining = (allocated && spent) ? (allocated - spent) : null;
      const utilRate = (allocated && spent && allocated > 0) ? Math.round((spent / allocated) * 100) + '%' : "69%";

      const formatCrStr = (val) => {
        if (!val) return null;
        const cr = val >= 1000000 ? val / 10000000 : val;
        return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
      };

      return {
        totalBudget: formatCrStr(allocated) || civicKPIs.totalBudget,
        spentAmount: formatCrStr(spent) || civicKPIs.spentAmount,
        moneyRemaining: formatCrStr(remaining) || "₹4,450 Cr",
        budgetUsed: utilRate,
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
      return apiRes.map(dept => {
        const name = dept.department_name || dept.name || 'Department';
        const allocated = dept.total_allocated || dept.allocated_budget || dept.allocated || 1000;
        const spent = dept.total_actual || dept.spent_amount || dept.spent || 500;
        const crAllocated = allocated >= 1000000 ? Math.round(allocated / 10000000) : allocated;
        const crSpent = spent >= 1000000 ? Math.round(spent / 10000000) : spent;
        return {
          name,
          allocated: crAllocated,
          spent: crSpent,
          color: dept.color || '#3b82f6',
          code: dept.code || name.substring(0, 3).toUpperCase()
        };
      });
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
