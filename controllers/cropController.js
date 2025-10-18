import {
    fetchCropsAll,
    filterCropsByClimate,
    filterCropsByName,
    filterCropsByRegion
    //,filterCropsByYield

} from '../services/cropService.js'; // Adjust the path as necessary

export const getAllCrops = (req, res) => { // Get all crops
    const data = fetchCropsAll();
    res.json(data);
};

export const getCropsByName = (req, res) => { // Get crops by name
    const { crop } = req.params;
    const data = filterCropsByName(crop);
    res.json(data);
};
export const getCropsByRegion = (req, res) => { // Get crops by region
    const { region } = req.params;
    const data = filterCropsByRegion(region);
    res.json(data);
};

export const getCropsByClimate = (req, res) => { // Get crops by climate
    const { temperature, rainfall } = req.params;
    const data = filterCropsByClimate(Number(temperature), Number(rainfall));
    res.json(data);
};
/*export const getCropsByYield = (req, res) => {
    const { year, region } = req.params;
    const data = filterCropsByYield(Number(year), region);
    res.json(data);
};
*/