# Vercel Deployment Guide for Backend

## Issue: Prisma Generated Files Not Found

The error `Cannot find module '/var/task/Backend/generated/prisma/internal/class'` occurs because the generated Prisma files are not being included in the Vercel deployment.

## Solution

### Option 1: Commit Generated Files (Recommended)

1. **Ensure generated files are in git:**
   ```bash
   git add Backend/generated/
   git commit -m "Add generated Prisma files"
   git push
   ```

2. **Vercel Settings:**
   - Root Directory: Leave empty (or set to root)
   - Build Command: `cd Backend && npm run build`
   - Output Directory: Leave empty
   - Install Command: `cd Backend && npm install`

### Option 2: Generate During Build

1. **In Vercel Project Settings:**
   - Root Directory: `Backend`
   - Build Command: `npm run vercel-build` (which runs `prisma generate && tsc`)
   - Install Command: `npm install` (the `postinstall` script will run `prisma generate`)

2. **Ensure `.gitignore` doesn't exclude generated files:**
   - The `.gitignore` should have `!Backend/generated/` to include them

### Option 3: Use Standard Prisma Output (Alternative)

If issues persist, consider using the default Prisma client location:

1. Update `prisma/schema.prisma`:
   ```prisma
   generator client {
     provider = "prisma-client-js"
     // Remove: output = "../generated/prisma"
   }
   ```

2. Update `src/utils/prisma.ts`:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   // Remove custom adapter if not needed
   ```

## Current Configuration

- **Generated Location**: `Backend/generated/prisma/`
- **Build Script**: `prisma generate && tsc`
- **Postinstall**: Automatically generates Prisma client
- **Vercel Config**: `vercel.json` at root level

## Environment Variables Required

Make sure these are set in Vercel:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
