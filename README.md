# Scientific Article Summarizer

1. Upload a PDF
2. Read summaries for key section (Abstract, Introduction, Methods, etc.)

## Stack

Frontend

- Vite + React + TypeScript
- ShadCN
- TanStack Query

Backend

- Node + Express
- multer
- pdfjs
- Github Models API

## Installation

```bash

npm install
npm run dev:client
npm run dev:server

```

## Environment Variables

`client/.env`

```properties
VITE_SERVER_URL=http://localhost:3000
```

`server/.env`

```properties
PORT=3300
CORS_ORIGIN=*

GITHUB_TOKEN=<YOUR_TOKEN>
GITHUB_MODEL=<YOUR_CHOICE_OF_MODEL>
```
