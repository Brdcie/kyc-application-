// controllers/entityController.js
const fs = require('fs');
const path = require('path');
const readline = require ('readline');

// Chemin vers le fichier JSON
const Entity = require('../models/Entity');
const openSanctionsService = require('../services/openSanctionsService');
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
    const searchResults = await openSanctionsService.searchEntities(query);
    res.status(200).json({
      query: query,
      results: searchResults,
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de l\'entité:', error);
    res.status(500).json({
      message: 'Erreur lors de la recherche de l\'entité',
      error: error.message,
    });
  }
};
exports.getLocalEntity = (req, res) => {
  const entityId = req.params.id;
  const filePath = path.join(__dirname, '..', 'data', 'entities.ftm.json'); // Assurez-vous que le nom du fichier est correct
  //const filePath = '/Users/brigitte/kyc-tool/backend/data/entities.ftm.json'; // Chemin absolu pour le test
  //console.log('Répertoire actuel (__dirname) :', __dirname);
  //console.log('Chemin complet du fichier (filePath) :', filePath);
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



