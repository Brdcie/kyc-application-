// controllers/entityController.js
require('dotenv').config();
const axios =require ('axios');
const fs = require('fs');
const path = require('path');
const readline = require ('readline')
const Entity = require('../models/Entity');
const openSanctionsService = require('../services/openSanctionsService');
const extractUBOInformation = (entity) => {
  const uboInfo = {
    directOwners: [],
    beneficialOwners: [],
    subsidiaries: [],
    totalIdentifiedOwnership: 0
  };

  if (!entity.properties) return uboInfo;

  // Propriétaires directs via ownershipAsset
  if (entity.properties.ownershipAsset) {
    entity.properties.ownershipAsset.forEach(ownership => {
      if (ownership.properties?.owner?.[0]) {
        const owner = ownership.properties.owner[0];
        uboInfo.directOwners.push({
          id: owner.id,
          name: owner.caption || 'Unknown Owner',
          stake: ownership.properties?.percentage 
            ? parseFloat(ownership.properties.percentage[0]) 
            : 100,
          startDate: ownership.properties?.startDate?.[0],
          status: owner.properties?.status?.[0] || 'active'
        });
      }
    });
  }

  // Filiales via ownershipOwner
  if (entity.properties.ownershipOwner) {
    entity.properties.ownershipOwner.forEach(ownership => {
      if (ownership.properties?.asset?.[0]) {
        const asset = ownership.properties.asset[0];
        uboInfo.subsidiaries.push({
          id: asset.id,
          name: asset.caption || 'Unknown Subsidiary',
          percentage: ownership.properties.percentage 
            ? parseFloat(ownership.properties.percentage[0]) 
            : null,
          startDate: ownership.properties.startDate?.[0],
          status: asset.properties?.status?.[0] || 'active',
          jurisdiction: asset.properties?.jurisdiction?.[0]
        });
      }
    });
  }

  // Calcul du total de propriété identifié
  uboInfo.totalIdentifiedOwnership = uboInfo.directOwners.reduce(
    (sum, owner) => sum + (owner.stake || 0), 0
  );

  return uboInfo;
};

// Configuration du client API OpenSanctions
const apiClient = axios.create({
  baseURL: 'https://api.opensanctions.org',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Apikey ${process.env.OPENSANCTIONS_API_KEY}`
  },
});
exports.getEntityWithUBO = async (req, res) => {
  const entityId = req.params.id;
  
  if (!entityId) {
    return res.status(400).json({
      message: "ID d'entité manquant"
    });
  }

  try {
    const response = await apiClient.get(`/entities/${entityId}/`, {
      params: { nested: true },
      headers: {
        'Authorization': `ApiKey ${process.env.OPENSANCTIONS_API_KEY}`
      }
    });
    
    const entityData = response.data;
    const uboInfo = extractUBOInformation(entityData);
    
    res.status(200).json({
      ...entityData,
      uboDetails: uboInfo
    });
    
  } catch (error) {
    console.error('Erreur lors de la requête API OpenSanctions:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ 
        message: "Entité non trouvée",
        error: error.response.data 
      });
    } else {
      res.status(500).json({ 
        message: "Erreur API OpenSanctions", 
        error: error.response?.data || error.message 
      });
    }
  }
};
exports.createEntity = async (req, res) => {
  console.log('createEntity appelé avec les données :', req.body);

  const { name, address, identifier } = req.body;
  const newEntity = new Entity(name, address, identifier);

  try {
    // Appeler le service pour rechercher l'entité dans OpenSanctions
    const searchResults = await openSanctionsService.searchEntities(name);

    // Vous pouvez traiter les résultats comme vous le souhaitez
    // Par exemple, vérifier si l'entité est présente dans les sanctions
    const isSanctioned = searchResults.results && searchResults.results.length > 0;

    // Répondre en conséquence
    res.status(201).json({
      message: 'Entité créée avec succès',
      entity: newEntity,
      isSanctioned: isSanctioned,
      searchResults: searchResults
    });
  } catch (error) {
   console.error('Erreur lors de la création de l\'entité:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de l\'entité',
      error: error.message
    });
  }
};
exports.searchEntity = async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({
      message: "Paramètre de requête 'q' manquant",
    });
  }

  try {
    console.log(`Requête en cours pour : ${query}`);
    const response = await apiClient.get(`/search/default`, {
      params: { q: query }
    });
    
    // Envoi de la réponse au client avec res.json()
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('Erreur lors de la requête API :', error.response?.data || error.message);
    res.status(500).json({ 
      message: "Erreur API OpenSanctions", 
      error: error.response?.data || error.message 
    });
  }
};
exports.getOpenSanctionsEntity = async (req, res) => {
  const entityId = req.params.id;
  
  if (!entityId) {
    return res.status(400).json({
      message: "ID d'entité manquant"
    });
  }

  try {
    console.log(`Récupération de l'entité OpenSanctions avec l'ID : ${entityId}`);
    const response = await apiClient.get(`/entities/${entityId}/`, {
      params: { nested: true },  // Ajout de nested: true
      headers: {
        'Authorization': `ApiKey ${process.env.OPENSANCTIONS_API_KEY}`
      }
    });
    
    const entityData = response.data;
    const uboInfo = extractUBOInformation(entityData);  // Ajout de l'extraction UBO
    
    res.status(200).json({
      ...entityData,
      uboDetails: uboInfo  // Ajout des détails UBO à la réponse
    });
    
  } catch (error) {
    console.error('Erreur lors de la requête API OpenSanctions:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ 
        message: "Entité non trouvée",
        error: error.response.data 
      });
    } else {
      res.status(500).json({ 
        message: "Erreur API OpenSanctions", 
        error: error.response?.data || error.message 
      });
    }
  }
};
exports.getLocalEntity = (req, res) => {
  const entityId = req.params.id;
  const filePath = path.join(__dirname, '..', 'data', 'entities.ftm.json'); 
  let entityFound = null;
  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  rl.on('line', (line) => {
    try {
      const entity = JSON.parse(line);

      if (entity.id === entityId) {
        entityFound = entity;
        // Fermer le stream et l'interface readline car nous avons trouvé l'entité
        rl.close();
      }
    } catch (err) {
      console.error('Erreur lors du parsing de la ligne JSON :', err);
      // Vous pouvez gérer les erreurs de parsing ici si nécessaire
    }
  });

  rl.on('close', () => {
    if (entityFound) {
      res.status(200).json(entityFound);
    } else {
      res.status(404).json({ message: 'Entité non trouvée' });
    }
  });

  rl.on('error', (err) => {
    console.error('Erreur lors de la lecture du fichier :', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  });
};
exports.searchLocalEntities = (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: "Paramètre de requête 'q' manquant" });
  }

  const filePath = path.join(__dirname, '..', 'data', 'entities.ftm.json');
  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });

  let results = [];

  rl.on('line', (line) => {
    try {
      const entity = JSON.parse(line);
      // Vous pouvez ajuster les conditions de recherche selon vos besoins
      if (
        (entity.caption && entity.caption.toLowerCase().includes(query.toLowerCase())) ||
        (entity.properties && entity.properties.name && entity.properties.name.some(name => name.toLowerCase().includes(query.toLowerCase())))
      ) {
        results.push(entity);
      }
    } catch (err) {
      console.error('Erreur lors du parsing de la ligne JSON :', err);
      // Vous pouvez gérer les erreurs de parsing ici si nécessaire
    }
  });

  rl.on('close', () => {
    res.status(200).json({ results });
  });

  rl.on('error', (err) => {
    console.error('Erreur lors de la lecture du fichier :', err);
    res.status(500).json({ message: 'Erreur du serveur' });
  });
};



