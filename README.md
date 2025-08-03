# Connect! - Your University Networking Hub

Bridging the gap between students, ideas, and opportunities.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)

---

## Project Overview

Connect! is a dedicated networking platform for university students, designed to help them discover peers with shared academic interests, collaborate on projects, find internships, and engage in meaningful discussions. By fostering a vibrant community, Connect! bridges students, ideas, and opportunities beyond traditional social circles.

## Features

### User Management & Authentication

* **Secure Signup & Sign-in**: University email verification ensures authentic user accounts.
* **JWT Authentication**: Stateless, secure API access using JSON Web Tokens.
* **Password Security**: Passwords hashed with bcrypt.

### User Profiles

* **Bios & Academic Details**: Department, graduation year, and minor.
* **Profile Pictures**: Uploaded and managed via Cloudinary.
* **Coding & Professional Links**: Integrate LinkedIn, GitHub, LeetCode, Codeforces, and GeeksforGeeks.
* **Dynamic Stats Cards**: LeetCode, GFG, Codeforces, and GitHub statistics displayed in real time.

### Social Networking Core

* **Follow/Unfollow**: Build and manage your network.
* **Search & Recommendations**: Find peers by name or shared academic interests.
* **Feeds**: Global and user-specific post feeds.

### Real-Time Communication

* **Direct Messaging**: Private, live chat powered by Socket.IO.
* **Online Status**: See peers’ real-time availability.

### Content Sharing (Posts)

* **CRUD Operations**: Create, update, delete posts with rich content.
* **Categorized Labels**: Tag posts (e.g., Collaboration Requests, Internship Openings, Study Resources).
* **Media Attachments**: Upload multiple images via Cloudinary.
* **External Links**: Link to projects, resources, and articles.

## Tech Stack

**Frontend**

* React, TypeScript, Vite
* Tailwind CSS, shadcn/ui, Framer Motion
* react-router-dom, Axios, React Toastify
* Socket.IO Client, SimpleBar React

**Backend**

* Node.js (Express), TypeScript
* Prisma ORM, PostgreSQL
* JWT, bcrypt, Nodemailer
* Socket.IO, Multer, CORS
* Cloudinary for media storage

**Deployment**

* Frontend: Vercel
* Backend: Render

**Integrations**

* LeetCode, GFG, Codeforces, GitHub stats via third-party cards

## Architecture

Connect! follows a monorepo structure with two core services:

* **Frontend (React + Vite)**: SPA that interacts with the backend via REST APIs and WebSockets for real-time features.
* **Backend (Express + TypeScript)**: RESTful API layer, authentication, business logic, database interactions via Prisma, and real-time channels via Socket.IO.

Data flows through HTTP for CRUD operations and WebSockets for messaging. Uploaded media is processed by Multer and stored in Cloudinary.

## Getting Started

### Prerequisites

* Node.js (LTS)
* npm or Yarn
* PostgreSQL instance
* Cloudinary account
* Email service credentials (for email verification)

### Setup

#### Clone repository

```bash
git clone <repository-url>
cd connect-app
```

#### Backend

```bash
cd backend
npm install
```

* Create `.env` with:

  ```
  DATABASE_URL="postgresql://user:pass@host:port/db?schema=public"
  JWT_SECRET="your_jwt_secret"
  EMAIL_USER="you@example.com"
  EMAIL_PASS="email_app_password"
  CLOUDINARY_CLOUD_NAME="<name>"
  CLOUDINARY_API_KEY="<key>"
  CLOUDINARY_API_SECRET="<secret>"
  PORT=3000
  BASE_URL="http://localhost:3000"
  ```
* Run migrations:

  ```bash
  npx prisma migrate dev --name init
  ```
* Start server:

  ```bash
  npm run dev
  ```

#### Frontend

```bash
cd ../frontend
npm install
```

* Create `.env` with:

  ```
  VITE_BACKEND_URL="http://localhost:3000"
  ```
* Start client:

  ```bash
  npm run dev
  ```
