# ChatFlow
Application de chat en temps réel avec authentification et personalisation d'un utilisateur - NestJS &amp; Next.js

<img width="1677" alt="Capture d’écran 2025-05-30 à 14 45 37" src="https://github.com/user-attachments/assets/91d27128-db2b-4092-bbaf-f1379feba683" />


## 🛠️ Installation du projet
Ce projet est composé de deux parties :

Backend (NestJS) 
Frontend (Next.js)

Assurez-vous d’avoir Node.js et Postgres installés sur votre machine.

## 📦 2️⃣ Configuration des environnements
#🟦 Backend

Dans le dossier /backend :

1️⃣ Crée un fichier .env :

DATABASE_URL="url-bdd-postgres"
SECRET_KEY="secret-key"
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="QkuVfg6SgZwo7uL5x+SuvxDNq4nZVrtVTRpNQ+Fhid4="

👉 Si tu veux générer une nouvelle clé JWT :

openssl rand -base64 32

Cela génère une clé sécurisée à coller dans JWT_SECRET.

#🟦 Frontend

Dans le dossier /frontend :

1️⃣ Crée un fichier .env :

NEXT_PUBLIC_BACK_URL=http://localhost:3001

## 🗄️ 3️⃣ Préparation de la base de données

Dans le dossier backend, exécute :

npx prisma generate
npx prisma migrate dev

🚀 4️⃣ Démarrage de l’application

Dans deux terminaux séparés :

🟦 Backend

cd backend
npm install
npm run start:dev

Le serveur NestJS sera disponible sur http://localhost:3001.

🟦 Frontend

cd frontend
npm install
npm run dev

L’application Next.js sera disponible sur http://localhost:3000.
