import { governmentApi } from './governmentApi';
import { civicKPIs, departmentBudgets, detailedBudgets, monthlySpendingData } from '../data/mockData';

export const budgetService = {
  async getOverviewKPIs() {
    const apiRes = await governmentApi.getDashboardSummary();
    if (apiRes && apiRes.total_budget_amount !== undefined && apiRes.total_actual_amount !== undefined) {
      const allocated = Number(apiRes.total_budget_amount || 0);
      const spent = Number(apiRes.total_actual_amount || 0);
      const remaining = Math.max(0, allocated - spent);
      const utilRate = allocated > 0 ? Math.round((spent / allocated) * 100) + '%' : "0%";

      const formatCrStr = (val) => {
        if (val === undefined || val === null) return '₹0 Cr';
        if (val === 0) return '₹0 Cr';
        const cr = val >= 1000000 ? val / 10000000 : val;
        return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
      };

      return {
        totalBudget: formatCrStr(allocated),
        spentAmount: formatCrStr(spent),
        moneyRemaining: formatCrStr(remaining),
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
      const deptColors = ['#06b6d4', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
      return apiRes.map((dept, idx) => {
        const name = dept.department_name || dept.name || 'Department';
        const allocated = dept.total_budget_amount !== undefined ? dept.total_budget_amount : (dept.total_allocated || dept.allocated || 0);
        const spent = dept.total_actual_amount !== undefined ? dept.total_actual_amount : (dept.total_actual || dept.spent || 0);
        
        const crAllocated = allocated >= 1000000 ? Math.round((allocated / 10000000) * 10) / 10 : allocated;
        const crSpent = spent >= 1000000 ? Math.round((spent / 10000000) * 10) / 10 : spent;
        return {
          name,
          allocated: crAllocated,
          spent: crSpent,
          color: dept.color || deptColors[idx % deptColors.length],
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

