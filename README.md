# 🧵 La Bobine

> Application mobile de gestion d'activité pour couturière indépendante.

---

## Sommaire

1. [Le projet](#1-le-projet)
2. [Technologies utilisées](#2-technologies-utilisées)
3. [Architecture générale](#3-architecture-générale)
4. [Backend — structure détaillée](#4-backend--structure-détaillée)
5. [Frontend mobile — structure détaillée](#5-frontend-mobile--structure-détaillée)
6. [Module IA](#6-module-ia)
7. [Flux de données](#7-flux-de-données)
8. [Démarrage rapide](#8-démarrage-rapide)

---

## 1. Le projet

### Contexte

Une couturière indépendante gère son activité avec des outils inadaptés : carnet papier pour les mesures, messagerie pour les commandes, téléphone pour les photos. Rien n'est centralisé, rien n'est fiable.

**La Bobine** est l'application qui centralise tout cela en un seul endroit, sur son téléphone.

### Ce que fait l'application

| Domaine | Ce que la couturière peut faire |
|---|---|
| **Clientes** | Créer des fiches, enregistrer les contacts, ajouter des notes |
| **Mesures** | Saisir les mesures du corps, les retrouver, voir l'historique |
| **Commandes** | Créer une commande, y associer une cliente, suivre l'avancement |
| **Paiements** | Enregistrer les acomptes et paiements, voir ce qui reste dû |
| **Essayages** | Planifier et noter les ajustements à faire |
| **Agenda** | Visualiser tous les rendez-vous à venir |
| **Livraisons** | Suivre les dates, détecter les retards |
| **Galerie** | Stocker et retrouver les photos de créations |
| **IA** | Améliorer automatiquement la qualité des photos |
| **Stock** | Suivre les matières, alertes quand un stock est bas |

### Philosophie de conception

L'application est pensée pour une utilisatrice **non-technique**, qui travaille seule, souvent les mains occupées. Chaque écran a un objectif unique, les boutons sont grands, la navigation est simple. L'IA est un bonus invisible — elle améliore les photos sans que l'utilisatrice ait besoin de comprendre ce qui se passe.

---

## 2. Technologies utilisées

### Backend

| Technologie | Rôle |
|---|---|
| **Node.js** | Environnement d'exécution JavaScript côté serveur |
| **Express.js** | Framework HTTP pour construire l'API REST |
| **MongoDB** | Base de données NoSQL orientée documents (JSON) |
| **Mongoose** | ODM (Object Document Mapper) : fait le lien entre le code et MongoDB |
| **JSON Web Token (JWT)** | Authentification stateless : chaque requête porte un token signé |
| **bcryptjs** | Hachage des mots de passe avant stockage |
| **Multer** | Gestion des uploads de fichiers (images) |
| **Sharp** | Traitement d'images côté serveur (redimensionnement, netteté, contraste) |
| **OpenAI SDK** | Appel à l'API GPT-4o pour l'analyse et l'amélioration de photos |
| **Joi** | Validation des données entrantes (body, params) |
| **Helmet** | En-têtes HTTP de sécurité |
| **express-rate-limit** | Protection contre les attaques par force brute |
| **Winston** | Logging structuré (console + fichiers) |
| **CORS** | Autorisation des appels cross-origin depuis l'application mobile |
| **dotenv** | Chargement des variables d'environnement depuis `.env` |

### Mobile

| Technologie | Rôle |
|---|---|
| **React Native** | Framework pour construire des interfaces mobiles natives avec JavaScript |
| **Expo** | Surcouche de React Native qui simplifie le build, l'accès aux APIs natives et le déploiement |
| **TypeScript** | Typage statique : réduit les bugs, améliore la compréhension du code |
| **React Navigation** | Navigation entre les écrans (tabs, stacks, modals) |
| **Axios** | Client HTTP pour communiquer avec le backend |
| **Zustand** | Gestion d'état global minimaliste (authentification, toasts) |
| **Expo SecureStore** | Stockage sécurisé du token JWT sur l'appareil (équivalent du trousseau) |
| **Expo Image Picker** | Accès à la galerie photo et à la caméra du téléphone |
| **Expo Notifications** | Notifications push locales et distantes |
| **date-fns** | Manipulation et formatage des dates en français |

---

## 3. Architecture générale

```
┌─────────────────────────────────────────────────────────────────┐
│                        Téléphone (Expo)                         │
│                                                                 │
│   Écrans  →  Services  →  Axios  →  JWT dans les en-têtes      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / JSON
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API REST (Express.js)                         │
│                                                                 │
│   Routes  →  Middleware Auth  →  Controllers  →  Services       │
└────────┬────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌────────────────┐                 ┌──────────────────────────┐
│    MongoDB     │                 │    Fournisseur IA        │
│   (données)    │                 │  OpenAI / Replicate /... │
└────────────────┘                 └──────────────────────────┘
```

Le mobile ne parle qu'au backend. Le backend est le seul à toucher la base de données et les APIs externes (IA). Ce cloisonnement protège les clés API et centralise la logique métier.

---

## 4. Backend — structure détaillée

```
backend/
├── server.js                   ← Point d'entrée
├── .env.example                ← Variables d'environnement à configurer
├── package.json
└── src/
    ├── app.js                  ← Création et configuration de l'app Express
    ├── config/
    │   ├── db.js               ← Connexion à MongoDB
    │   └── multer.js           ← Création des dossiers uploads/ et logs/
    ├── models/                 ← Schémas Mongoose (structure de la base)
    ├── controllers/            ← Logique HTTP (reçoit req, retourne res)
    ├── routes/                 ← Déclaration des endpoints REST
    ├── middlewares/            ← Fonctions intermédiaires (auth, upload, erreurs)
    ├── services/ai/            ← Couche IA abstraite
    ├── validators/             ← Schémas de validation Joi
    └── utils/                  ← Outils transversaux
```

---

### `server.js` — Point d'entrée

C'est le fichier qui démarre tout. Il charge les variables d'environnement, crée les dossiers nécessaires, connecte la base de données, puis met l'application Express en écoute sur le port configuré.

```
server.js
  └── charge .env
  └── crée uploads/ et logs/
  └── connecte MongoDB (config/db.js)
  └── démarre Express sur le PORT
```

---

### `src/app.js` — Application Express

C'est ici que l'application HTTP est construite et configurée. Elle assemble tous les middlewares globaux et branche toutes les routes.

**Ce qu'il fait dans l'ordre :**
1. Active Helmet (sécurité des en-têtes HTTP)
2. Active CORS (autorise les appels depuis le mobile)
3. Active le rate limiting (max 200 requêtes / 15 min)
4. Active la compression gzip des réponses
5. Parse les corps JSON et form-data
6. Active les logs HTTP avec Morgan
7. Sert les fichiers statiques depuis `uploads/`
8. Branche toutes les routes sous `/api/...`
9. Retourne 404 si aucune route ne correspond
10. Passe au gestionnaire d'erreurs global

---

### `src/config/`

| Fichier | Utilité |
|---|---|
| `db.js` | Ouvre la connexion MongoDB avec Mongoose. Si la connexion échoue, le processus s'arrête immédiatement (on ne veut pas d'une API qui tourne sans base de données). |
| `multer.js` | Crée les dossiers `uploads/`, `uploads/enhanced/` et `logs/` s'ils n'existent pas. Exécuté au démarrage avant tout. |

---

### `src/models/` — Schémas Mongoose

Un modèle Mongoose définit la **structure d'une collection MongoDB** : quels champs existent, quels types ils ont, quelles valeurs sont obligatoires, quels index accélèrent les recherches.

| Modèle | Collection | Rôle métier |
|---|---|---|
| `User.js` | `users` | Compte de la couturière. Contient le hachage du mot de passe (jamais le mot de passe en clair), les préférences (devise, langue, notifications). |
| `Client.js` | `clients` | Fiche d'une cliente. Prénom, nom, téléphone, ville, notes. Lié à un `User` (chaque couturière ne voit que ses propres clientes). |
| `Measurement.js` | `measurements` | Un jeu de mesures corporelles pour une cliente à une date donnée. Contient les mesures standard (tour de poitrine, taille, hanches...) et un tableau de mesures personnalisées libres. |
| `Order.js` | `orders` | Une commande de vêtement. Liée à une cliente. Contient le type de vêtement, le tissu, le prix total, l'acompte, le statut (draft → confirmed → in_progress → fitting → ready → delivered), les dates. La référence (`CMD-2024-001`) est auto-générée. |
| `Fitting.js` | `fittings` | Un essayage planifié pour une commande. Date, remarques, ajustements à faire, numéro de l'essayage (1er, 2e...). |
| `Payment.js` | `payments` | Un paiement reçu pour une commande. Montant, type (acompte / partiel / solde / total), moyen de paiement, date. Le reste dû est calculé dynamiquement, jamais stocké (évite les incohérences). |
| `Appointment.js` | `appointments` | Un rendez-vous dans l'agenda. Peut être lié à une cliente et/ou une commande. Types : essayage, livraison, consultation, retrait, autre. |
| `Delivery.js` | `deliveries` | Le suivi de la livraison d'une commande. Date prévue, date effective, statut (pending / delivered / late / cancelled). Créé automatiquement quand une commande a une date de livraison. |
| `Photo.js` | `photos` | Une photo stockée sur le serveur. Peut être associée à une commande et/ou une cliente. Marquable comme "portfolio". Sait si elle a été améliorée par l'IA. |
| `AIJob.js` | `ai_jobs` | Un travail de retouche IA. Suit le cycle de vie du traitement : pending → processing → done / failed. Stocke l'URL de l'image originale et le résultat. |
| `InventoryItem.js` | `inventory` | Un article de stock (tissu, fil, bouton...). Quantité actuelle, seuil minimum, alerte calculée automatiquement (`isLow`). |

**Principe de sécurité multi-tenant :** chaque modèle contient un champ `user` qui référence le compte de la couturière. Toutes les requêtes filtrent sur `{ user: req.user._id }` — une couturière ne peut jamais voir les données d'une autre.

---

### `src/controllers/` — Logique HTTP

Un controller reçoit une requête HTTP, appelle les modèles ou services nécessaires, et retourne une réponse JSON. Il ne contient pas de logique métier complexe — c'est un coordinateur.

| Controller | Responsabilités principales |
|---|---|
| `authController.js` | Inscription, connexion (vérification mot de passe + génération JWT), récupération du profil, modification du profil, changement de mot de passe. |
| `clientController.js` | CRUD clientes avec recherche textuelle et pagination. Récupération des mesures d'une cliente, ajout et modification de mesures. |
| `orderController.js` | CRUD commandes. Changement de statut (avec mise à jour automatique de la livraison si `delivered`). Ajout de paiements avec vérification que le montant ne dépasse pas le reste dû. Ajout d'essayages avec auto-incrémentation du numéro. |
| `appointmentController.js` | CRUD rendez-vous avec filtrage par date, type et statut. |
| `photoController.js` | Liste avec filtres (par commande, cliente, portfolio). Upload d'une photo avec sauvegarde en base. Mise à jour (caption, tags, isPortfolio). |
| `aiController.js` | Lance un job IA (upload → création `AIJob` → traitement asynchrone). Retourne immédiatement un `jobId` (HTTP 202). Le client mobile poll ensuite `GET /ai/jobs/:id` pour connaître l'état. |
| `dashboardController.js` | Agrège en une seule requête : nombre de clientes, commandes en cours, commandes en retard, livraisons pendantes, prochains RDV, revenu du mois, commandes récentes. |
| `inventoryController.js` | CRUD stock. Route spéciale `PUT /inventory/:id/adjust` pour ajouter ou retirer une quantité (delta positif ou négatif). |

---

### `src/routes/` — Endpoints REST

Chaque fichier de routes déclare les URLs disponibles pour une ressource et les associe à un controller. C'est ici que les middlewares spécifiques (authentification, upload) sont appliqués.

| Fichier | Préfixe | Endpoints clés |
|---|---|---|
| `auth.js` | `/api/auth` | POST /register, POST /login, GET /me, PUT /me, PUT /me/password |
| `clients.js` | `/api/clients` | GET /, POST /, GET /:id, PUT /:id, DELETE /:id, GET /:id/measurements, POST /:id/measurements |
| `orders.js` | `/api/orders` | GET /, POST /, GET /:id, PUT /:id, PUT /:id/status, POST /:id/payments, GET /:id/fittings, POST /:id/fittings |
| `appointments.js` | `/api/appointments` | GET /, POST /, PUT /:id, DELETE /:id |
| `photos.js` | `/api/photos` | GET /, POST /upload (multipart), PUT /:id, DELETE /:id |
| `ai.js` | `/api/ai` | POST /photo-enhance (multipart), GET /jobs, GET /jobs/:id |
| `dashboard.js` | `/api/dashboard` | GET / |
| `deliveries.js` | `/api/deliveries` | GET /, PUT /:id |
| `inventory.js` | `/api/inventory` | GET /, POST /, PUT /:id, DELETE /:id, PUT /:id/adjust |

Toutes les routes (sauf `/auth/register` et `/auth/login`) sont protégées par le middleware `authenticate`.

---

### `src/middlewares/` — Fonctions intermédiaires

Les middlewares sont des fonctions qui s'exécutent **entre** la réception de la requête et l'appel au controller. Ils peuvent modifier la requête, l'arrêter (en cas d'erreur), ou la laisser passer.

| Middleware | Ce qu'il fait |
|---|---|
| `auth.js` | Extrait le token JWT du header `Authorization: Bearer ...`. Le vérifie avec la clé secrète. Charge l'utilisateur depuis la base. Si tout est valide, injecte `req.user` pour que le controller sache qui fait la requête. Sinon, retourne 401. |
| `upload.js` | Configure Multer pour accepter les fichiers image (JPEG, PNG, WebP, HEIC) jusqu'à 10 Mo. Génère un nom de fichier unique pour éviter les collisions. Rejette les types de fichiers non autorisés. |
| `validate.js` | Reçoit un schéma Joi. Valide `req.body` (ou `req.params`). Si invalide, retourne 400 avec la liste des erreurs. Si valide, remplace `req.body` par la version nettoyée (suppression des champs inconnus). |
| `errorHandler.js` | Gestionnaire d'erreurs global. Intercepte toutes les erreurs non traitées. Traduit les erreurs Mongoose (validation, duplicate, cast) en réponses HTTP lisibles. Distingue les erreurs opérationnelles (attendues) des bugs (inattendus). |

---

### `src/utils/` — Outils transversaux

| Utilitaire | Ce qu'il fait |
|---|---|
| `ApiError.js` | Classe d'erreur personnalisée avec un `statusCode`. Expose des méthodes statiques : `ApiError.notFound()`, `ApiError.unauthorized()`, `ApiError.badRequest()`, etc. Permet au gestionnaire d'erreurs de distinguer les erreurs intentionnelles des bugs. |
| `asyncWrapper.js` | Enveloppe une fonction `async` dans un try/catch qui passe automatiquement les erreurs au middleware suivant (donc à `errorHandler`). Évite de répéter `try/catch` dans chaque controller. |
| `logger.js` | Instance Winston configurée avec deux transports : console (colorée en dev) et fichiers (`logs/error.log`, `logs/combined.log`). Utilisé partout dans l'application pour les logs d'info, d'erreur et de trafic HTTP. |

---

### `src/services/ai/` — Couche IA

C'est la partie la plus architecturée du backend. Elle est conçue pour être **indépendante du fournisseur IA** : changer d'IA = changer une variable d'environnement.

```
services/ai/
├── AIProvider.js           ← Interface abstraite (contrat)
├── AIServiceFactory.js     ← Sélection du provider selon AI_PROVIDER
├── AIJobService.js         ← Orchestration du cycle de vie d'un job
└── providers/
    ├── OpenAIProvider.js   ← Implémentation avec Sharp + GPT-4o optionnel
    └── ReplicateProvider.js← Stub prêt pour Real-ESRGAN ou autre modèle
```

**`AIProvider.js`** définit l'interface que tout provider doit respecter : une méthode `enhance(inputPath, options)` qui retourne `{ outputPath, outputUrl, metadata }`. C'est un contrat, pas une implémentation.

**`AIServiceFactory.js`** lit la variable `AI_PROVIDER` dans l'environnement et instancie le bon provider. Si on veut passer de OpenAI à Replicate, on change `.env` et on redémarre. Zéro modification de code.

**`OpenAIProvider.js`** fait deux choses :
1. Amélioration locale via **Sharp** : netteté, luminosité, contraste, saturation — rapide et gratuit.
2. Analyse optionnelle via **GPT-4o Vision** : description textuelle du vêtement — utile pour générer des légendes de portfolio.

**`AIJobService.js`** orchestre le cycle de vie complet : met le job en `processing`, appelle le provider, met à jour le résultat en `done` ou `failed`, met à jour la photo associée.

**Flux asynchrone :** l'API répond immédiatement avec HTTP 202 et un `jobId`. Le traitement se fait en arrière-plan. Le mobile poll `GET /ai/jobs/:id` toutes les 2 secondes jusqu'à ce que le statut soit `done` ou `failed`.

---

## 5. Frontend mobile — structure détaillée

```
mobile/
├── App.tsx                     ← Point d'entrée React Native
├── app.json                    ← Configuration Expo (icône, splash, permissions)
├── babel.config.js             ← Configuration du transpileur
├── tsconfig.json               ← Configuration TypeScript
└── src/
    ├── constants/              ← Valeurs figées réutilisables
    ├── types/                  ← Interfaces TypeScript (modèles métier)
    ├── navigation/             ← Structure de navigation
    ├── screens/                ← Un dossier par domaine métier
    ├── components/             ← Composants UI réutilisables
    ├── services/               ← Appels HTTP vers le backend
    ├── store/                  ← État global (Zustand)
    └── utils/                  ← Fonctions utilitaires pures
```

---

### `App.tsx` — Point d'entrée

Démarre l'application. Enveloppe tout dans `GestureHandlerRootView` (requis par React Navigation) et cache l'écran de chargement natif. Rend le `RootNavigator`.

---

### `src/constants/` — Valeurs centralisées

Toutes les valeurs visuelles sont définies ici une seule fois. Si on veut changer la couleur principale de l'application, on modifie un seul fichier.

**`colors.ts`** — Palette complète de l'application :
- Couleurs primaires (terre cuite, caramel — tons chauds artisanaux)
- Couleurs de statut pour les commandes (une couleur par statut)
- Couleurs sémantiques (success, warning, error, info)
- Couleurs de fond, texte, bordure, overlay

**`sizes.ts`** — Système d'espacement et de taille :
- Espacements (xs à xxl) utilisés pour tous les `padding` et `gap`
- Tailles de police (fontXs à fontTitle)
- Rayons de bordure (radiusSm à radiusFull)
- Hauteurs de boutons et d'inputs

---

### `src/types/index.ts` — Interfaces TypeScript

Définit la forme de **chaque objet métier** utilisé dans l'application. Ces interfaces correspondent exactement aux schémas Mongoose du backend. TypeScript vérifie à la compilation que le code manipule correctement ces objets.

Exemples : `User`, `Client`, `Measurement`, `Order`, `OrderStatus`, `Payment`, `Fitting`, `Appointment`, `Delivery`, `Photo`, `AIJob`, `InventoryItem`, `DashboardData`, `ApiResponse<T>`, `PaginatedResponse<T>`.

---

### `src/navigation/` — Structure de navigation

La navigation est organisée en couches. Chaque couche a un rôle précis.

```
RootNavigator
│
├── [Non connecté] AuthStack
│   ├── LoginScreen
│   └── RegisterScreen
│
└── [Connecté] MainTabNavigator  (barre de tabs en bas)
    ├── Tab "Accueil"   → DashboardScreen
    ├── Tab "Clientes"  → ClientsStack
    │   ├── ClientsListScreen
    │   ├── ClientDetailScreen
    │   ├── ClientFormScreen
    │   └── MeasurementsScreen
    ├── Tab "Commandes" → OrdersStack
    │   ├── OrdersListScreen
    │   ├── OrderDetailScreen
    │   └── OrderFormScreen
    ├── Tab "Agenda"    → AgendaScreen
    └── Tab "Plus"      → MoreStack
        ├── MoreMenuScreen
        ├── GalleryScreen
        ├── AIPhotoScreen
        ├── DeliveriesScreen
        ├── StockScreen
        ├── PaymentsScreen
        └── SettingsScreen
```

**`RootNavigator`** lit le token JWT dans le store. S'il existe → écrans connectés. Sinon → écrans d'auth. La transition est automatique : dès que l'utilisateur se connecte (token ajouté au store), React Navigation bascule vers les écrans principaux sans aucun code supplémentaire.

**`MainTabNavigator`** affiche la barre d'onglets en bas. Chaque onglet a son propre stack de navigation indépendant (on peut naviguer en profondeur dans "Clientes" sans perdre la position dans "Commandes").

---

### `src/screens/` — Les écrans

Un écran = une page de l'application. Organisés par domaine métier.

| Écran | Ce qu'il affiche | Actions principales |
|---|---|---|
| `auth/LoginScreen` | Formulaire email + mot de passe | Se connecter, aller à l'inscription |
| `auth/RegisterScreen` | Formulaire de création de compte | Créer un compte avec nom, email, atelier |
| `DashboardScreen` | Statistiques clés, prochains RDV, commandes récentes | Rafraîchir, voir les détails |
| `clients/ClientsListScreen` | Liste des clientes avec recherche | Chercher, sélectionner, créer |
| `clients/ClientDetailScreen` | Fiche complète d'une cliente | Appeler, WhatsApp, modifier, voir mesures |
| `clients/ClientFormScreen` | Formulaire de création/édition | Sauvegarder ou annuler |
| `clients/MeasurementsScreen` | Mesures corporelles par jeu de mesures | Naviguer entre les jeux historiques |
| `orders/OrdersListScreen` | Liste filtrée des commandes | Filtrer par statut, créer, sélectionner |
| `orders/OrderDetailScreen` | Détail complet : statut, paiements, essayages, dates | Avancer le statut, voir les paiements |
| `orders/OrderFormScreen` | Formulaire de commande | Associer cliente, saisir le vêtement et le prix |
| `AgendaScreen` | Liste des prochains rendez-vous | Rafraîchir |
| `GalleryScreen` | Grille de photos | Uploader depuis la galerie |
| `ai/AIPhotoScreen` | Interface de retouche IA | Choisir photo, lancer l'IA, voir le résultat |
| `DeliveriesScreen` | Liste des livraisons | Marquer comme livrée |
| `StockScreen` | Articles en stock avec alertes | Filtrer les stocks bas |
| `PaymentsScreen` | Historique des paiements | Voir les montants et dates |
| `SettingsScreen` | Paramètres profil et préférences | Modifier le nom, la devise, les notifications |
| `MoreMenuScreen` | Menu de navigation secondaire | Accéder aux modules secondaires |

---

### `src/components/` — Composants réutilisables

Ce sont des briques UI utilisées dans plusieurs écrans. Définies une fois, cohérentes partout.

| Composant | Ce qu'il fait |
|---|---|
| `Button.tsx` | Bouton configurable : 5 variantes visuelles (primary, outline, ghost, danger, secondary), 3 tailles, état loading avec spinner, icône optionnelle. |
| `Input.tsx` | Champ de saisie avec label, icône gauche/droite, message d'erreur, indicateur de validation, mode mot de passe avec toggle visibilité. |
| `Card.tsx` | Conteneur blanc avec ombre légère et coins arrondis. Accepte un `padding` configurable. Utilisé pour regrouper visuellement des informations. |
| `Badge.tsx` | Étiquette colorée. Version générique et version spécialisée `OrderStatusBadge` qui traduit automatiquement le statut (`in_progress` → "En cours", couleur orange). |
| `EmptyState.tsx` | Écran vide : icône, titre, sous-titre, bouton d'action optionnel. Affiché quand une liste est vide pour guider l'utilisatrice. |
| `ScreenContainer.tsx` | Enveloppe standard d'un écran : SafeAreaView + ScrollView + pull-to-refresh. Évite de répéter ce code dans chaque écran. |

---

### `src/services/` — Communication avec le backend

Les services sont la **couche réseau** de l'application. Ils encapsulent tous les appels HTTP. Les écrans ne manipulent jamais Axios directement.

**`api.ts`** — Instance Axios partagée :
- `baseURL` configurée depuis `EXPO_PUBLIC_API_URL`
- Intercepteur de requête : lit le token JWT dans SecureStore et l'injecte automatiquement dans le header `Authorization`
- Intercepteur de réponse : normalise les erreurs (extrait le message lisible), détecte les 401 (session expirée) et efface le token automatiquement

**`authService.ts`** — Authentification :
- `login()` : appelle `POST /auth/login`, stocke le token dans SecureStore
- `register()` : appelle `POST /auth/register`, stocke le token
- `logout()` : efface le token du SecureStore
- `getStoredToken()` : lit le token au démarrage pour restaurer la session

**`clientService.ts`** — Gestion des clientes :
- `list()` avec paramètres de recherche et pagination
- `create()`, `getOne()`, `update()`, `remove()`
- `getMeasurements()`, `addMeasurement()`, `updateMeasurement()`

**`orderService.ts`** — Gestion des commandes :
- `list()` avec filtre par statut
- `create()`, `getOne()`, `update()`, `updateStatus()`
- `addPayment()` retourne le paiement ET la balance mise à jour
- `addFitting()`, `listFittings()`

**`aiService.ts`** — Module IA :
- `enhancePhoto()` : construit un `FormData` avec l'image, appelle `POST /ai/photo-enhance`, retourne le `jobId`
- `getJobStatus()` : consulte `GET /ai/jobs/:id`
- `pollJobUntilDone()` : appelle `getJobStatus()` toutes les 2 secondes jusqu'à résolution ou échec. Accepte un callback `onUpdate` pour mettre à jour l'UI en temps réel.

---

### `src/store/` — État global (Zustand)

Zustand est choisi pour sa simplicité : pas de boilerplate, pas de Provider, pas de `useSelector`. On accède au store directement avec un hook.

**`authStore.ts`** — État d'authentification :
- Stocke `user` (objet User) et `token` (string JWT)
- Actions : `login()`, `register()`, `logout()`, `restoreSession()`, `updateUser()`
- `restoreSession()` est appelée au démarrage de l'app : lit le token en SecureStore, appelle `GET /auth/me` pour récupérer l'utilisateur, restaure la session silencieusement

**`appStore.ts`** — État applicatif global :
- Gère les toasts (notifications éphémères affichées en bas d'écran)
- `showToast(message, type)` : ajoute un toast, le supprime automatiquement après 3,5 secondes

---

### `src/utils/` — Fonctions utilitaires

Fonctions pures sans état, utilisées dans les écrans et composants.

**`formatDate.ts`** — Formatage des dates en français :
- `formatDate()` : "21/04/2026"
- `formatDateTime()` : "21/04/2026 à 14h30"
- `formatRelative()` : "Aujourd'hui", "Demain", "Hier", "il y a 3 jours"
- `formatShortDate()` : "21 avr"

**`formatCurrency.ts`** — Formatage des montants :
- Support natif FCFA (XAF/XOF) : "25 000 FCFA"
- Autres devises via `Intl.NumberFormat` : "25,00 €", "$25.00"
- Devise par défaut configurée dans le profil utilisateur

---

## 6. Module IA

### Pourquoi cette architecture ?

GPT-4o ne fait pas d'upscaling d'image au sens technique (augmentation de résolution). Mais l'architecture est conçue pour qu'on puisse **brancher n'importe quel service IA** sans toucher au reste du code.

### Ce qui se passe quand on améliore une photo

```
1. Utilisatrice choisit une photo sur son téléphone
2. Mobile envoie la photo en multipart/form-data → POST /api/ai/photo-enhance
3. Backend sauvegarde la photo originale dans uploads/
4. Backend crée un AIJob { status: "pending" } en base
5. Backend répond HTTP 202 avec { jobId } → le mobile n'attend pas
6. En arrière-plan : AIJobService.processAIJob(jobId)
   → provider.enhance(inputPath) est appelé
   → Sharp applique netteté + contraste + luminosité + saturation
   → GPT-4o analyse l'image (optionnel, si AI_PROVIDER=openai)
   → Image résultat sauvegardée dans uploads/enhanced/
   → AIJob mis à jour { status: "done", outputUrl: "..." }
7. Mobile poll GET /api/ai/jobs/:id toutes les 2 secondes
8. Quand status === "done" → affichage de l'image améliorée
```

### Comment changer de provider IA

Dans `backend/.env` :
```
AI_PROVIDER=replicate   # au lieu de openai
REPLICATE_API_TOKEN=r8_...
```

`AIServiceFactory` instancie alors `ReplicateProvider` à la place d'`OpenAIProvider`. Aucune autre modification.

### Fournisseurs prévus

| Provider | Technologie | Cas d'usage |
|---|---|---|
| `openai` | Sharp (local) + GPT-4o (analyse) | MVP, amélioration légère, description textuelle |
| `replicate` | Real-ESRGAN via API Replicate | Upscaling 4x haute qualité (futur) |
| Custom | N'importe quelle API image | Extension future |

---

## 7. Flux de données

### Connexion et persistance de session

```
1. LoginScreen → authService.login(email, password)
2. → POST /api/auth/login
3. ← { token, user }
4. Token stocké dans SecureStore (chiffré sur l'appareil)
5. authStore.token = token → RootNavigator bascule vers MainTabs
6. Au prochain démarrage : App.tsx → authStore.restoreSession()
   → lit token dans SecureStore
   → GET /api/auth/me (vérifie que le token est encore valide)
   → restaure l'utilisateur silencieusement
```

### Création d'une commande

```
1. OrderFormScreen → saisie du formulaire
2. → orderService.create(payload)
3. → POST /api/orders { client, garmentType, totalPrice, estimatedDeliveryDate }
4. orderController.create :
   - Crée l'Order avec référence auto-générée (CMD-2024-001)
   - Crée automatiquement une Delivery si estimatedDeliveryDate fournie
5. ← { success: true, data: order }
6. Navigation vers OrderDetail avec le nouvel orderId
```

### Enregistrement d'un paiement

```
1. OrderDetailScreen → bouton "Ajouter un paiement"
2. → orderService.addPayment(orderId, { amount, type, method })
3. → POST /api/orders/:id/payments
4. orderController.addPayment :
   - Vérifie que amount ≤ reste dû (totalPrice - somme des paiements existants)
   - Crée le Payment
   - Recalcule et retourne la balance
5. ← { data: payment, balance: { totalPrice, totalPaid, remaining } }
6. UI mise à jour avec les nouveaux chiffres
```

---

## 8. Démarrage rapide

### Prérequis

- Node.js 18+
- MongoDB installé localement (ou compte MongoDB Atlas)
- Expo Go sur téléphone (Android ou iOS)

### Backend

```bash
cd backend

# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Ouvrir .env et renseigner :
#   MONGODB_URI=mongodb://localhost:27017
#   JWT_SECRET=une_chaine_tres_longue_et_aleatoire
#   OPENAI_API_KEY=sk-... (optionnel pour le module IA)

# 3. Démarrer le serveur
npm run dev
# → API disponible sur http://localhost:3000
# → Tester : GET http://localhost:3000/health
```

### Mobile

```bash
cd mobile

# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Ouvrir .env et renseigner EXPO_PUBLIC_API_URL :
#   Sur émulateur iOS  : http://localhost:3000/api
#   Sur émulateur Android : http://10.0.2.2:3000/api
#   Sur vrai téléphone : http://192.168.1.XXX:3000/api

# 3. Démarrer Expo
npm start
# Scanner le QR code avec Expo Go
```

### Variables d'environnement importantes

| Variable | Où | Valeur par défaut | Obligatoire |
|---|---|---|---|
| `MONGODB_URI` | backend/.env | — | Oui |
| `JWT_SECRET` | backend/.env | — | Oui |
| `PORT` | backend/.env | 3000 | Non |
| `AI_PROVIDER` | backend/.env | openai | Non |
| `OPENAI_API_KEY` | backend/.env | — | Non (pour IA) |
| `EXPO_PUBLIC_API_URL` | mobile/.env | — | Oui |

---

*La Bobine — conçu pour simplifier le quotidien de celles qui créent.*
