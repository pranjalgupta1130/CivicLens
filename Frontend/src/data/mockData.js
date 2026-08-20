export const civicKPIs = {
  educationBudget: "₹3,240 Cr",
  healthcareBudget: "₹2,850 Cr",
  roadsBudget: "₹2,100 Cr",
  agricultureBudget: "₹1,450 Cr",
  totalBudget: "₹12,440 Cr",
  allocatedAmount: "₹12,440 Cr",
  spentAmount: "₹9,840 Cr",
  budgetVariance: "+2.8%",
  activeAlerts: 4,
  resolvedAlerts: 38,
  anomalyScore: "96.2%",
  citizenInquiries: "24,850"
};

export const budgetHighlights = [
  "12 new district hospitals funded",
  "84 road projects approved",
  "250 schools modernized",
  "Rural water supply budget increased by 15%",
  "Agriculture subsidy expanded to 2.3 lakh farmers"
];

export const dashboardKPICards = [
  {
    title: "Education",
    value: "₹3,240 Cr",
    share: "26% of Total Budget",
    change: "↑ 12% from last year",
    changeType: "increase",
    description: "Primary & Higher Education Outlay"
  },
  {
    title: "Healthcare",
    value: "₹2,850 Cr",
    share: "23% of Total Budget",
    change: "↑ 18% from last year",
    changeType: "increase",
    description: "Hospitals & Medical Supplies"
  },
  {
    title: "Roads & Highways",
    value: "₹2,100 Cr",
    share: "17% of Total Budget",
    change: "↑ 8% from last year",
    changeType: "increase",
    description: "Corridors & National Expressways"
  },
  {
    title: "Agriculture",
    value: "₹1,450 Cr",
    share: "12% of Total Budget",
    change: "↓ 4% from last year",
    changeType: "decrease",
    description: "Farmer Subsidy & Crop Insurance"
  }
];

export const monthlySpendingData = [
  { month: "Jan", budget: 1020, spent: 980, projected: 1000 },
  { month: "Feb", budget: 1020, spent: 1010, projected: 1020 },
  { month: "Mar", budget: 1150, spent: 1220, projected: 1120 },
  { month: "Apr", budget: 1100, spent: 1060, projected: 1090 },
  { month: "May", budget: 1200, spent: 1240, projected: 1180 },
  { month: "Jun", budget: 1200, spent: 1170, projected: 1200 },
  { month: "Jul", budget: 1300, spent: 1410, projected: 1280 },
  { month: "Aug", budget: 1300, spent: 1310, projected: 1300 },
  { month: "Sep", budget: 1250, spent: 1220, projected: 1240 },
  { month: "Oct", budget: 1350, spent: 1310, projected: 1330 },
  { month: "Nov", budget: 1350, spent: 1330, projected: 1350 },
  { month: "Dec", budget: 1400, spent: 1360, projected: 1380 }
];

export const departmentBudgets = [
  { name: "Education", allocated: 3240, spent: 2680, color: "#6366f1", code: "EDU" },
  { name: "Healthcare", allocated: 2850, spent: 2210, color: "#06b6d4", code: "HLT" },
  { name: "Roads & Highways", allocated: 2100, spent: 1890, color: "#3b82f6", code: "RHW" },
  { name: "Agriculture", allocated: 1450, spent: 1120, color: "#10b981", code: "AGR" },
  { name: "Social Welfare", allocated: 1100, spent: 910, color: "#f59e0b", code: "SWL" },
  { name: "Public Transport", allocated: 950, spent: 780, color: "#ec4899", code: "PTR" },
  { name: "Water Resources", allocated: 850, spent: 640, color: "#0284c7", code: "WTR" },
  { name: "Rural Development", allocated: 750, spent: 610, color: "#8b5cf6", code: "RDEV" }
];

export const detailedBudgets = [
  {
    id: "GOV-2026-001",
    department: "Education",
    category: "Infrastructure & Modernization",
    title: "PM School Modernization Program",
    allocated: 32400000000, // ₹3,240 Cr
    spent: 26800000000,
    status: "On Track",
    vendor: "National Educational Infrastructure Corp",
    anomalyRisk: "Medium",
    lastUpdated: "2026-08-14"
  },
  {
    id: "GOV-2026-002",
    department: "Healthcare",
    category: "Hospital Infrastructure",
    title: "District Hospital Expansion Mission",
    allocated: 28500000000, // ₹2,850 Cr
    spent: 22100000000,
    status: "Over Budget (+14%)",
    vendor: "Arogya Medical Systems Ltd",
    anomalyRisk: "High",
    lastUpdated: "2026-08-18"
  },
  {
    id: "GOV-2026-003",
    department: "Roads & Highways",
    category: "Expressways & Corridors",
    title: "National Highway Development Project",
    allocated: 21000000000, // ₹2,100 Cr
    spent: 18900000000,
    status: "On Track",
    vendor: "Bharatiya Highway Infrastructure",
    anomalyRisk: "High",
    lastUpdated: "2026-08-16"
  },
  {
    id: "GOV-2026-004",
    department: "Agriculture",
    category: "Canal & Micro Irrigation",
    title: "Irrigation Improvement Program",
    allocated: 14500000000, // ₹1,450 Cr
    spent: 11200000000,
    status: "On Track",
    vendor: "AgriDirect Water Solutions",
    anomalyRisk: "Low",
    lastUpdated: "2026-08-10"
  },
  {
    id: "GOV-2026-005",
    department: "Water Resources",
    category: "Rural Drinking Water Grid",
    title: "Rural Water Supply Mission",
    allocated: 8500000000, // ₹850 Cr
    spent: 6400000000,
    status: "Over Budget (+12%)",
    vendor: "Gramin Jal Supply Corp",
    anomalyRisk: "High",
    lastUpdated: "2026-08-12"
  },
  {
    id: "GOV-2026-006",
    department: "Public Transport",
    category: "Urban Metro Corridor",
    title: "Metro Extension Project",
    allocated: 9500000000, // ₹950 Cr
    spent: 7800000000,
    status: "On Track",
    vendor: "Urban Rapid Transit Developers",
    anomalyRisk: "Low",
    lastUpdated: "2026-08-19"
  },
  {
    id: "GOV-2026-007",
    department: "Social Welfare",
    category: "Affordable Housing",
    title: "Affordable Housing Initiative",
    allocated: 11000000000, // ₹1,100 Cr
    spent: 9100000000,
    status: "Completed",
    vendor: "Awas Vikas Housing Corp",
    anomalyRisk: "Low",
    lastUpdated: "2026-08-15"
  }
];

export const aiAlertsData = [
  {
    id: "ALT-9001",
    title: "Healthcare Infrastructure Expansion",
    department: "Healthcare",
    severity: "Critical",
    date: "2026-08-18",
    description: "Budget increased from ₹1,200 Cr to ₹2,040 Cr due to new district hospital construction.",
    recommendation: "Review milestone payout schedule for medical equipment vendor Arogya Medical Systems.",
    status: "Active",
    score: 94
  },
  {
    id: "ALT-9002",
    title: "Education Spending Decline",
    department: "Education",
    severity: "Warning",
    date: "2026-08-16",
    description: "Allocation reduced by 18% in selected districts due to project completion.",
    recommendation: "Reallocate unspent capital to pending ICT digital lab modernizations.",
    status: "Active",
    score: 78
  },
  {
    id: "ALT-9003",
    title: "National Highway Development Surge",
    department: "Roads & Highways",
    severity: "Critical",
    date: "2026-08-14",
    description: "Road infrastructure allocation increased by ₹800 Cr for new highway corridors.",
    recommendation: "Request PWD Chief Engineer site audit on land acquisition disbursements.",
    status: "Active",
    score: 91
  },
  {
    id: "ALT-9004",
    title: "Rural Water Supply Cost Overrun",
    department: "Water Resources",
    severity: "Warning",
    date: "2026-08-11",
    description: "Project spending exceeded forecast by 12%.",
    recommendation: "Hold milestone payout #4 pending pipe procurement invoice audit.",
    status: "Under Review",
    score: 82
  }
];

export const samplePrompts = [
  "Why has healthcare spending increased this year?",
  "How much budget is allocated to education?",
  "Which sector received the highest funding?",
  "How much money is spent on road construction?",
  "Compare agriculture spending between FY 2025 and FY 2026.",
  "Which districts received the largest infrastructure investment?",
  "What are the major budget changes this year?"
];
