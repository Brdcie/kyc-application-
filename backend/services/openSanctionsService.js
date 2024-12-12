// services/openSanctionsService.js

const axios = require('axios');
require('dotenv').config();

const apiClient = axios.create({
  baseURL: 'https://api.opensanctions.org',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Apikey ${process.env.OPENSANCTIONS_API_KEY}`
  }
});
/**
 * Recherche des entités dans OpenSanctions en fonction d'un terme de recherche.
 * @param {string} query - Le terme de recherche (nom de l'entité).
 * @returns {Promise<Object>} - Les résultats de la recherche.
 */
async function searchEntities(query) {
  try {
    const response = await apiClient.get('/search/default/', {
      params: {
        q: query
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche des entités:', error);
    throw error;
  }
}
/**
 * Récupère les détails d'une entité spécifique par son ID.
 * @param {string} entityId - L'identifiant de l'entité.
 * @returns {Promise<Object>} - Les détails de l'entité.
 */
async function getEntityDetails(entityId) {
  try {
    const response = await apiClient.get(`/entities/${entityId}/`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'entité:', error);
    throw error;
  }
}
module.exports = {
  searchEntities,
  getEntityDetails
};

