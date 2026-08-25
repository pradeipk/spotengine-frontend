# Deploying Next.js to Hostinger via GitHub Actions (SSH)

This guide documents the CI/CD pipeline used to automatically deploy the SpotEngine frontend (Next.js) to Hostinger shared hosting/VPS using GitHub Actions over SSH.

## Overview

The deployment relies on the `appleboy/scp-action` GitHub Action. Whenever code is pushed to the `main` branch, the workflow will:
1. Setup Node.js (v20)
2. Install dependencies (`npm ci`)
3. Build the static Next.js export (`npm run build` -> outputs to `out/`)
4. Securely copy the files from the `out/` directory to Hostinger's `public_html/` folder using SSH.

## 1. Next.js Configuration

For Hostinger (or any static hosting), Next.js must be configured for a static HTML export. 
Ensure `next.config.ts` includes:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
```

## 2. GitHub Repository Secrets

To allow GitHub Actions to securely connect to Hostinger, you must configure the following **Repository Secrets** in GitHub:
*(Navigate to GitHub Repo -> Settings -> Security -> Secrets and variables -> Actions -> New repository secret)*

| Secret Name | Description | Example |
|---|---|---|
| `REMOTE_HOST` | The SSH IP address or hostname of your Hostinger server. | `185.224.138.xxx` |
| `REMOTE_USER` | The SSH Username for your Hostinger account. | `u895854558` |
| `SSH_PRIVATE_KEY` | The raw contents of your Private SSH Key (`id_rsa` or `id_ed25519`). Include the `-----BEGIN...` and `-----END...` lines. | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_PORT` | The SSH Port. (Hostinger shared hosting usually uses `212` or `65002`). | `65002` |
| `NEXT_PUBLIC_API_URL` | The live production URL of the backend API so the frontend knows where to fetch data. | `https://api.yourdomain.com/api/v1` |

## 3. SSH Key Generation (If needed)

If you do not already have an SSH key connected to Hostinger:
1. Open terminal (or Git Bash) on your local machine.
2. Run: `ssh-keygen -t ed25519 -C "github-actions"`
3. Copy the contents of the generated `.pub` file (e.g., `id_ed25519.pub`) and add it to **Hostinger -> Advanced -> SSH Access -> Add SSH Key**.
4. Copy the contents of the private key file (e.g., `id_ed25519`) and save it as the `SSH_PRIVATE_KEY` secret in GitHub.

## 4. The Workflow File

The workflow is located at `.github/workflows/deploy-hostinger.yml`:

```yaml
name: Deploy Frontend to Hostinger

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    name: Build & Deploy
    runs-on: ubuntu-latest

    steps:
      - name: 🚚 Checkout Code
        uses: actions/checkout@v4

      - name: ⚙️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📦 Install Dependencies
        run: npm ci

      - name: 🛠️ Build Static Export
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: 🚀 Deploy to Hostinger via SSH
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT || 65002 }}
          source: "out/*"
          target: "public_html/"
          strip_components: 1
```

## Troubleshooting

- **Timeout Errors**: Usually means the `SSH_PORT` or `REMOTE_HOST` is incorrect. Verify Hostinger's exact SSH port in their hPanel.
- **Permission Denied**: The `SSH_PRIVATE_KEY` in GitHub does not match the public key uploaded to Hostinger, or the `REMOTE_USER` is incorrect.
- **Missing Files**: If files end up in `/public_html/out/` instead of `/public_html/`, ensure `strip_components: 1` is included in the `appleboy/scp-action` config.
