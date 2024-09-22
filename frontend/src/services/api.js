// frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api'; // Assurez-vous que cette URL correspond à celle de votre backend

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

// Vous pouvez ajouter d'autres fonctions pour interagir avec d'autres endpoints
