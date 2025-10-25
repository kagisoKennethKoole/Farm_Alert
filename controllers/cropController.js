//controllers/cropController.js
/*import {
    fetchCropsAll,
    filterCropsByClimate,
    filterCropsByName,
    filterCropsByRegion,
    //filterCropsByYield
} from '../services/cropService.js'; */

import * as cropService from '../services/cropService.js';// Updated import to include all service functions

// Get all crops
export const getAllCrops = (req, res) => {
  try {
    const data = cropService.getAllCrops();
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

// Get crop by name
export const getCropByName = (req, res) => {
  try {
    const { name } = req.params;
    const data = cropService.getCropByName(name);
    
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: `No crop found with name: ${name}` 
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

// Get crops by region
export const getCropsByRegion = (req, res) => {
  try {
    const { region } = req.params;
    const data = cropService.getCropsByRegion(region);
    
    res.json({ 
      success: true,
      region,
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

// Get crops by climate
export const getCropsByClimate = (req, res) => {
  try {
    const { temperature, rainfall } = req.params;
    const data = cropService.getCropsByClimate(
      Number(temperature), 
      Number(rainfall)
    );
    
    res.json({ 
      success: true,
      parameters: {
        temperature: Number(temperature),
        rainfall: Number(rainfall)
      },
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

// Get crop recommendations by region
export const getCropRecommendationsByRegion = (req, res) => {
  try {
    const { region } = req.params;
    console.log("Requested Region:", region);
    const data = cropService.getCropRecommendationsByRegion(region);
    console.log("Recommendations Data:", data);
    if (!data) {
      return res.status(404).json({ 
        success: false, 
        message: `No recommendations available for region: ${region}` 
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
/*export const getCropsByYield = (req, res) => {
    const { year, region } = req.params;
    const data = filterCropsByYield(Number(year), region);
    res.json(data);
};
*/
