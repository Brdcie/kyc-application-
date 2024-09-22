// routes/index.js

const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');

router.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API KYC');
});
// Route pour créer une entité
router.post('/entities', entityController.createEntity);
// Route GET pour rechercher une entité dans OpenSanctions
router.get('/search', entityController.searchEntity);
// Route GET pour rechercher des entités locales
router.get('/local-entities/search', entityController.searchLocalEntities);

router.get('/local-entities/:id', entityController.getLocalEntity);
module.exports = router;

