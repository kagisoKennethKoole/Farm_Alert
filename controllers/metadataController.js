import * as metadataService from '../services/metadataService.js';

export const getMetadata = (req, res) => {
  try {
    const data = metadataService.getMetadata();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getAvailableRegions = (req, res) => {
  try {
    const data = metadataService.getAvailableRegions();
    res.json({ 
      success: true,
      count: data.length, 
      regions: data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getDataPeriod = (req, res) => {
  try {
    const data = metadataService.getDataPeriod();
    res.json({ 
      success: true, 
      data_period: data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getLastUpdated = (req, res) => {
  try {
    const data = metadataService.getLastUpdated();
    res.json({ 
      success: true, 
      last_updated: data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getVersion = (req, res) => {
  try {
    const data = metadataService.getVersion();
    res.json({ 
      success: true, 
      version: data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};