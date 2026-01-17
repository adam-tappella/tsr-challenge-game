# AWS ECS Deployment Guide

This guide walks through deploying your application to AWS ECS (Elastic Container Service).

## Prerequisites

- AWS CLI configured with appropriate credentials
- Docker installed locally
- Terraform installed (for IaC)
- GitHub repository for CI/CD

## Architecture Overview

```
                         +------------------+
                         |   CloudFront     |
                         |   (CDN/SSL)      |
                         +--------+---------+
                                  |
                         +--------v---------+
                         |  Application     |
                         |  Load Balancer   |
                         +--------+---------+
                                  |
              +-------------------+-------------------+
              |                                       |
     +--------v---------+                  +--------v---------+
     |   ECS Service    |                  |   ECS Service    |
     |   (Frontend)     |                  |   (Backend)      |
     +------------------+                  +--------+---------+
                                                    |
                                           +--------v---------+
                                           |   Aurora         |
                                           |   PostgreSQL     |
                                           +------------------+
```

## Step 1: Set Up AWS Resources

### Option A: Using Terraform (Recommended)

1. Copy the IaC template:
   ```bash
   cp iac-template/main.tf.example ../iac/main.tf
   ```

2. Configure variables:
   ```bash
   cd ../iac
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. Initialize and apply:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

### Option B: Manual Setup

1. Create ECR repositories for frontend and backend
2. Create ECS cluster
3. Create Aurora PostgreSQL instance
4. Configure VPC, subnets, and security groups
5. Set up Application Load Balancer
6. Create ECS task definitions and services

## Step 2: Configure Secrets

Store sensitive values in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
  --name myapp/production \
  --secret-string '{
    "DB_HOST": "your-aurora-endpoint",
    "DB_PORT": "5432",
    "DB_NAME": "myapp",
    "DB_USER": "admin",
    "DB_PASSWORD": "your-secure-password"
  }'
```

## Step 3: Set Up CI/CD with GitHub Actions

1. Add GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_ACCOUNT_ID`

2. Copy the GitHub Actions workflow:
   ```bash
   mkdir -p .github/workflows
   cp deployment/aws-ecs/github-actions/deploy.yml.example .github/workflows/deploy.yml
   ```

3. Customize the workflow for your project

## Step 4: Deploy

Push to your main branch to trigger deployment:

```bash
git push origin main
```

Or manually trigger via GitHub Actions.

## Step 5: Verify Deployment

1. Check ECS console for running tasks
2. Test health endpoints:
   ```bash
   curl https://your-domain.com/api/health
   ```
3. Check CloudWatch logs for errors

## Troubleshooting

### Container Fails to Start

1. Check CloudWatch logs for the task
2. Verify environment variables are set correctly
3. Check security groups allow necessary traffic
4. Verify database connectivity

### Health Checks Failing

1. Ensure health check endpoint responds with 200
2. Check target group health check path matches your API
3. Verify container is listening on the correct port

### Database Connection Issues

1. Check security group allows traffic from ECS
2. Verify secrets are being read correctly
3. Test connection from a bastion host

## Monitoring

### CloudWatch Metrics

Monitor these key metrics:
- CPU Utilization
- Memory Utilization
- Request Count
- Error Rate
- Response Time

### Alerts

Set up CloudWatch alarms for:
- High CPU (> 80%)
- High Memory (> 80%)
- High Error Rate (> 5%)
- Failed Health Checks

## Cost Optimization

- Use Fargate Spot for non-production workloads
- Right-size task definitions (CPU/memory)
- Use Aurora Serverless for variable workloads
- Enable auto-scaling based on metrics

## Rollback Procedure

1. Identify the last working task definition revision
2. Update service to use previous revision:
   ```bash
   aws ecs update-service \
     --cluster your-cluster \
     --service your-service \
     --task-definition your-task:PREVIOUS_REVISION
   ```
3. Monitor deployment progress
4. Investigate and fix the issue before re-deploying

## Related Documentation

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS Aurora Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
