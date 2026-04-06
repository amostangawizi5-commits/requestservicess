# Render Deployment Guide

This repo is prepared for Render with:

- `frontend/` as a static site
- `Backend/` as a Node/Express web service
- PostgreSQL as a managed Render database

## Before you deploy

1. Put this project in a Git repository.
2. Push it to GitHub, GitLab, or Bitbucket.
3. Make sure the repo contains `render.yaml` at the root.

## Deploy on Render

1. Open the Render dashboard.
2. Choose `New` -> `Blueprint`.
3. Connect your Git repository.
4. Select this repository and confirm the `render.yaml` blueprint.
5. When prompted for environment variables, set:
   - `ADMIN_EMAIL`
6. Finish the blueprint creation and wait for all services to deploy.

## What Render will create

- `portfolio-frontend`: static React site
- `portfolio-backend`: Express API
- `portfolio-db`: PostgreSQL database

## Important notes

- The backend reads `DATABASE_URL` automatically in production.
- The frontend reads `REACT_APP_BACKEND_HOSTNAME` automatically and builds the API URL from it.
- The backend CORS config reads `FRONTEND_URL`, which is wired from the frontend service URL in `render.yaml`.
- Because the frontend uses React Router, the blueprint includes a rewrite from `/*` to `/index.html`.

## Local development

- Copy `Backend/.env.example` to `Backend/.env`
- Copy `frontend/.env.example` to `frontend/.env` if you want frontend env overrides

## After deploy

- Open the frontend Render URL and test login
- Open the backend Render URL `/health` endpoint to confirm API health
- Add your custom domain in Render if needed
