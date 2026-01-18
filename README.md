# Lulema (鹿了么)

A gamified self-discipline web application with an iOS 17+ aesthetic.

## Features

- **Home**: Track streaks, view history, and check in daily.
- **SOS Mode**: Floating button to access the electronic Wooden Fish for accumulating merit.
- **Community**: Share progress in "Self-discipline" or "Deer King" zones.
- **Rankings**: Compete on Streak and Merit leaderboards.
- **Profile**: View stats and data analysis.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: SQLite (via Prisma)
- **Auth**: NextAuth.js

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Initialize Database:**
    ```bash
    npx prisma migrate dev --name init
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Open Browser:**
    Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

To deploy, build the project and start it:

```bash
npm run build
npm start
```
