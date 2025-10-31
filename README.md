PDF Signer - Mobile-friendly demo

This workspace contains a React client and a mock Express server that simulates signing PDFs.

Structure:
- server/ - Express mock server (port 4000)
- client/ - Vite + React app (port 3000)

Quick run (PowerShell):

# Server
cd server; npm install; npm start

# Client (in a new shell)
cd client; npm install; npm run dev

Open http://localhost:3000 on your device or emulator. The client uploads PDFs to http://localhost:4000/sign.
