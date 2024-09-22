// index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importer le middleware cors
const app = express();
const port = process.env.PORT || 5000;

// Configurer CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Remplacez par l'URL de votre frontend si différente
  methods: ['GET', 'POST'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
};

app.use(cors(corsOptions)); // Utiliser le middleware cors avec les options définies

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Importer les routes
const routes = require('./routes');
app.use('/api', routes);

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});