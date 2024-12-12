// frontend/src/services/api.js
import axios from 'axios';

const LOCAL_API_BASE_URL = 'http://127.0.0.1:5000/api';

const localApi = axios.create({
  baseURL: LOCAL_API_BASE_URL,
});

// Fonctions pour la source locale (inchangées)
export const getLocalEntity = (id) => {
  return localApi.get(`/local-entities/${id}`);
};

export const searchLocalEntities = (query) => {
  return localApi.get(`/local-entities/search`, {
    params: { q: query },
  });
};

export const getLocalEntitiesByCaption = (caption) => {
  return localApi.get(`/local-entities/search`, {
    params: { q: caption },
  });
};

// Fonctions modifiées pour l'API OpenSanctions
export const searchOpenSanctionsEntities = (query) => {
  return localApi.get(`/entities/search`, {
    params: { q: query }
  });
};

// Modifié : Utilisation de l'endpoint correct pour obtenir une entité spécifique
export const getOpenSanctionsEntity = (id) => {
  return localApi.get(`/entities/${id}`);  // Changé ici pour utiliser l'endpoint dédié
};

// Fonctions unifiées (inchangées)
export const getEntity = (id, dataSource) => {
  return dataSource === 'local' ? getLocalEntity(id) : getOpenSanctionsEntity(id);
};

export const searchEntities = (query, dataSource) => {
  return dataSource === 'local' ? searchLocalEntities(query) : searchOpenSanctionsEntities(query);
};

export const getEntitiesByCaption = (caption, dataSource) => {
  return dataSource === 'local' ? getLocalEntitiesByCaption(caption) : searchOpenSanctionsEntities(caption);
};