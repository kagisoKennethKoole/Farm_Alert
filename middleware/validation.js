export const validateRegion = (req, res, next) => {
  const validRegions = [
    'gauteng', 
    'western cape', 
    'kwazulu-natal', 
    'free state', 
    'mpumalanga', 
    'limpopo'
  ];
  
  const region = req.params.region?.toLowerCase();
  
  if (region && !validRegions.includes(region)) {
    return res.status(400).json({
      success: false,
      message: `Invalid region: ${req.params.region}`,
      valid_regions: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Free State', 'Mpumalanga', 'Limpopo']
    });
  }
  
  next();
};

export const validateDate = (req, res, next) => {
  const { date } = req.params;
  
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-10-25)'
    });
  }
  
  next();
};

export const validateCategory = (req, res, next) => {
  const validCategories = [
    'grains', 
    'vegetables', 
    'fruit', 
    'oilseeds', 
    'industrial crops'
  ];
  
  const category = req.params.category?.toLowerCase();
  
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: `Invalid category: ${req.params.category}`,
      valid_categories: ['Grains', 'Vegetables', 'Fruit', 'Oilseeds', 'Industrial Crops']
    });
  }
  
  next();
};

export const validateNumericParam = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    
    if (value && isNaN(Number(value))) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}: must be a number`
      });
    }
    
    next();
  };
};