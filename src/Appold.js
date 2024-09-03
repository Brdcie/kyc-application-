import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProfileForm from './components/ProfileForm';
import RiskAssessment from './components/RiskAssessment';
import DocumentGeneration from './components/DocumentGeneration';
import Compliance from './components/Compliance';

// Updated mock data to align with mockOpenSanctionsApi.js
const mockIndividualData1 = {
  entityType: 'individual',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  country: 'Iran', // High-risk country
  address: '123 Main St, Tehran, Iran'
};

const mockIndividualData2 = {
  entityType: 'individual',
  firstName: 'Jane',
  lastName: 'Smith',
  dateOfBirth: '1985-05-15',
  country: 'United States', // Not a high-risk country
  address: '456 Elm St, New York, NY, USA'
};

const mockCompanyData = {
  entityType: 'company',
  companyName: 'Global Trading Co.',
  registrationNumber: 'GT12345678',
  country: 'Syria', // Another high-risk country
  address: '789 Business Ave, Damascus, Syria'
};

// ... rest of the App component remains the same