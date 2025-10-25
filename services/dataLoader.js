import fs from "fs";
import path from "path";

const filePath = path.resolve("data/sa_agri_enhanced.json");// Path to the JSON data file  

let cachedData = null; // Cache to store loaded data

// Function to load data from the JSON file
export const loadData = () => {
  if (cachedData) return cachedData;

  try {
    if (!fs.existsSync(filePath)) {
      console.error("❌ Data file not found:", filePath);
      return null;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    cachedData = JSON.parse(raw)[0];
    
    console.log("✅ Data loaded successfully");
    return cachedData;
  } catch (err) {
    console.error("❌ Failed to load data:", err.message);
    return null;
  }
};

// Reload data (useful for development)
export const reloadData = () => {
  cachedData = null;
  return loadData();
};