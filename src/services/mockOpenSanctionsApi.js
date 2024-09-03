// src/services/mockOpenSanctionsApi.js

const mockData = {
  "John Doe": [
    { id: "Q123456", schema: "Person", name: "John Doe", sanctions: ["EU Sanctions"] },
  ],
  "Jane Smith": [
    { id: "Q789012", schema: "Person", name: "Jane Smith", sanctions: ["US Sanctions"] },
  ],
  "Global Trading Co.": [
    { id: "E789012", schema: "Company", name: "Global Trading Co.", sanctions: ["US Sanctions"] },
  ],
};

export const searchPerson = async (name) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return mockData[name] || [];
};

export const searchEntity = async (name) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return mockData[name] || [];
};