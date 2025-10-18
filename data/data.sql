-- =====================================================
-- SQL INSERT STATEMENTS FOR SOUTH AFRICAN AGRICULTURAL DATA
-- =====================================================

-- 1. INSERT REGIONS
INSERT INTO regions (name, country, description) VALUES
('Gauteng', 'South Africa', 'Focus on frost management in winter months, supplementary irrigation essential'),
('Western Cape', 'South Africa', 'Mediterranean climate - winter rainfall, summer drought. Irrigation critical for summer crops'),
('KwaZulu-Natal', 'South Africa', 'High humidity - focus on disease management, excellent for subtropical crops'),
('Free State', 'South Africa', 'Prime grain production area, frost risk May-August, manage soil fertility'),
('Mpumalanga', 'South Africa', 'High summer rainfall, suitable for diverse crops, manage drainage'),
('Limpopo', 'South Africa', 'Warm region, frost-free in lowveld, irrigation essential in dry areas')
ON CONFLICT (name) DO NOTHING;

-- 2. INSERT CROPS MASTER DATA
INSERT INTO crops_master (
    name, planting_season, harvest_season,
    optimal_temp_min, optimal_temp_max,
    optimal_rainfall_min, optimal_rainfall_max,
    optimal_soil_ph_min, optimal_soil_ph_max,
    growing_days, yield_per_hectare_tons
) VALUES
('Maize (Corn)', 'October - December', 'April - June', 18, 32, 500, 800, 5.8, 7.0, 120, 5.5),
('Wheat', 'May - July', 'November - December', 12, 25, 375, 625, 6.0, 7.5, 120, 3.2),
('Sugarcane', 'August - March', 'May - November (18 months after planting)', 20, 35, 1000, 1500, 5.5, 7.5, 365, 65),
('Soybeans', 'November - December', 'April - May', 20, 30, 450, 700, 6.0, 7.0, 110, 2.0),
('Sunflower', 'October - December', 'March - May', 20, 30, 400, 650, 6.0, 7.5, 100, 1.8),
('Potatoes', 'Year-round (region dependent)', '90-120 days after planting', 15, 24, 500, 700, 5.2, 6.5, 100, 35),
('Tomatoes', 'August - March (varies by region)', '90-120 days after transplanting', 18, 27, 600, 1000, 6.0, 7.0, 100, 55),
('Grapes (Wine)', 'July - September', 'January - March', 15, 30, 400, 800, 6.0, 7.5, 365, 12)
ON CONFLICT (name) DO NOTHING;

-- 3. INSERT CROP-REGION SUITABILITY
-- Maize
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 9, 'Highly suitable for maize production'
FROM crops_master c, regions r
WHERE c.name = 'Maize (Corn)' AND r.name IN ('Free State', 'Mpumalanga')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Wheat
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 9, 'Excellent wheat growing region'
FROM crops_master c, regions r
WHERE c.name = 'Wheat' AND r.name IN ('Western Cape', 'Free State')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Sugarcane
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 10, 'Ideal conditions for sugarcane'
FROM crops_master c, regions r
WHERE c.name = 'Sugarcane' AND r.name IN ('KwaZulu-Natal', 'Mpumalanga', 'Limpopo')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Soybeans
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 9, 'Well suited for soybean production'
FROM crops_master c, regions r
WHERE c.name = 'Soybeans' AND r.name IN ('Mpumalanga', 'Limpopo', 'KwaZulu-Natal')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Sunflower
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 8, 'Good conditions for sunflower'
FROM crops_master c, regions r
WHERE c.name = 'Sunflower' AND r.name IN ('Free State', 'Mpumalanga')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Potatoes
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 9, 'Excellent potato growing conditions'
FROM crops_master c, regions r
WHERE c.name = 'Potatoes' AND r.name IN ('Western Cape', 'Limpopo', 'Free State')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Tomatoes
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 9, 'Ideal for tomato cultivation'
FROM crops_master c, regions r
WHERE c.name = 'Tomatoes' AND r.name IN ('Limpopo', 'Mpumalanga', 'Western Cape')
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- Grapes
INSERT INTO crop_region_suitability (crop_id, region_id, suitability_score, notes)
SELECT c.id, r.id, 10, 'Premium wine grape region'
FROM crops_master c, regions r
WHERE c.name = 'Grapes (Wine)' AND r.name = 'Western Cape'
ON CONFLICT (crop_id, region_id) DO NOTHING;

-- 4. INSERT CULTIVATION METHODS
INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Deep ploughing 20-30cm, ensure good drainage', 
    5, 75, 25, 
    'Drip or sprinkler', 650,
    'NPK 2:3:2 at 300kg/ha at planting, top dress with LAN at 6 weeks'
FROM crops_master WHERE name = 'Maize (Corn)'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Fine seedbed, level surface, remove weeds', 
    3, 17.5, NULL, 
    'Supplementary irrigation during grain filling', 500,
    'NPK 3:2:1 at 250kg/ha, nitrogen top dressing at tillering'
FROM crops_master WHERE name = 'Wheat'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Deep ploughing, subsoiling for compacted soils', 
    15, 150, NULL, 
    'Drip or furrow irrigation', 1250,
    'NPK 2:3:2 at 500kg/ha, split applications'
FROM crops_master WHERE name = 'Sugarcane'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Fine tilth, ensure good contact between seed and soil', 
    3, 50, 5, 
    'Critical during flowering and pod filling', 575,
    'Minimal nitrogen needed (nitrogen-fixing), phosphorus 50kg/ha, inoculation essential'
FROM crops_master WHERE name = 'Soybeans'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Medium tilth, well-drained soil essential', 
    4, 70, 30, 
    'Supplementary during head formation', 525,
    'NPK 3:2:1 at 250kg/ha, high nitrogen requirement'
FROM crops_master WHERE name = 'Sunflower'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Deep ploughing, ridging or bed formation', 
    10, 90, 30, 
    'Drip or sprinkler', 600,
    'NPK 2:3:2 at 800kg/ha, high potassium requirement'
FROM crops_master WHERE name = 'Potatoes'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Well-drained, organic matter incorporation', 
    NULL, 120, 50, 
    'Drip irrigation preferred', 800,
    'NPK 2:3:2 at 600kg/ha, weekly fertigation recommended'
FROM crops_master WHERE name = 'Tomatoes'
ON CONFLICT (crop_id) DO NOTHING;

INSERT INTO cultivation_methods (
    crop_id, soil_preparation, planting_depth_cm, row_spacing_cm, 
    plant_spacing_cm, irrigation_method, irrigation_amount_mm, fertilizer_recommendation
)
SELECT id, 
    'Deep ripping, soil analysis essential, drainage critical', 
    30, 270, 150, 
    'Drip irrigation, deficit irrigation during ripening', 600,
    'Based on soil tests, typically low nitrogen, balanced K and P'
FROM crops_master WHERE name = 'Grapes (Wine)'
ON CONFLICT (crop_id) DO NOTHING;

-- 5. INSERT WEATHER DATA - GAUTENG 2024
INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 1, 26.5, 125, 68, 8.5, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 2, 25.8, 95, 65, 8.2, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 3, 23.2, 88, 62, 7.8, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 4, 19.5, 42, 55, 8.5, 1, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 5, 15.8, 18, 48, 9.2, 5, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 6, 12.5, 8, 45, 9.5, 12, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 7, 12.2, 5, 42, 9.8, 15, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 8, 15.5, 12, 38, 10.2, 8, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2024, 9, 19.8, 28, 42, 9.5, 2, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

-- 6. INSERT ANNUAL SUMMARY - GAUTENG 2024
INSERT INTO annual_weather_summary (region_id, year, total_rainfall_mm, avg_annual_temp_c, drought_risk, growing_season_length_days)
SELECT r.id, 2024, 421, 19.2, 'moderate', 180
FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year) DO NOTHING;

-- 7. INSERT WEATHER DATA - GAUTENG 2023
INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2023, 1, 25.2, 142, 70, 8.2, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 2, 24.8, 118, 68, 8.0, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 3, 22.5, 95, 64, 7.5, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 4, 18.8, 55, 58, 8.2, 2, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 5, 14.5, 25, 52, 8.8, 8, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 6, 11.8, 12, 48, 9.2, 14, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 7, 11.5, 8, 45, 9.5, 16, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 8, 14.8, 15, 42, 9.8, 10, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 9, 18.5, 32, 45, 9.2, 3, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 10, 21.2, 68, 52, 8.8, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 11, 23.5, 105, 58, 8.5, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
UNION ALL
SELECT r.id, 2023, 12, 24.8, 132, 65, 8.2, 0, 'historical' FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

-- 8. INSERT ANNUAL SUMMARY - GAUTENG 2023
INSERT INTO annual_weather_summary (region_id, year, total_rainfall_mm, avg_annual_temp_c, drought_risk, growing_season_length_days)
SELECT r.id, 2023, 807, 19.3, 'low', 185
FROM regions r WHERE r.name = 'Gauteng'
ON CONFLICT (region_id, year) DO NOTHING;

-- 9. INSERT WEATHER DATA - FREE STATE 2022
INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2022, 1, 24.5, 78, 62, 9.2, 0, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 2, 23.8, 85, 65, 8.8, 0, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 3, 21.2, 72, 60, 8.2, 0, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 4, 17.5, 48, 55, 8.5, 3, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 5, 12.8, 22, 50, 9.0, 12, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 6, 8.5, 15, 48, 9.5, 18, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 7, 8.2, 10, 45, 9.8, 20, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 8, 11.5, 18, 42, 10.0, 15, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 9, 15.8, 28, 45, 9.5, 5, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 10, 19.2, 52, 50, 9.0, 1, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 11, 21.5, 68, 55, 8.8, 0, 'historical' FROM regions r WHERE r.name = 'Free State'
UNION ALL
SELECT r.id, 2022, 12, 23.2, 95, 60, 9.0, 0, 'historical' FROM regions r WHERE r.name = 'Free State'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

-- 10. INSERT ANNUAL SUMMARY - FREE STATE 2022
INSERT INTO annual_weather_summary (region_id, year, total_rainfall_mm, avg_annual_temp_c, drought_risk, growing_season_length_days)
SELECT r.id, 2022, 591, 17.3, 'moderate', 175
FROM regions r WHERE r.name = 'Free State'
ON CONFLICT (region_id, year) DO NOTHING;

-- 11. INSERT WEATHER DATA - KWAZULU-NATAL 2021
INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2021, 1, 27.5, 165, 75, 7.5, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 2, 27.2, 148, 76, 7.2, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 3, 25.8, 135, 74, 7.0, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 4, 23.2, 85, 70, 7.5, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 5, 20.5, 52, 68, 8.0, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 6, 18.2, 35, 65, 8.2, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 7, 17.8, 28, 63, 8.5, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 8, 19.5, 42, 62, 8.2, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 9, 21.8, 68, 65, 7.8, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 10, 23.5, 115, 70, 7.5, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 11, 25.2, 142, 72, 7.2, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
UNION ALL
SELECT r.id, 2021, 12, 26.5, 158, 74, 7.0, 0, 'historical' FROM regions r WHERE r.name = 'KwaZulu-Natal'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

-- 12. INSERT ANNUAL SUMMARY - KWAZULU-NATAL 2021
INSERT INTO annual_weather_summary (region_id, year, total_rainfall_mm, avg_annual_temp_c, drought_risk, growing_season_length_days)
SELECT r.id, 2021, 1173, 23.1, 'low', 365
FROM regions r WHERE r.name = 'KwaZulu-Natal'
ON CONFLICT (region_id, year) DO NOTHING;

-- 13. INSERT WEATHER DATA - WESTERN CAPE 2020
INSERT INTO weather_data (region_id, year, month, avg_temp_c, rainfall_mm, humidity_percent, sunshine_hours, frost_days, data_type)
SELECT r.id, 2020, 1, 22.5, 15, 65, 11.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 2, 22.8, 18, 66, 11.0, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 3, 21.2, 28, 68, 10.0, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 4, 18.5, 52, 70, 8.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 5, 15.8, 88, 75, 7.0, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 6, 13.5, 105, 78, 6.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 7, 12.8, 95, 77, 6.8, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 8, 13.2, 82, 76, 7.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 9, 15.5, 58, 72, 8.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 10, 17.8, 38, 70, 9.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 11, 19.5, 22, 68, 10.5, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
UNION ALL
SELECT r.id, 2020, 12, 21.2, 18, 66, 11.2, 0, 'historical' FROM regions r WHERE r.name = 'Western Cape'
ON CONFLICT (region_id, year, month, data_type) DO NOTHING;

-- 14. INSERT ANNUAL SUMMARY - WESTERN CAPE 2020
INSERT INTO annual_weather_summary (region_id, year, total_rainfall_mm, avg_annual_temp_c, drought_risk, growing_season_length_days)
SELECT r.id, 2020, 619, 17.9, 'moderate', 365
FROM regions r WHERE r.name = 'Western Cape'
ON CONFLICT (region_id, year) DO NOTHING;

-- 15. INSERT CLIMATE EVENTS
INSERT INTO climate_events (year, event_type, severity, regions_affected, description) VALUES
(2015, 'el_nino', 'severe', ARRAY['Gauteng', 'Free State', 'Mpumalanga', 'Limpopo'], 'Strong El Niño event causing widespread drought conditions'),
(2015, 'drought', 'severe', ARRAY['Gauteng', 'Free State', 'KwaZulu-Natal'], 'Prolonged drought affecting crop production'),
(2016, 'la_nina', 'moderate', ARRAY['KwaZulu-Natal', 'Mpumalanga'], 'La Niña bringing variable rainfall'),
(2016, 'drought', 'high', ARRAY['Western Cape', 'Free State'], 'Continued drought conditions'),
(2019, 'el_nino', 'moderate', ARRAY['Gauteng', 'Limpopo'], 'Moderate El Niño event'),
(2019, 'drought', 'moderate', ARRAY['Gauteng', 'Western Cape'], 'Below average rainfall'),
(2020, 'la_nina', 'mild', ARRAY['KwaZulu-Natal', 'Mpumalanga', 'Limpopo'], 'Mild La Niña conditions'),
(2021, 'la_nina', 'moderate', ARRAY['KwaZulu-Natal', 'Mpumalanga'], 'La Niña bringing above average rainfall'),
(2021, 'above_average_rainfall', 'moderate', ARRAY['KwaZulu-Natal', 'Mpumalanga', 'Limpopo'], 'Increased rainfall benefiting summer crops'),
(2023, 'el_nino', 'mild', ARRAY['Gauteng', 'Free State'], 'Developing El Niño conditions'),
(2023, 'above_average_rainfall', 'moderate', ARRAY['Gauteng', 'KwaZulu-Natal'], 'Above normal precipitation recorded')
ON CONFLICT DO NOTHING;

-- 16. VERIFY DATA
SELECT 
 FROM climate_events) as climate_events_count;

-- =====================================================
-- ADDITIONAL HELPER QUERIES
-- =====================================================

-- Query to view all crops with their optimal regions
SELECT 
    c.name as crop_name,
    STRING_AGG(r.name, ', ' ORDER BY crs.suitability_score DESC) as optimal_regions,
    c.planting_season,
    c.harvest_season,
    c.yield_per_hectare_tons
FROM crops_master c
LEFT JOIN crop_region_suitability crs ON c.id = crs.crop_id
LEFT JOIN regions r ON crs.region_id = r.id
GROUP BY c.id, c.name, c.planting_season, c.harvest_season, c.yield_per_hectare_tons
ORDER BY c.name;

-- Query to view weather summary by region and year
SELECT 
    r.name as region,
    aws.year,
    aws.total_rainfall_mm,
    aws.avg_annual_temp_c,
    aws.drought_risk,
    aws.growing_season_length_days
FROM annual_weather_summary aws
JOIN regions r ON aws.region_id = r.id
ORDER BY r.name, aws.year DESC;

-- Query to view monthly weather patterns for a specific region
SELECT 
    r.name as region,
    wd.year,
    wd.month,
    wd.avg_temp_c,
    wd.rainfall_mm,
    wd.humidity_percent,
    wd.frost_days
FROM weather_data wd
JOIN regions r ON wd.region_id = r.id
WHERE r.name = 'Gauteng' AND wd.year = 2024
ORDER BY wd.month;

-- Query to find best crops for current conditions
SELECT 
    c.name as crop_name,
    r.name as region,
    crs.suitability_score,
    c.planting_season,
    c.yield_per_hectare_tons,
    CONCAT(c.optimal_temp_min, '-', c.optimal_temp_max, '°C') as temp_range,
    CONCAT(c.optimal_rainfall_min, '-', c.optimal_rainfall_max, 'mm') as rainfall_range
FROM crops_master c
JOIN crop_region_suitability crs ON c.id = crs.crop_id
JOIN regions r ON crs.region_id = r.id
WHERE crs.suitability_score >= 8
ORDER BY r.name, crs.suitability_score DESC;

-- =====================================================
-- SAMPLE DATA GENERATION SCRIPT (Optional)
-- Use this to populate with sample users and farms
-- =====================================================

-- Insert sample users (passwords should be hashed in production)
INSERT INTO users (username, email, password_hash, role) VALUES
('john_farmer', 'john@example.com', '$2b$10$samplehash1', 'farmer'),
('mary_smith', 'mary@example.com', '$2b$10$samplehash2', 'farmer'),
('admin_user', 'admin@example.com', '$2b$10$samplehash3', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample farms
INSERT INTO farms (user_id, name, region_id, size_hectares, soil_type, soil_ph, irrigation_available)
SELECT 
    u.id,
    'Sunrise Farm',
    r.id,
    150.5,
    'Loamy soil',
    6.5,
    true
FROM users u
CROSS JOIN regions r
WHERE u.username = 'john_farmer' AND r.name = 'Free State'
ON CONFLICT DO NOTHING;

INSERT INTO farms (user_id, name, region_id, size_hectares, soil_type, soil_ph, irrigation_available)
SELECT 
    u.id,
    'Green Valley Farm',
    r.id,
    85.0,
    'Clay loam',
    6.8,
    true
FROM users u
CROSS JOIN regions r
WHERE u.username = 'mary_smith' AND r.name = 'Gauteng'
ON CONFLICT DO NOTHING;

-- Insert sample planting records
INSERT INTO planting_records (farm_id, crop_id, planted_date, expected_harvest_date, area_hectares, status)
SELECT 
    f.id,
    c.id,
    '2024-11-15',
    '2025-04-15',
    50.0,
    'active'
FROM farms f
CROSS JOIN crops_master c
WHERE f.name = 'Sunrise Farm' AND c.name = 'Maize (Corn)'
ON CONFLICT DO NOTHING;

INSERT INTO planting_records (farm_id, crop_id, planted_date, expected_harvest_date, area_hectares, status)
SELECT 
    f.id,
    c.id,
    '2024-11-20',
    '2025-04-20',
    35.0,
    'active'
FROM farms f
CROSS JOIN crops_master c
WHERE f.name = 'Green Valley Farm' AND c.name = 'Soybeans'
ON CONFLICT DO NOTHING;

-- Insert sample harvest record
INSERT INTO planting_records (farm_id, crop_id, planted_date, expected_harvest_date, actual_harvest_date, area_hectares, yield_tons, status)
SELECT 
    f.id,
    c.id,
    '2023-10-15',
    '2024-03-15',
    '2024-03-20',
    45.0,
    220.5,
    'harvested'
FROM farms f
CROSS JOIN crops_master c
WHERE f.name = 'Sunrise Farm' AND c.name = 'Maize (Corn)'
ON CONFLICT DO NOTHING;

-- Insert sample pest/disease records
INSERT INTO pest_disease_records (planting_record_id, type, name, severity, detected_date, treatment_applied, resolved, notes)
SELECT 
    pr.id,
    'pest',
    'Fall armyworm',
    'moderate',
    '2024-12-10',
    'Bt-based insecticide application',
    true,
    'Early detection allowed for effective control'
FROM planting_records pr
JOIN farms f ON pr.farm_id = f.id
JOIN crops_master c ON pr.crop_id = c.id
WHERE f.name = 'Sunrise Farm' AND c.name = 'Maize (Corn)' AND pr.status = 'active'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- DATA VALIDATION QUERIES
-- =====================================================

-- Check for any orphaned records
SELECT 'Orphaned crop_region_suitability' as issue, COUNT(*) as count
FROM crop_region_suitability crs
LEFT JOIN crops_master c ON crs.crop_id = c.id
LEFT JOIN regions r ON crs.region_id = r.id
WHERE c.id IS NULL OR r.id IS NULL

UNION ALL

SELECT 'Orphaned weather_data' as issue, COUNT(*) as count
FROM weather_data wd
LEFT JOIN regions r ON wd.region_id = r.id
WHERE r.id IS NULL

UNION ALL

SELECT 'Orphaned cultivation_methods' as issue, COUNT(*) as count
FROM cultivation_methods cm
LEFT JOIN crops_master c ON cm.crop_id = c.id
WHERE c.id IS NULL;

-- Check data integrity
SELECT 
    'Weather data completeness' as check_type,
    r.name as region,
    wd.year,
    COUNT(DISTINCT wd.month) as months_recorded,
    CASE 
        WHEN COUNT(DISTINCT wd.month) = 12 THEN 'Complete'
        WHEN COUNT(DISTINCT wd.month) >= 6 THEN 'Partial'
        ELSE 'Incomplete'
    END as status
FROM weather_data wd
JOIN regions r ON wd.region_id = r.id
GROUP BY r.name, wd.year
ORDER BY wd.year DESC, r.name;

-- Check crop coverage by region
SELECT 
    r.name as region,
    COUNT(DISTINCT crs.crop_id) as crops_available,
    STRING_AGG(c.name, ', ' ORDER BY crs.suitability_score DESC) as crop_list
FROM regions r
LEFT JOIN crop_region_suitability crs ON r.id = crs.region_id
LEFT JOIN crops_master c ON crs.crop_id = c.id
GROUP BY r.name
ORDER BY crops_available DESC;

-- =====================================================
-- ANALYTICS QUERIES
-- =====================================================

-- Compare rainfall across regions
SELECT 
    r.name as region,
    aws.year,
    aws.total_rainfall_mm,
    aws.drought_risk,
    LAG(aws.total_rainfall_mm) OVER (PARTITION BY r.name ORDER BY aws.year) as previous_year_rainfall,
    ROUND(
        ((aws.total_rainfall_mm - LAG(aws.total_rainfall_mm) OVER (PARTITION BY r.name ORDER BY aws.year)) 
        / NULLIF(LAG(aws.total_rainfall_mm) OVER (PARTITION BY r.name ORDER BY aws.year), 0) * 100)::numeric, 
        2
    ) as rainfall_change_percent
FROM annual_weather_summary aws
JOIN regions r ON aws.region_id = r.id
ORDER BY r.name, aws.year DESC;

-- Find optimal planting windows based on historical weather
SELECT 
    r.name as region,
    c.name as crop,
    c.planting_season,
    AVG(wd.avg_temp_c) as avg_temp_during_season,
    AVG(wd.rainfall_mm) as avg_rainfall_during_season,
    CASE 
        WHEN AVG(wd.avg_temp_c) BETWEEN c.optimal_temp_min AND c.optimal_temp_max 
            AND SUM(wd.rainfall_mm) BETWEEN c.optimal_rainfall_min AND c.optimal_rainfall_max
        THEN 'Optimal'
        WHEN AVG(wd.avg_temp_c) BETWEEN c.optimal_temp_min - 3 AND c.optimal_temp_max + 3
        THEN 'Acceptable'
        ELSE 'Suboptimal'
    END as conditions_assessment
FROM crops_master c
JOIN crop_region_suitability crs ON c.id = crs.crop_id
JOIN regions r ON crs.region_id = r.id
JOIN weather_data wd ON r.id = wd.region_id
WHERE wd.month IN (10, 11, 12) -- Adjust based on planting season
    AND wd.year >= 2020
GROUP BY r.name, c.name, c.planting_season, c.optimal_temp_min, c.optimal_temp_max, 
         c.optimal_rainfall_min, c.optimal_rainfall_max
ORDER BY r.name, c.name;

-- Calculate average yield potential by region
SELECT 
    r.name as region,
    AVG(c.yield_per_hectare_tons) as avg_yield_potential,
    COUNT(DISTINCT c.id) as number_of_crops,
    STRING_AGG(
        c.name || ' (' || c.yield_per_hectare_tons || 't/ha)', 
        ', ' 
        ORDER BY c.yield_per_hectare_tons DESC
    ) as crops_with_yields
FROM regions r
JOIN crop_region_suitability crs ON r.id = crs.region_id
JOIN crops_master c ON crs.crop_id = c.id
WHERE crs.suitability_score >= 7
GROUP BY r.name
ORDER BY avg_yield_potential DESC;

-- Identify climate risk periods
SELECT 
    r.name as region,
    wd.year,
    wd.month,
    wd.avg_temp_c,
    wd.rainfall_mm,
    wd.frost_days,
    CASE 
        WHEN wd.rainfall_mm < 20 AND wd.month IN (1,2,3,10,11,12) THEN 'Drought risk - Summer'
        WHEN wd.frost_days > 10 THEN 'High frost risk'
        WHEN wd.avg_temp_c > 30 THEN 'Heat stress risk'
        WHEN wd.rainfall_mm > 150 THEN 'Flooding risk'
        ELSE 'Normal'
    END as risk_assessment
FROM weather_data wd
JOIN regions r ON wd.region_id = r.id
WHERE wd.year >= 2022
ORDER BY r.name, wd.year DESC, wd.month;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Update timestamps for existing records (if needed)
UPDATE crops_master 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

UPDATE farms 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

UPDATE planting_records 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at IS NULL;

-- Create indexes for better query performance (if not already created)
CREATE INDEX IF NOT EXISTS idx_weather_region_year_month 
ON weather_data(region_id, year, month);

CREATE INDEX IF NOT EXISTS idx_planting_farm_status 
ON planting_records(farm_id, status);

CREATE INDEX IF NOT EXISTS idx_planting_dates 
ON planting_records(planted_date, expected_harvest_date);

CREATE INDEX IF NOT EXISTS idx_crop_suitability_score 
ON crop_region_suitability(suitability_score DESC);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Agricultural Database Population Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Data inserted successfully:';
    RAISE NOTICE '- Regions: %', (SELECT COUNT(*) FROM regions);
    RAISE NOTICE '- Crops: %', (SELECT COUNT(*) FROM crops_master);
    RAISE NOTICE '- Weather Records: %', (SELECT COUNT(*) FROM weather_data);
    RAISE NOTICE '- Climate Events: %', (SELECT COUNT(*) FROM climate_events);
    RAISE NOTICE '========================================';
END $; FROM regions as regions_count,
    (SELECT COUNT(*) FROM crops_master) as crops_count,
    (SELECT COUNT(*) FROM crop_region_suitability) as suitability_count,
    (SELECT COUNT(*) FROM cultivation_methods) as cultivation_count,
    (SELECT COUNT(*) FROM weather_data) as weather_records_count,
    (SELECT COUNT(*) FROM annual_weather_summary) as annual_summary_count,
    (SELECT COUNT(*) FROM planting_records) as planting_records_count,
    (SELECT COUNT(*) FROM climate_events) as climate_events_count;
    RAISE NOTICE '========================================';
END $;
