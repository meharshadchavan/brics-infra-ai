export const mockStats = {
  totalReports: 12458,
  criticalHotspots: 42,
  districtsCovered: 156,
  avgUrgency: 3.4,
  categoryDistribution: [
    { name: 'Roads', value: 4500 },
    { name: 'Water', value: 3200 },
    { name: 'Power', value: 2100 },
    { name: 'Healthcare', value: 1500 },
    { name: 'Education', value: 800 },
    { name: 'Other', value: 358 }
  ],
  urgencyDistribution: [
    { level: '1', count: 1200 },
    { level: '2', count: 2800 },
    { level: '3', count: 4500 },
    { level: '4', count: 2800 },
    { level: '5', count: 1158 }
  ],
  languageStats: [
    { name: 'Hindi', value: 45 },
    { name: 'English', value: 25 },
    { name: 'Tamil', value: 15 },
    { name: 'Bengali', value: 10 },
    { name: 'Other', value: 5 }
  ]
};

export const mockInsights = [
  {
    id: 1,
    district: 'Pune Central',
    topCategory: 'Roads',
    totalComplaints: 845,
    avgUrgency: 4.8,
    budgetStatus: 'Overdrawn',
    urgencyScore: 92
  },
  {
    id: 2,
    district: 'Mumbai North',
    topCategory: 'Water',
    totalComplaints: 620,
    avgUrgency: 4.2,
    budgetStatus: 'At Risk',
    urgencyScore: 85
  },
  {
    id: 3,
    district: 'Delhi South',
    topCategory: 'Power',
    totalComplaints: 512,
    avgUrgency: 3.5,
    budgetStatus: 'Healthy',
    urgencyScore: 65
  },
  {
    id: 4,
    district: 'Chennai East',
    topCategory: 'Roads',
    totalComplaints: 430,
    avgUrgency: 2.1,
    budgetStatus: 'Healthy',
    urgencyScore: 40
  },
  {
    id: 5,
    district: 'Kolkata West',
    topCategory: 'Healthcare',
    totalComplaints: 750,
    avgUrgency: 4.5,
    budgetStatus: 'At Risk',
    urgencyScore: 88
  }
];

export const mockRecommendations = [
  {
    id: 1,
    priority: 95,
    district: 'Pune Central',
    category: 'Roads',
    justification: 'Severe pothole clusters reported across 3 major arteries. Historical data predicts 40% increase in accidents if unresolved before monsoon.',
    complaints: 342,
    budgetStatus: 'Critical Allocation Required'
  },
  {
    id: 2,
    priority: 88,
    district: 'Kolkata West',
    category: 'Healthcare',
    justification: 'Sudden spike in waterborne disease symptoms reported. Cross-referencing with municipal water pipeline maintenance shows overlap.',
    complaints: 128,
    budgetStatus: 'Emergency Funds Available'
  },
  {
    id: 3,
    priority: 75,
    district: 'Mumbai North',
    category: 'Water',
    justification: 'Consistent low pressure reports for 5 days. Pump station #4 telemetry shows erratic behavior preceding these reports.',
    complaints: 215,
    budgetStatus: 'Standard Maintenance'
  },
  {
    id: 4,
    priority: 62,
    district: 'Delhi South',
    category: 'Power',
    justification: 'Scattered outages. Transformer age in affected blocks suggests upcoming end-of-life failures.',
    complaints: 85,
    budgetStatus: 'Capital Expense Planned'
  },
  {
    id: 5,
    priority: 55,
    district: 'Ahmedabad East',
    category: 'Education',
    justification: 'Multiple reports of structural cracks in primary school building #22 following recent minor tremor.',
    complaints: 12,
    budgetStatus: 'Immediate Inspection Needed'
  }
];
