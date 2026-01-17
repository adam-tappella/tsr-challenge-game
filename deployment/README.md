# Deployment Guide

This document provides an overview of deployment options for your project.

## Deployment Options

| Option | Best For | Complexity | Cost |
|--------|----------|------------|------|
| **Docker Compose** | Local dev, small teams | Low | Free |
| **AWS ECS** | Production, scalable apps | High | Variable |
| **Vercel/Netlify** | Frontend-only, static sites | Low | Free tier available |

---

## Quick Links

- [Docker Setup](./docker/) - Local development with containers
- [AWS ECS Guide](./aws-ecs/SETUP_GUIDE.md) - Production deployment to AWS

---

## 1. Local Development with Docker

Use Docker Compose for local development with a database:

```bash
cd deployment/docker
docker-compose -f docker-compose.dev.yml up
```

This starts:
- Frontend on http://localhost:5173
- Backend on http://localhost:3000
- PostgreSQL on localhost:5432

See [docker/](./docker/) for configuration files.

---

## 2. AWS ECS Deployment

For production deployment to AWS ECS:

1. Set up infrastructure using Terraform (see `aws-ecs/iac-template/`)
2. Configure GitHub Actions for CI/CD (see `aws-ecs/github-actions/`)
3. Follow the [AWS ECS Setup Guide](./aws-ecs/SETUP_GUIDE.md)

---

## 3. Simpler Alternatives

### Vercel (Frontend Only)

For React/Next.js frontend-only projects:

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Netlify (Frontend Only)

Similar to Vercel:

1. Connect your GitHub repo to [Netlify](https://netlify.com)
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Railway / Render

For full-stack apps without AWS complexity:

1. Connect your GitHub repo
2. Configure environment variables
3. Deploy frontend and backend as separate services
4. Use managed PostgreSQL

---

## Environment Variables

### Required for All Deployments

```
# Frontend
VITE_API_URL=http://localhost:3000/api

# Backend
PORT=3000
NODE_ENV=production
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database
DB_USER=your-user
DB_PASSWORD=your-password
CORS_ORIGIN=https://your-frontend-domain.com
```

### AWS-Specific

```
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
ECR_REPOSITORY=your-repo-name
ECS_CLUSTER=your-cluster-name
ECS_SERVICE=your-service-name
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] CORS configured correctly
- [ ] SSL/TLS certificates in place
- [ ] Health check endpoints working
- [ ] Logging and monitoring set up
- [ ] Backup strategy defined
- [ ] Rollback procedure documented
