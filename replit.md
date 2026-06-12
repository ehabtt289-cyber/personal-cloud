# Personal Cloud Vault

A private personal cloud storage app where you can store notes, images, videos, and files — organized in a clean dashboard.

## Tech Stack
- **Backend**: Node.js + Express.js + MongoDB (Mongoose) + Cloudinary
- **Frontend**: React + Vite + Tailwind CSS
- **Auth**: Simple JWT auth with fixed password (12345678)

## Structure
- `/` — Express backend (port 5000)
- `/client` — React frontend (port 5173)

## Running
- Backend: `node server.js`
- Frontend: `cd client && npm run dev`
- Both together: `npm run dev:all`

## User Preferences
- Clean, modern dark UI (Notion/Google Drive style)
- MERN stack (MongoDB, Express, React, Node)
- Cloudinary for media storage
