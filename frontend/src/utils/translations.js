// translations.js
export const fieldTranslations = {
  // Champs d'identification
  'id': 'Identifiant',
  'caption': 'Nom',
  'schema': 'Type d\'entité',
  'referents': 'Références',
  'datasets': 'Sources de données',
  'first_seen': 'Première apparition',
  'last_seen': 'Dernière apparition',
  'last_change': 'Dernière modification',
  'target': 'Cible',
  'Generate PDF': 'Générer le PDF',
  'sourceUrl' : 'URL des sources',
  'legalForm' : 'Forme juridique',
  'permId' : 'numéro de permis',
  'taxNumber': 'identifiant fiscal',
  // Propriétés communes
  'properties': 'Propriétés',
  'name': 'Nom',
  'country': 'Pays',
  'nationality': 'Nationalité',
  'birthDate': 'Date de naissance',
  'modifiedAt': 'Date de modification',
  'topics': 'Catégories',
  'address': 'Adresse',
  'position': 'Fonction',
  'gender': 'Genre',
  'notes': 'Notes',
  'jurisdiction': 'Juridiction',
  'firstName': 'Prénom',
  'lastName': 'Nom de famille',
  'swiftBic': 'Code SWIFT/BIC',
  'createdAt': 'Date de création',
  'startDate': 'Date de début',

  // Types d'entités
  'Person': 'Personne',
  'Organization': 'Organisation',
  'Company': 'Société',

  // Topics spécifiques
  'role.pep': 'Personne Politiquement Exposée',
  'fin.bank': 'Institution Bancaire',

  'Entity': 'Entité',
  'Entity not found': 'Entité non trouvée',
  'Error fetching entity': 'Erreur lors de la récupération de l\'entité',
  'Error searching entities': 'Erreur lors de la recherche des entités',
  'Entity Details': 'Détails de l\'Entité',
  'Search Entity by ID': 'Rechercher une Entité par Identifiant',
  'Entity Search by Criteria': 'Rechercher une entité par Critères',
  'Search Results by Criteria' :'Résultats de la recherche par critère',
  'Enter entity ID' : 'Saisir l\'ID de l\'entité',
  'Enter entity caption' : 'Saisir le nom de l\'entité',
  'Property': 'Propriété',
  'Value': 'Valeur',
  'Risk Assessment': 'Évaluation des Risques',
  'Not specified': 'Non spécifié',
  'None': 'Aucun',
  'No comments': 'Aucun commentaire',
  'Yes': 'Oui',
  'No': 'Non',
  'Search' : 'Recherche',
  // Évaluation des risques
  'Risk Level': 'Niveau de Risque',
  'Risk Score': 'Score de Risque',
  'High Risk': 'Risque Élevé',
  'Medium Risk': 'Risque Moyen',
  'Low Risk': 'Risque Faible',
  'Comments': 'Commentaires'
};

// Fonction utilitaire pour traduire
export const translate = (key) => {
  return fieldTranslations[key] || key;
};