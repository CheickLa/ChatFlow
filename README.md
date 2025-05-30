# ChatFlow
Application de chat en temps réel avec authentification et profils personnalisés - NestJS &amp; Next.js

🛠️ Installation du projet

Ce projet est composé de deux parties :

Backend (NestJS)

Frontend (Next.js)

Assurez-vous d’avoir Node.js et Postgres installés sur votre machine.

⚙️ 1️⃣ Clonage du dépôt

git clone <URL_DU_DEPOT>
cd <NOM_DU_DEPOT>

📦 2️⃣ Configuration des environnements

🟦 Backend

Dans le dossier /backend :

1️⃣ Crée un fichier .env (ou renomme .env.example si existant) :

DATABASE_URL="postgresql://root:root@localhost:5432/mydb?schema=public"
SECRET_KEY=""
FRONTEND_URL="http://localhost:3000"
JWT_SECRET="QkuVfg6SgZwo7uL5x+SuvxDNq4nZVrtVTRpNQ+Fhid4="

👉 Si tu veux générer une nouvelle clé JWT :

openssl rand -base64 32

Cela génère une clé sécurisée à coller dans JWT_SECRET.

🟦 Frontend

Dans le dossier /frontend :

1️⃣ Crée un fichier .env :

NEXT_PUBLIC_BACK_URL=http://localhost:3001

🗄️ 3️⃣ Préparation de la base de données

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

🔐 Générer un JWT_SECRET si besoin

Si tu n’as pas de clé JWT_SECRET, génère-la avec :

openssl rand -base64 32

Puis copie-la dans ton .env :