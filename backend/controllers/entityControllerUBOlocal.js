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

  // Extraction des propriétaires directs
  if (entity.properties.directOwners) {
    entity.properties.directOwners.forEach(owner => {
      uboInfo.directOwners.push({
        id: owner.id || null,
        name: owner.caption || owner.name?.[0] || 'Unknown Owner',
        stake: owner.stake ? parseFloat(owner.stake[0]) : null,
        startDate: owner.startDate?.[0],
        status: owner.status?.[0] || 'active'
      });
    });
  }

  // Extraction des filiales
  if (entity.properties.subsidiaries) {
    entity.properties.subsidiaries.forEach(subsidiary => {
      uboInfo.subsidiaries.push({
        id: subsidiary.id || null,
        name: subsidiary.caption || subsidiary.name?.[0] || 'Unknown Subsidiary',
        percentage: subsidiary.percentage 
          ? parseFloat(subsidiary.percentage[0]) 
          : null,
        startDate: subsidiary.startDate?.[0],
        status: subsidiary.status?.[0] || 'active',
        jurisdiction: subsidiary.jurisdiction?.[0]
      });
    });
  }

  // Extraction des bénéficiaires effectifs
  if (entity.properties.beneficialOwners) {
    entity.properties.beneficialOwners.forEach(bo => {
      uboInfo.beneficialOwners.push({
        id: bo.id || null,
        name: bo.caption || bo.name?.[0] || 'Unknown Beneficial Owner',
        stake: bo.stake ? parseFloat(bo.stake[0]) : null,
        controlType: bo.controlType?.[0] || 'Unknown',
        verificationDate: bo.verificationDate?.[0]
      });
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
        console.log('Entité trouvée :', entity);
        entityFound = entity;
        rl.close();
      }
    } catch (err) {
      console.error('Erreur lors du parsing de la ligne JSON :', err);
    }
  });

  rl.on('close', () => {
    if (entityFound) {
      console.log('Properties de l\'entité :', entityFound.properties);
      const entityData = entityFound;
      const uboInfo = extractUBOInformation(entityData);
      console.log('Informations UBO extraites :', uboInfo);
      
      res.status(200).json({
        ...entityData,
        uboDetails: uboInfo
      });
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



