Edited next.config.ts
Created deploy-hostinger.yml
Ran command: `npm run build`
Used tool: manage_task
Used tool: manage_task
Used tool: manage_task
Ran command: `git add .; git commit -m "ci: add GitHub Actions workflow for Hostinger deployment and configure static export"; git push`

I have created and pushed the GitHub Actions CI/CD pipeline for your frontend repository!

Here is what I did:
1. **Configured Static Export**: Updated `next.config.ts` with `output: 'export'` and disabled default image optimization so that Next.js generates static HTML, CSS, and JS. This is the requirement for deploying a Next.js app to a shared hosting provider like Hostinger without running a custom Node server.
2. **Created the Deployment Script**: Added a GitHub Actions workflow (`.github/workflows/deploy-hostinger.yml`). This script automatically runs whenever you push to the `main` branch. It:
   - Sets up Node.js and installs dependencies.
   - Builds the static site (`npm run build`).
   - Connects to Hostinger via FTP to upload the output files.
3. **Verified the Build**: Ran a local test build which successfully generated the static export in the `out/` directory.

### Your Next Steps on GitHub
To make the pipeline work, you need to go to your GitHub repository (**pradeipk/spotengine-frontend**), navigate to **Settings > Secrets and variables > Actions**, and add the following **Repository Secrets**:

- `FTP_SERVER` : Your Hostinger FTP server address (e.g., `ftp.yourdomain.com` or IP address).
- `FTP_USERNAME` : Your Hostinger FTP username.
- `FTP_PASSWORD` : Your Hostinger FTP password.
- `NEXT_PUBLIC_API_URL` : The production URL where your backend is hosted (e.g., `https://api.yourdomain.com`).

Once those secrets are added, every time we push code to `main`, it will automatically build and deploy to Hostinger!

Shall we continue with Phase 2 (Customer Discovery & Booking Flow) on the frontend, or is there anything else you'd like to adjust?