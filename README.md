# payloadCMS

---

# Workflow Engine CMS

A lightweight CMS built with **Payload CMS** that supports **custom workflow automation**.
The system allows admins to define workflows and automatically trigger actions when content changes state.

---

# 1. Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/Rudhrakshdeethi/DREAMWHEELSProject.git
cd DREAMWHEELSProject
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory.

```
PAYLOAD_SECRET=your_secret_key
DATABASE_URI=sqlite://./database.db
```

## 4. Run the Development Server

```bash
npm run dev
```

Server will start at:

```
http://localhost:3000
```

Admin panel:

```
http://localhost:3000/admin
```

---

# 2. Architecture Overview

The project follows a **modular CMS + workflow engine architecture**.

```
src
│
├── collections
│   ├── Users.ts
│   ├── Posts.ts
│   └── Workflows.ts
│
├── workflow
│   ├── engine.ts
│   └── actions.ts
│
├── hooks
│   └── workflowHook.ts
│
├── payload.config.ts
└── server.ts
```

## Core Components

### Collections

Define CMS content types.

**Users**

* Authentication
* Role-based access (admin / reviewer)

**Posts**

* Content items that pass through workflow states

**Workflows**

* Defines workflow stages and actions

---

### Workflow Engine

Located in:

```
src/workflow/engine.ts
```

Responsibilities:

* Detect state changes
* Match workflow rules
* Trigger actions

Example flow:

```
Post Created
   ↓
Status = Draft
   ↓
Reviewer Approval
   ↓
Status = Published
```

---

### Hooks

Hooks run automatically when content changes.

Example:

```ts
afterChange: [
 async ({ doc }) => {
   await runWorkflowEngine(doc)
 }
]
```

This allows workflows to trigger **automatically after content updates**.

---

# 3. Sample Workflows

## Workflow 1 — Content Approval

```
Draft → Review → Published
```

Steps:

1. Author creates post
2. Status becomes **Draft**
3. Reviewer changes status to **Review**
4. Admin approves → **Published**

---

## Workflow 2 — Auto Reviewer Notification

Trigger:

```
When Post Status = Review
```

Action:

```
Send notification to reviewer
```

---

## Workflow 3 — Auto Publish

Trigger:

```
Post Approved
```

Action:

```
Change status to Published
```

---

# 4. Demo Credentials

Use these accounts to test the system.

## Admin

```
Email: admin@demo.com
Password: admin123
```

Permissions:

* Manage workflows
* Publish content
* Manage users

---

## Reviewer

```
Email: reviewer@demo.com
Password: reviewer123
```

Permissions:

* Review posts
* Approve or reject content

---

# 5. Deployment Guide

The project can be deployed easily on **Vercel**.

## 1. Push to GitHub

```bash
git add .
git commit -m "deployment"
git push origin main
```

---

## 2. Import Project into Vercel

Go to:

```
https://vercel.com
```

1. Click **New Project**
2. Import GitHub repository
3. Select framework **Node.js**

---

## 3. Add Environment Variables

Inside Vercel settings add:

```
PAYLOAD_SECRET
DATABASE_URI
```

Example:

```
DATABASE_URI=sqlite://./database.db
```

---

## 4. Deploy

Click **Deploy**

Your app will be available at:

```
https://your-project.vercel.app
```

Admin panel:

```
https://your-project.vercel.app/admin
```

---

# 6. Key Features

* Custom Workflow Engine
* Plugin-based Architecture
* Role-based Access Control
* SQLite Database
* Payload CMS Admin Panel
* Workflow Hooks
* Extensible Automation System

---
