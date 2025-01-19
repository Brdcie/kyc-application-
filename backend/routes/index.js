// routes/index.js
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');

router.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API KYC');
});

// Route pour créer une entité
router.post('/entities', entityController.createEntity);

// Routes OpenSanctions
router.get('/entities/search', entityController.searchEntity);
router.get('/entities/:id', entityController.getOpenSanctionsEntity); // Nouvelle route
router.get('/entities/:id/ubo', entityController.getEntityWithUBO);

// Routes pour la base locale
router.get('/local-entities/search', entityController.searchLocalEntities);
router.get('/local-entities/:id', entityController.getLocalEntity);

module.exports = router;