import { loadData } from './dataLoader.js';

export const getRiskManagement = () => {
  const data = loadData();
  return data?.risk_management || [];
};

export const getOverallRiskAssessment = () => {
  const risks = getRiskManagement();
  return risks.find(r => r.overall_risk_assessment) || null;
};

export const getRiskScore = () => {
  const assessment = getOverallRiskAssessment();
  return assessment?.risk_score || null;
};