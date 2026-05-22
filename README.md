# PlaySetu

mkdir playsetu && cd playsetu
mkdir server client

# Backend
cd server
npm init -y
npm i express cors dotenv @google/generative-ai

# Frontend
cd ../client
npm create vite@latest . -- --template react
npm i tailwindcss @tailwindcss/vite
npx tailwindcss init -p
# Add to tailwind.config.js: content: ["./src/**/*.{js,jsx}"]
# Add to src/index.css: @import "tailwindcss";
npm i