 ```markdown
# Application KYC statr

![GitHub license](https://img.shields.io/github/license/Brdcie/kyc-application-.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/Brdcie/kyc-application-.svg)
![GitHub issues](https://img.shields.io/github/issues/Brdcie/kyc-application-.svg)
![GitHub stars](https://img.shields.io/github/stars/Brdcie/kyc-application-.svg)

Application KYC (Know Your Customer) permettant la gestion et la recherche d'entités via une interface web intuitive. L'application est divisée en frontend et backend, offrant des fonctionnalités de recherche avancée et d'affichage dynamique des propriétés des entités.

## Table des Matières
- [Introduction](#introduction)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Architecture du Projet](#architecture-du-projet)
- [Technologies Utilisées](#technologies-utilisées)
- [Guide d'Utilisation](#guide-dutilisation)
- [Documentation de l'API](#documentation-de-lapi)
- [Guide de Développement](#guide-developpement)
- [Tests](#tests)
- [Déploiement](#deploiement)
- [Contribuer](#contribuer)
- [FAQ](#faq)
- [Licence](#licence)
- [Acknowledgments](#acknowledgments)

## Introduction

L'application KYC est conçue pour faciliter la gestion des entités clients en permettant une recherche par nom  et un affichage dynamique de leurs propriétés. Elle se compose de deux parties principales :

- **Frontend** : Développé avec React et Ant Design, offrant une interface utilisateur réactive et intuitive.
- **Backend** : Développé avec Node.js et Express, fournissant des API robustes pour la gestion des données.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants :

- **Node.js** : Version 14 ou supérieure. [Télécharger Node.js](https://nodejs.org/)
- **npm** : Inclus avec Node.js
- **Git** : Pour le contrôle de version. [Installer Git](https://git-scm.com/)

## Installation

### 1. Cloner le Dépôt

Clonez le dépôt GitHub sur votre machine locale :

```bash
git clone https://github.com/Brdcie/kyc-application-.git
cd kyc-application-
```

### 2. Installer les Dépendances Backend

Naviguez dans le dossier `backend` et installez les dépendances :

```bash
cd backend
npm install
```

### 3. Installer les Dépendances Frontend

Naviguez dans le dossier `frontend` et installez les dépendances :

```bash
cd ../frontend
npm install
```

### 4. Configurer les Variables d'Environnement

Créez un fichier `.env` dans le dossier `backend` avec les variables suivantes :

```env
PORT=5000
# Ajoutez d'autres variables nécessaires ici
```

### 5. Lancer les Serveurs

#### Backend

Dans le dossier `backend`, démarrez le serveur backend :

```bash
cd backend
npm run dev
```

#### Frontend

Ouvrez un **nouveau terminal**, naviguez vers le dossier `frontend` et lancez l'application frontend en utilisant la commande `start:legacy` :

```bash
cd frontend
npm run start:legacy
```

**Note Importante :** En raison d'une incompatibilité avec certaines versions de Node.js, le frontend doit être démarré en utilisant la commande suivante :

```bash
npm run start:legacy
```

Cette commande configure Node.js pour utiliser le fournisseur OpenSSL hérité, évitant ainsi l'erreur `ERR_OSSL_EVP_UNSUPPORTED`. Si vous rencontrez des problèmes similaires, assurez-vous d'utiliser cette commande pour démarrer le frontend.

L'application frontend sera accessible à [http://localhost:3000](http://localhost:3000).

## Architecture du Projet

Le projet est structuré en deux dossiers principaux : `frontend` et `backend`.

### Frontend

- **`src/components`** : Contient les composants React tels que `EntitySearch`, `EntityPage`, et `EntityDetails`.
- **`src/services`** : Contient les services pour les appels API (`api.js`).
- **`public`** : Contient les fichiers publics tels que `index.html`.

### Backend

- **`routes`** : Contient les fichiers de routes pour les différentes API endpoints.
- **`controllers`** : (Si présent) Contient la logique métier pour les routes.
- **`models`** : (Si présent) Contient les définitions des modèles de données.
- **`docs`** : Contient la documentation de l'API (`swagger.yaml`).
- **`index.js`** : Point d'entrée du serveur Express.

## Technologies Utilisées

### Frontend

- **React** : 18.x - Bibliothèque JavaScript pour construire des interfaces utilisateur.
- **Ant Design** : 4.x - Bibliothèque de composants UI pour React.
- **React Router** : 6.x - Gestion des routes côté frontend.
- **Axios** : 0.27.x - Client HTTP pour effectuer des requêtes vers l'API backend.

### Backend

- **Node.js** : 20.x - Environnement d'exécution JavaScript côté serveur.
- **Express** : 4.x - Framework web pour Node.js.
- **Swagger UI Express** : 4.x - Interface pour la documentation interactive de l'API.
- **Cors** : 2.x - Middleware pour activer CORS (Cross-Origin Resource Sharing).

## Guide d'Utilisation

### Recherche par Nom

1. Accédez à la page de recherche via le frontend.
2. Entrez un nom ou partie du nom dans le champ de saisie.
3. Cliquez sur le bouton "Rechercher".
4. Les résultats s'affichent avec les propriétés et le type d’entité.
5. On peut sauvegarder les résultats de la recherche dans un pdf.
6. En cliquant sur le caption, on arrive sur l'onglet recherche par Id et de là, on peut visualiser tout le détail et l'imprimer dans un pdf ou Excel.

### Détails d'une Entité

1. Cliquez sur le lien d'une entité dans les résultats de recherche.
2. Vous serez redirigé vers la page de détails de l'entité, affichant toutes les informations pertinentes.
3.En cliquant sur le caption, on arrive sur l'onglet recherche par Id et de là, on peut visualiser tout le détail et l'imprimer dans un pdf.



## Documentation de l'API

L'API backend fournit plusieurs endpoints pour gérer les entités.

### Base URL

```plaintext
http://localhost:5000/api
```

### Endpoints Disponibles

#### 1. **Recherche d'Entités**

- **URL** : `/search`
- **Méthode** : `GET`
- **Paramètres de Requête** :
  - `query` : Chaîne de caractères représentant le critère de recherche.
- **Réponse** :
  - `200 OK` : Retourne un objet contenant les résultats de la recherche.
  - `500 Internal Server Error` : Erreur serveur lors de la recherche.

- **Exemple de Requête** :

  ```bash
  curl "http://localhost:5000/api/search?query=nom_ou_critere"
  ```

#### 2. **Récupérer une Entité par ID**

- **URL** : `/entities/:id`
- **Méthode** : `GET`
- **Paramètres de l'URL** :
  - `id` : Identifiant unique de l'entité.
- **Réponse** :
  - `200 OK` : Retourne les détails de l'entité.
  - `404 Not Found` : Entité non trouvée.
  - `500 Internal Server Error` : Erreur serveur lors de la récupération.

- **Exemple de Requête** :

  ```bash
  curl "http://localhost:5000/api/entities/123"
  ```

### Exemple de Réponse

#### **Recherche d'Entités**

```json
{
  "results": [
    {
      "id": "123",
      "caption": "Entité Exemple",
      "schema": "TypeEntite",
      "properties": {
        "Propriété1": "Valeur1",
        "Propriété2": "Valeur2"
      }
    }
    // ...
  ]
}
```

#### **Récupérer une Entité par ID**

```json
{
  "id": "123",
  "caption": "Entité Exemple",
  "schema": "TypeEntite",
  "properties": {
    "Propriété1": "Valeur1",
    "Propriété2": "Valeur2"
  },
  "referents": ["ref1", "ref2"],
  "datasets": ["dataset1", "dataset2"],
  "first_seen": "2023-01-01",
  "last_seen": "2023-06-01",
  "last_change": "2023-06-15",
  "target": true
}
```

### Documentation Interactive de l'API

Swagger est intégré pour fournir une documentation interactive de votre API. Après avoir démarré le serveur backend, accédez à [http://localhost:5000/api-docs](http://localhost:5000/api-docs).

## Guide de Développement

### Bonnes Pratiques

- **Consistance du Code** : Suivez les conventions de nommage et les standards de codage (ESLint, Prettier).
- **Modularité** : Organisez le code en modules réutilisables.
- **Documentation du Code** : Utilisez des commentaires clairs et concis pour expliquer la logique complexe.

### Ajouter une Nouvelle Fonctionnalité

1. **Créer une Nouvelle Branche**

   ```bash
   git checkout -b nom-de-la-fonctionnalité
   ```

2. **Développer la Fonctionnalité**

   - Modifiez ou ajoutez les composants nécessaires.
   - Ajoutez les routes et les contrôleurs backend si nécessaire.
   - Testez localement.

3. **Committer les Changements**

   ```bash
   git add .
   git commit -m "feat: description de la fonctionnalité"
   ```

4. **Pousser la Branche**

   ```bash
   git push origin nom-de-la-fonctionnalité
   ```

5. **Créer une Pull Request**

   - Allez sur GitHub.
   - Ouvrez une Pull Request depuis votre branche vers `main`.
   - Demandez une revue de code si nécessaire.

6. **Fusionner la Pull Request**

   Une fois approuvée, fusionnez la Pull Request et supprimez la branche.

## Tests

### Exécuter les Tests

#### Backend

```bash
cd backend
npm test
```

#### Frontend

```bash
cd frontend
npm test
```

### Types de Tests

- **Unitaires** : Tests des composants individuels et des fonctions.
- **Intégration** : Tests des interactions entre différents modules.
- **End-to-End (E2E)** : Tests de l'application complète du point de vue de l'utilisateur.

### Ajouter des Tests

- Utilisez **Jest** et **React Testing Library** pour les tests frontend.
- Utilisez **Mocha** ou **Jest** pour les tests backend.

## Déploiement

### Préparer l'Application pour la Production

#### Frontend

Générez une version optimisée de l'application :

```bash
cd frontend
npm run build
```

**Note :** En production, utilisez la commande `start:legacy` pour démarrer le frontend :

```bash
npm run start:legacy
```

Cela évite l'erreur `ERR_OSSL_EVP_UNSUPPORTED` en utilisant le fournisseur OpenSSL hérité.

#### Backend

Assurez-vous que toutes les variables d'environnement sont correctement configurées pour la production.

### Déployer sur un Serveur

- **Frontend** : Hébergez le dossier `frontend/build` sur un serveur web comme **Netlify**, **Vercel**, ou **AWS S3**.
- **Backend** : Déployez le backend sur un serveur comme **Heroku**, **AWS EC2**, ou **DigitalOcean**.

### Configuration de l'Environnement de Production

- **Variables d'Environnement** : Configurez les variables nécessaires (par exemple, `PORT`, `DATABASE_URL`, etc.).
- **Sécurité** : Assurez-vous que les communications sont sécurisées (HTTPS).

### Automatisation du Déploiement

Utilisez des outils comme **GitHub Actions** pour automatiser les pipelines de déploiement.

## Contribuer

Les contributions sont les bienvenues ! Suivez ces étapes pour contribuer à ce projet.

### 1. Fork le Dépôt

Cliquez sur le bouton "Fork" en haut à droite de la page du dépôt GitHub.

### 2. Cloner le Dépôt Forké

```bash
git clone https://github.com/VOTRE_UTILISATEUR/kyc-application-.git
cd kyc-application-
```

### 3. Créer une Nouvelle Branche

```bash
git checkout -b nom-de-la-fonctionnalité
```

### 4. Développer et Committer

```bash
git add .
git commit -m "feat: description de la fonctionnalité"
```

### 5. Pousser la Branche

```bash
git push origin nom-de-la-fonctionnalité
```

### 6. Créer une Pull Request

Allez sur GitHub et créez une Pull Request depuis votre branche vers le dépôt original.

## FAQ

**Q1 : Pourquoi utiliser `npm run start:legacy` pour le frontend ?**

**R1 :** En raison d'une incompatibilité avec certaines versions de Node.js, cette commande configure Node.js pour utiliser le fournisseur OpenSSL hérité, évitant ainsi l'erreur `ERR_OSSL_EVP_UNSUPPORTED`.

**Q2 : Comment ajouter une nouvelle propriété aux entités ?**

**R2 :** Ajoutez la nouvelle propriété dans le backend sous le modèle approprié, puis mettez à jour les composants frontend pour l'afficher correctement.

**Q3 : Comment accéder à la documentation interactive de l'API ?**

**R3 :** Après avoir démarré le serveur backend, accédez à [http://localhost:5000/api-docs](http://localhost:5000/api-docs).

## Licence

Ce projet est sous licence [Apache-2.0](LICENSE).

## Acknowledgments

- **Ant Design** pour sa bibliothèque de composants React riche et intuitive.
- **Node.js** et **Express** pour leur robustesse en backend.
- **React Router** pour la gestion des routes côté frontend.
- **Anne D.** pour son aide précieuse dans les spécifications de cette application.

---
```
