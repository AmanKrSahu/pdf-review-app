# 📑 InvoScope

InvoScope lets you upload, view, and analyze PDF invoices directly in the browser. With features like real-time PDF viewing, AI-powered invoice parsing, search, and invoice management, InvoScope is designed to simplify handling financial documents end-to-end.

<img src="https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google+gemini&logoColor=white" /> <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff&style=for-the-badge" /> <img src="https://img.shields.io/badge/node%20js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white" /> <img src="https://img.shields.io/badge/express%20js-000000?style=for-the-badge&logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />

---

## ✨ Features

- 📄 View PDFs in the browser using `react-pdf` with zoom, rotate, pagination
- ⬆️ Upload PDFs and persist metadata
- 🤖 Extract structured invoice data via Gemini with retry & fallback
- 🔍 Search and manage invoices (list, get, update, delete)

---

### ⚙️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind, react-pdf
- **Backend:** Node.js/Express, TypeScript, Mongoose/MongoDB, Google Gemini (for extraction)

---

## 🌱 Prerequisites

- Node.js **20+**
- npm **10+**
- MongoDB (local or remote)
- Google Gemini API key

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/AmanKrSahu/pdf-review-app.git
cd pdf-review-app

# install server deps
cd server && npm i

# install client deps
cd ../client && npm i
```

### 2. Configure Environment

- Server requires a `.env` file (see below).
- Client just needs the API base URL via `NEXT_PUBLIC_API_BASE`.

**Create `server/.env`:**

```bash
# Express
PORT=8000
NODE_ENV=development

# Mongo
MONGO_URI=mongodb://localhost:27017/pdf_review_app

# CORS
FRONTEND_ORIGIN=http://localhost:3000

# Google Gemini
GEMINI_API_KEY=YOUR_API_KEY

# Uploads
MAX_FILE_SIZE=26214400
```

### 3. Run Both Apps (two terminals)

```bash
# Terminal A
cd server
npm run build && npm start   # or: npm run dev

# Terminal B
cd client
npm run dev
```

Frontend ➝ `http://localhost:3000`
Backend ➝ `http://localhost:8000` (base path `/api`)

---

## 💻 Client (Next.js)

- React **19**, Next **15** (App Router).
- PDF viewing powered by `react-pdf`.

Worker setup (must match `pdf.js` version):

```ts
// client/src/components/pdf/PdfViewer.tsx
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

⚠️ Notes:

- If CDN use is disallowed, map the worker locally via Next config.
- Options passed to `<Document />` are memoized to prevent reloads.

---

## 🛠 Server (Express API)

**Base URL:** `http://localhost:8000/api`

- `GET /` – health check
- `POST /upload` – upload a PDF
- `GET /files/:fileId` – fetch PDF file (or metadata)
- `POST /extract` – run Gemini extraction on uploaded PDF text
- `GET /invoices` – list invoices (`?q=...&page=1&limit=10`)
- `GET /invoices/:id` – get invoice by id OR `fileId`/`fileName`
- `POST /invoices` – create invoice
- `PUT /invoices/:id` – update by id OR `fileId`/`fileName`
- `DELETE /invoices/:id` – delete by id OR `fileId`/`fileName`

### 🤖 Gemini Resiliency

- Exponential backoff retries for transient errors (429, 503, overload, timeout).
- Fallback model sequence:

  1. `gemini-2.5-flash-lite`
  2. `gemini-2.5-flash`
  3. `gemini-1.5-flash`

### 🔐 Data Model (Invoice)

```ts
export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  fileId: string;
  fileName: string;
  vendor: {
    name: string;
    address?: string;
    taxId?: string;
  };
  invoice: {
    number: string;
    date: string;
    currency?: string;
    subtotal?: number;
    taxPercent?: number;
    total?: number;
    poNumber?: string;
    poDate?: string;
    lineItems: LineItem[];
  };
  createdAt: string;
  updatedAt?: string;
}
```

---

## 🔍 Features and Interfaces

1. Home Page

2. Invoice Page

3. PDF Reviewer Page

---

## 🧑‍💻 Development Tips

- CORS: set `FRONTEND_ORIGIN` to your client URL.
- ObjectId vs file identifiers: API accepts both.
- PDF worker mismatch: ensure `pdfjs.version` matches worker file.
- React hooks: keep them at the top of components.

---

## 📦 Build & Deploy

### Deployment Notes

- Ensure `MONGO_URI`, `GEMINI_API_KEY`, `FRONTEND_ORIGIN` are configured.
- Serve client behind HTTPS if using `react-pdf` with credentials.

---

## 🐞 Troubleshooting

- **Worker version mismatch** → use `pdfjs.version` worker URL or pin `pdfjs-dist`.
- **503/overloaded from Gemini** → server retries/fallback automatically (check logs).
- **CastError for ObjectId** → use filename or `fileId`; server resolves automatically.

---

## 🚀 Need Help??

Feel free to contact me on [Linkedin](https://www.linkedin.com/in/amankrsahu)

[![Instagram URL](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/itz.amansahu/) &nbsp; [![Discord URL](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white)](discordapp.com/users/539751578866024479)
