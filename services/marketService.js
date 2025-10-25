import { loadData } from './dataLoader.js';

// Get all market intelligence
export const getMarketIntelligence = () => {
  const data = loadData();
  return data?.market_intelligence || {};
};

// ===== COMMODITY PRICES =====

export const getCommodityPrices = () => {
  const market = getMarketIntelligence();
  return market?.commodity_prices || [];
};

export const getCommodityByName = (commodity) => {
  const prices = getCommodityPrices();
  return prices.find(c => 
    c.commodity.toLowerCase().includes(commodity.toLowerCase())
  );
};

export const getCommoditiesByCategory = (category) => {
  const prices = getCommodityPrices();
  return prices.filter(c => 
    c.category.toLowerCase() === category.toLowerCase()
  );
};

export const getCommoditiesByTrend = (trend) => {
  const prices = getCommodityPrices();
  return prices.filter(c => 
    c.price_trend.toLowerCase().includes(trend.toLowerCase())
  );
};

export const getCommoditiesBySentiment = (sentiment) => {
  const prices = getCommodityPrices();
  return prices.filter(c => 
    c.market_sentiment.toLowerCase().includes(sentiment.toLowerCase())
  );
};

export const getPriceComparison = () => {
  const prices = getCommodityPrices();
  return prices.map(p => ({
    commodity: p.commodity,
    category: p.category,
    current_price: p.current_price_zar,
    week_change: p.week_change_percent,
    month_change: p.month_change_percent,
    year_change: p.year_change_percent,
    trend: p.price_trend,
    sentiment: p.market_sentiment,
    forecast_30_days: p.forecast_30_days
  }));
};

// ===== INPUT COSTS =====

export const getInputCosts = () => {
  const market = getMarketIntelligence();
  return market?.input_costs || {};
};

export const getFertilizerPrices = () => {
  const costs = getInputCosts();
  return costs?.fertilizers || [];
};

export const getFertilizerByType = (type) => {
  const fertilizers = getFertilizerPrices();
  return fertilizers.find(f => 
    f.type.toLowerCase().includes(type.toLowerCase())
  );
};

export const getChemicalPrices = () => {
  const costs = getInputCosts();
  return costs?.chemicals || {};
};

export const getFuelPrices = () => {
  const costs = getInputCosts();
  return costs?.fuel || {};
};

export const getSeedPrices = () => {
  const costs = getInputCosts();
  return costs?.seed || {};
};

export const getLaborCosts = () => {
  const costs = getInputCosts();
  return costs?.labor || {};
};

export const getTotalInputCostIndex = () => {
  const costs = getInputCosts();
  return costs?.total_input_cost_index || {};
};

// ===== EXPORT OPPORTUNITIES =====

export const getExportOpportunities = () => {
  const market = getMarketIntelligence();
  return market?.export_opportunities || [];
};

export const getExportOpportunitiesByCommodity = (commodity) => {
  const opportunities = getExportOpportunities();
  return opportunities.filter(o => 
    o.commodity.toLowerCase().includes(commodity.toLowerCase())
  );
};

export const getExportOpportunitiesByMarket = (market) => {
  const opportunities = getExportOpportunities();
  return opportunities.filter(o => 
    o.target_markets?.some(m => m.toLowerCase().includes(market.toLowerCase()))
  );
};

export const getExportOpportunitiesByDemand = (demandLevel) => {
  const opportunities = getExportOpportunities();
  return opportunities.filter(o => 
    o.current_demand?.toLowerCase() === demandLevel.toLowerCase()
  );
};

// ===== SUPPLY & DEMAND =====

export const getSupplyDemandAnalysis = () => {
  const market = getMarketIntelligence();
  return market?.supply_demand_analysis || {};
};

export const getSupplyDemandByCrop = (crop) => {
  const analysis = getSupplyDemandAnalysis();
  return analysis[crop.toLowerCase()] || null;
};

export const getSurplusCrops = () => {
  const analysis = getSupplyDemandAnalysis();
  return Object.entries(analysis)
    .filter(([_, data]) => data.status === "Surplus")
    .map(([crop, data]) => ({ crop, ...data }));
};

export const getDeficitCrops = () => {
  const analysis = getSupplyDemandAnalysis();
  return Object.entries(analysis)
    .filter(([_, data]) => data.status === "Deficit")
    .map(([crop, data]) => ({ crop, ...data }));
};

// ===== MARKET TRENDS =====

export const getMarketTrends = () => {
  const market = getMarketIntelligence();
  return market?.market_trends || {};
};

export const getEmergingTrends = () => {
  const trends = getMarketTrends();
  return trends?.emerging_trends || [];
};

export const getConsumerPreferences = () => {
  const trends = getMarketTrends();
  return trends?.consumer_preferences || [];
};

export const getTechnologyAdoption = () => {
  const trends = getMarketTrends();
  return trends?.technology_adoption || [];
};

export const getRegulatoryChanges = () => {
  const trends = getMarketTrends();
  return trends?.regulatory_changes || [];
};