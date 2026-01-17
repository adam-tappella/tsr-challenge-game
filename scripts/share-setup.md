# 🚀 Share TSR Challenge for Testing

This guide helps you share the game with testers using ngrok.

## Prerequisites

1. Both servers running locally:
   - Backend: `npm run dev:backend` (port 3000)
   - Frontend: `npm run dev` (port 5173)

2. ngrok installed: `winget install ngrok.ngrok`

## Step-by-Step Setup

### 1. Sign up for ngrok (free)
- Go to https://dashboard.ngrok.com/signup
- Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken

### 2. Authenticate ngrok
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 3. Start ngrok tunnel for the BACKEND (port 3000)
```bash
ngrok http 3000
```

You'll see something like:
```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:3000
```

Copy that `https://abc123.ngrok-free.app` URL.

### 4. Update frontend environment

Create a `.env` file in the project root:
```
VITE_API_URL=https://abc123.ngrok-free.app
VITE_SOCKET_URL=https://abc123.ngrok-free.app
```

### 5. Restart the frontend
Stop the current Vite server (Ctrl+C) and restart:
```bash
npm run dev
```

### 6. Start ngrok tunnel for the FRONTEND (port 5173)

Open a NEW terminal and run:
```bash
ngrok http 5173
```

You'll get another URL like: `https://xyz789.ngrok-free.app`

### 7. Share with testers!

- **Team Interface**: `https://xyz789.ngrok-free.app`
- **Admin Panel**: `https://xyz789.ngrok-free.app/#admin`
- **Admin PIN**: `1234`

## Important Notes

1. **Free tier limitation**: ngrok free tier shows an interstitial page on first visit. Testers just need to click "Visit Site".

2. **Keep terminals open**: Both ngrok tunnels and both servers must stay running.

3. **URLs change**: Each time you restart ngrok, you get a new URL. Update `.env` and restart frontend if backend URL changes.

## Alternative: Same Network (No ngrok needed)

If testers are on the same WiFi network:

1. Find your IP: `ipconfig` (look for IPv4 Address, usually `192.168.x.x`)
2. Update vite.config.ts to expose: `server: { host: '0.0.0.0' }`
3. Share: `http://YOUR_IP:5173`
