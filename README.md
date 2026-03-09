# 🏥 AuthService — Système d'Authentification MediScan IA

Service d'authentification pour la plateforme MediScan IA.
Gère l'inscription, la connexion, les sessions et les profils des patients et médecins.

---

## 🛠️ Stack Technique

| Technologie | Utilisation |
|-------------|-------------|
| NestJS      | Framework Backend |
| MySQL       | Base de données utilisateurs |
| Redis (AOF) | Gestion des sessions |
| Docker      | Conteneurisation |
| JWT         | Tokens d'authentification |
| Google OAuth2 | Connexion avec Google |
| bcrypt      | Hashage des mots de passe |

---

## 📁 Structure du Projet
```
auth-service/
├── docker-compose.yml
├── Dockerfile
├── .env
└── src/
    ├── main.ts
    ├── app.module.ts
    ├── config/
    │   ├── mysql.config.ts
    │   ├── redis.config.ts
    │   └── jwt.config.ts
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── jwt.strategy.ts
    │   ├── google.strategy.ts
    │   └── dto/
    ├── users/
    │   ├── users.module.ts
    │   ├── users.service.ts
    │   ├── user.entity.ts
    │   ├── patient.entity.ts
    │   ├── doctor.entity.ts
    │   └── dto/
    ├── session/
    │   ├── session.module.ts
    │   └── session.service.ts
    └── common/
        ├── role.enum.ts
        ├── jwt-payload.interface.ts
        └── hash.util.ts
```

---

## ⚙️ Installation

### 1 — Cloner le projet
```bash
git clone https://github.com/ton-repo/auth-service.git
cd auth-service
```

### 2 — Configurer les variables d'environnement
```bash
cp .env.example .env
# Remplis les valeurs dans .env
```

### 3 — Lancer avec Docker
```bash
# Premier lancement
docker-compose up --build

# Lancements suivants
docker-compose up
```

---

## 🔑 Variables d'Environnement
```env
# App
PORT=3000

# MySQL
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=authdb
MYSQL_USER=
MYSQL_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 🚀 API Endpoints

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion |
| POST | `/auth/logout` | Déconnexion |
| POST | `/auth/refresh` | Rafraîchir le token |
| GET  | `/auth/google` | Connexion Google |
| GET  | `/auth/google/callback` | Callback Google |

### Profil
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/profile` | Consulter son profil |
| PATCH | `/profile` | Modifier son profil |

---

## 👥 Acteurs

| Rôle | Description |
|------|-------------|
| `PATIENT` | Utilisateur soumettant des analyses médicales |
| `DOCTOR` | Médecin validant les certificats et consultations |

---

## 🔐 Sécurité

- Mots de passe hashés avec **bcrypt**
- Sessions stockées dans **Redis**
- Tokens **JWT** (access 15min + refresh 7j)
- Connexion **Google OAuth2**
- Variables sensibles dans **`.env`** (jamais sur Git)

---

## 👨‍💻 Équipe

| Nom | Rôle |
|-----|------|
| Zarifi Mohamed Abdelhadi | Chef de projet |
| Sadoune Fadjr | Développeur |
| Chikhaoui Ahmed Mahdi | Développeur |
| Rebahi M'hamed Wassim | Développeur |
| Bouldja Thiziri | Développeur |
| Atmani Kenza | Développeur |

---
