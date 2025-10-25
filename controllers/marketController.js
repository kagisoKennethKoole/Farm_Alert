import * as marketService from '../services/marketService.js';

// ===== COMMODITY PRICES =====

export const getCommodityPrices = (req, res) => {
  try {
    const data = marketService.getCommodityPrices();
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

export const getCommodityByName = (req, res) => {
  try {
    const { commodity } = req.params;
    const data = marketService.getCommodityByName(commodity);
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: `No data found for commodity: ${commodity}` 
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

export const getCommoditiesByCategory = (req, res) => {
  try {
    const { category } = req.params;
    const data = marketService.getCommoditiesByCategory(category);
    res.json({ 
      success: true,
      category, 
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

export const getCommoditiesByTrend = (req, res) => {
  try {
    const { trend } = req.params;
    const data = marketService.getCommoditiesByTrend(trend);
    res.json({ 
      success: true,
      trend, 
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

export const getCommoditiesBySentiment = (req, res) => {
  try {
    const { sentiment } = req.params;
    const data = marketService.getCommoditiesBySentiment(sentiment);
    res.json({ 
      success: true,
      sentiment, 
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

export const getPriceComparison = (req, res) => {
  try {
    const data = marketService.getPriceComparison();
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

// ===== INPUT COSTS =====

export const getInputCosts = (req, res) => {
  try {
    const data = marketService.getInputCosts();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getFertilizerPrices = (req, res) => {
  try {
    const data = marketService.getFertilizerPrices();
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

export const getFertilizerByType = (req, res) => {
  try {
    const { type } = req.params;
    const data = marketService.getFertilizerByType(type);
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: `No fertilizer found with type: ${type}` 
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

export const getChemicalPrices = (req, res) => {
  try {
    const data = marketService.getChemicalPrices();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getFuelPrices = (req, res) => {
  try {
    const data = marketService.getFuelPrices();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getSeedPrices = (req, res) => {
  try {
    const data = marketService.getSeedPrices();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getLaborCosts = (req, res) => {
  try {
    const data = marketService.getLaborCosts();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getTotalInputCostIndex = (req, res) => {
  try {
    const data = marketService.getTotalInputCostIndex();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
// ===== EXPORT OPPORTUNITIES =====

export const getExportOpportunities = (req, res) => {
    try {
        const data = marketService.getExportOpportunities();
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

export const getExportOpportunitiesByCommodity = (req, res) => {    
    try {
        const { commodity } = req.params;
        const data = marketService.getExportOpportunitiesByCommodity(commodity);
        res.json({ 
            success: true,
            commodity,
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

export const getExportOpportunitiesByMarket = (req, res) => {
    try {
        const { market } = req.params;
        const data = marketService.getExportOpportunitiesByMarket(market);
        res.json({ 
            success: true,
            market,
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
export const getExportOpportunitiesByDemand = (req, res) => {    
    try {
        const { demandLevel } = req.params;
        const data = marketService.getExportOpportunitiesByDemand(demandLevel);
        res.json({ 
            success: true,
            demandLevel,
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

// ===== SUPPLY & DEMAND =====
export const getSupplyDemandAnalysis = (req, res) => {
    try {
        const data = marketService.getSupplyDemandAnalysis();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

export const getSupplyDemandByCrop = (req, res) => {
    try {
        const { crop } = req.params;
        const data = marketService.getSupplyDemandByCrop(crop);
        if (!data) {
            return res.status(404).json({ 
                success: false,
                message: `No data found for crop: ${crop}` 
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

export const getSurplusCrops = (req, res) => {
    try {
        const data = marketService.getSurplusCrops();
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

export const getDeficitCrops = (req, res) => {
    try {
        const data = marketService.getDeficitCrops();
        res.json({
            success: true,
            count: data.length,
            data 
        });
    }
    catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ===== MARKET TRENDS =====
export const getMarketTrends = (req, res) => {
    try {
        const data = marketService.getMarketTrends();
        res.json({ 
            success: true, 
            data 
        });
    }
    catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};
export const getEmergingTrends = (req, res) => {
    try {
        const data = marketService.getEmergingTrends();
        res.json({ 
            success: true, 
            data 
        });
    }
    catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};
export const getConsumerPreferences = (req, res) => {
    try {
        const data = marketService.getConsumerPreferences();
        res.json({ 
            success: true, 
            data 
        });
    }   catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};
export const getTechnologyAdoption = (req, res) => {
    try {
        const data = marketService.getTechnologyAdoption();
        res.json({ 
            success: true, 
            data 
        });
    }   catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};
export const getRegulatoryChanges = (req, res) => {
    try {
        const data = marketService.getRegulatoryChanges();
        res.json({ 
            success: true, 
            data 
        });
    }
    catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};