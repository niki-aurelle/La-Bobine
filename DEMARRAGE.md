# La Bobine — Guide de démarrage

## Prérequis

- Node.js 18+
- npm ou yarn
- MongoDB (local ou Atlas)
- Expo CLI (`npm install -g expo-cli`)
- Un téléphone Android/iOS avec Expo Go, ou un émulateur

---

## 1. Backend (Node.js)

```bash
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# → Éditer .env : renseigner MONGODB_URI et JWT_SECRET

# Démarrer en développement
npm run dev

# L'API tourne sur http://localhost:3000
# Tester : GET http://localhost:3000/health
```

---

## 2. Mobile (Expo)

```bash
cd mobile

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# → Éditer .env : renseigner EXPO_PUBLIC_API_URL

# Démarrer Expo
npm start

# Scanner le QR code avec Expo Go
# ou appuyer sur 'a' pour Android, 'i' pour iOS
```

---

## 3. Module IA (optionnel)

Pour activer la retouche photo avec OpenAI :

1. Obtenir une clé API sur https://platform.openai.com
2. Dans `backend/.env` :
   ```
   OPENAI_API_KEY=sk-...votre_cle...
   AI_PROVIDER=openai
   ```

Pour un upscaling avancé (futur), changer `AI_PROVIDER=replicate`.

---

## Structure du projet

```
La-Bobine/
├── backend/          Node.js + Express + MongoDB
│   ├── server.js     Point d'entrée
│   ├── src/
│   │   ├── app.js           Express app + middlewares
│   │   ├── config/          DB, multer
│   │   ├── models/          Mongoose schemas
│   │   ├── controllers/     Logique HTTP
│   │   ├── routes/          Endpoints REST
│   │   ├── middlewares/     Auth, upload, erreurs
│   │   ├── services/ai/     Couche IA abstraite
│   │   └── utils/           Logger, ApiError, asyncWrapper
│   └── uploads/      Fichiers uploadés (auto-créé)
│
└── mobile/           React Native + Expo
    ├── App.tsx        Point d'entrée
    ├── src/
    │   ├── screens/   Tous les écrans
    │   ├── components/Composants réutilisables
    │   ├── navigation/Navigateurs (Root, Tabs, Stacks)
    │   ├── services/  Appels API (axios)
    │   ├── store/     État global (Zustand)
    │   ├── types/     TypeScript interfaces
    │   ├── constants/ Couleurs, tailles
    │   └── utils/     Dates, devises
    └── assets/        Images, icônes (à ajouter)
```

---

## API Routes principales

| Route | Description |
|---|---|
| POST /api/auth/register | Inscription |
| POST /api/auth/login | Connexion |
| GET  /api/dashboard | Tableau de bord |
| GET  /api/clients | Liste clientes |
| POST /api/clients | Créer cliente |
| GET  /api/orders | Liste commandes |
| POST /api/orders | Créer commande |
| POST /api/orders/:id/payments | Ajouter paiement |
| POST /api/photos/upload | Upload photo |
| POST /api/ai/photo-enhance | Retouche IA |
| GET  /api/ai/jobs/:id | Statut job IA |

---

## Phases de développement suivantes

- **Phase 2** : Compléter CRUD complet (clientes, mesures)
- **Phase 3** : Commandes + paiements + essayages
- **Phase 4** : Agenda + notifications push
- **Phase 5** : Galerie + upload multi-photos
- **Phase 6** : IA retouche (brancher Replicate pour upscaling réel)
- **Phase 7** : Stock + dashboard enrichi
- **Phase 8** : Tests, optimisations, déploiement
