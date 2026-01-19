# Cycles

A productivity app based on Sebastian Marshall's Work Cycles system.

**This is a placeholder app** to set up Vercel + Neon integration. The full app will be built by an autonomous coding agent.

## Step 1: Push to GitHub

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```bash
cd /users/guruprasadpuranik/dev/cycles/app
git add .
git commit -m "Initial commit: Cycles placeholder"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cycles.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import the `cycles` repository from GitHub
3. Deploy with default settings

## Step 3: Add Neon Database

1. In your Vercel project → **Storage** tab
2. Click **Add Database** → Select **Neon**
3. Create a new Neon database
4. Go to **Settings** → **Environment Variables**
5. Copy the `DATABASE_URL` value

## Step 4: Give to Autonomous Agent

Once you have the `DATABASE_URL`, provide it to the autonomous coding agent along with the implementation plan at:
- `/users/guruprasadpuranik/dev/cycles/docs/implementation-plan.md`

The agent will rebuild this into the full Cycles application.
