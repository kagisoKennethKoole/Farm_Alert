import { loadData } from "./dataLoader.js";
export const getMetadata = () => {
  const data = loadData();
  return data?.metadata || {};
};

export const getAvailableRegions = () => {
  const metadata = getMetadata();
  return metadata?.regions_covered || [];
};

export const getDataPeriod = () => {
  const metadata = getMetadata();
  return metadata?.data_period || null;
};

export const getLastUpdated = () => {
  const metadata = getMetadata();
  return metadata?.last_updated || null;
};

export const getVersion = () => {
  const metadata = getMetadata();
  return metadata?.version || null;
};