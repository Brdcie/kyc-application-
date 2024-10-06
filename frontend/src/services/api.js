// frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api'; //  cette URL correspond à celle de votre backend

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Fonction pour récupérer une entité par son ID
export const getLocalEntity = (id) => {
  return api.get(`/local-entities/${id}`);
};

// Fonction pour rechercher des entités locales
export const searchLocalEntities = (query) => {
  return api.get(`/local-entities/search`, {
    params: { q: query },
  });
};
/**
 * Récupère les entités en fonction du caption fourni.
 *
 * @param {string} caption - Le critère de recherche basé sur le caption de l'entité.
 * @returns {Promise} - Une promesse contenant la réponse de l'API.
 */
export const getLocalEntitiesByCaption = (caption) => {
  return api.get(`/local-entities/search`, {
    params: { q: caption, // le paramètre correspond à celui attendu par votre backend
    },
  });
};
// Vous pouvez ajouter d'autres fonctions pour interagir avec d'autres endpoints
