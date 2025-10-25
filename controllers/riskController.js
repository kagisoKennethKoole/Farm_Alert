import * as riskService from '../services/riskService.js';

export const getRiskManagement = (req, res) => {
  try {
    const data = riskService.getRiskManagement();
    res.json({ 
      success: true,
      count: data.length, 
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getOverallRiskAssessment = (req, res) => {
  try {
    const data = riskService.getOverallRiskAssessment();
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: 'No risk assessment data available' 
      });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getRiskScore = (req, res) => {
  try {
    const data = riskService.getRiskScore();
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: 'No risk score available' 
      });
    }
    
    res.json({ 
      success: true, 
      risk_score: data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
