# Gyan Sagar — Learning Management System

A full-featured Learning Management System (LMS) built with Next.js.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Auth**: NextAuth (Credentials, GitHub, Google)
- **Database**: PostgreSQL + Prisma ORM
- **Video**: Mux
- **File Uploads**: Uploadthing
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Language**: TypeScript

## Features

- Role-based access (Admin, Instructor, Student)
- Course creation & management with drag-and-drop chapters
- Video uploads via Mux
- Rich text content with attachments
- Progress tracking
- Admin dashboard with analytics
- User authentication (email + OAuth)
- Search & filtering
- Responsive design

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (copy .env.example)
# Configure database URL, auth secrets, OAuth keys, Mux tokens, etc.

# Run database migrations
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
