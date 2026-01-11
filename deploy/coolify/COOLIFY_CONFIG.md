# Coolify Shared Services Configuration

This file contains configuration details for deploying Plane to Coolify using shared services.

## Shared Services

### PostgreSQL (shared-postgres)

- **Container ID**: `uo40g4wcgs4oc4osocgc88k0`
- **Database**: `plane`
- **Username**: `postgres`
- **Password**: `QSZKc87kWjGxIDjt3GoGVvUCmwgC1ZR62eYIU3Q2tPZEafcMBh5UvcgJCBaxTNEr`
- **Internal URL**: `postgres://postgres:QSZKc87kWjGxIDjt3GoGVvUCmwgC1ZR62eYIU3Q2tPZEafcMBh5UvcgJCBaxTNEr@uo40g4wcgs4oc4osocgc88k0:5432/plane`

### Redis (shared-redis)

- **Container ID**: `uckko88cw0ow8ksockgg8ws8`
- **Username**: `default`
- **Password**: `3jv9iH9qZtXpJbRny6O3uvY3neVbYxtW9UNNFNAvbiYBZ9L6xltOvmBWyQcW1XoJ`
- **Internal URL**: `redis://default:3jv9iH9qZtXpJbRny6O3uvY3neVbYxtW9UNNFNAvbiYBZ9L6xltOvmBWyQcW1XoJ@uckko88cw0ow8ksockgg8ws8:6379/0`

### MinIO (shared-minio)

- **Service ID**: `m0444os4gkcksockk4os4kwc`
- **Container ID**: `uccsggk0k8oc8gggc44w84cc`
- **Admin User**: `BmHNT7cVMngIN8Zt`
- **Admin Password**: `W3mXjWRTea804I4vOhE0dPS5SUD01L3m`
- **Bucket**: `uploads`
- **Internal S3 URL**: `http://minio-m0444os4gkcksockk4os4kwc:9000`
- **External Console URL**: `https://console-uccsggk0k8oc8gggc44w84cc.app.nextis.dev`
- **External S3 API URL**: `https://minio-uccsggk0k8oc8gggc44w84cc.app.nextis.dev`
- **Connect To Predefined Network**: Enabled

## Environment Variables for Plane Deployment

Copy these to Coolify environment variables when deploying Plane:

```bash
# Application
WEB_URL=https://plane.carp.vn
DEBUG=0
SECRET_KEY=<generate-a-secret-key>
LIVE_SERVER_SECRET_KEY=<generate-a-secret-key>

# Database - Shared PostgreSQL
DATABASE_URL=postgres://postgres:QSZKc87kWjGxIDjt3GoGVvUCmwgC1ZR62eYIU3Q2tPZEafcMBh5UvcgJCBaxTNEr@uo40g4wcgs4oc4osocgc88k0:5432/plane
POSTGRES_HOST=uo40g4wcgs4oc4osocgc88k0
POSTGRES_USER=postgres
POSTGRES_PASSWORD=QSZKc87kWjGxIDjt3GoGVvUCmwgC1ZR62eYIU3Q2tPZEafcMBh5UvcgJCBaxTNEr
POSTGRES_DB=plane

# Redis - Shared Redis
REDIS_HOST=uckko88cw0ow8ksockgg8ws8
REDIS_PORT=6379
REDIS_URL=redis://default:3jv9iH9qZtXpJbRny6O3uvY3neVbYxtW9UNNFNAvbiYBZ9L6xltOvmBWyQcW1XoJ@uckko88cw0ow8ksockgg8ws8:6379/0

# MinIO/S3 - Shared MinIO
AWS_ACCESS_KEY_ID=BmHNT7cVMngIN8Zt
AWS_SECRET_ACCESS_KEY=W3mXjWRTea804I4vOhE0dPS5SUD01L3m
AWS_S3_ENDPOINT_URL=http://minio-m0444os4gkcksockk4os4kwc:9000
AWS_S3_BUCKET_NAME=uploads

# RabbitMQ (internal - managed by docker-compose)
RABBITMQ_USER=plane
RABBITMQ_PASSWORD=plane
RABBITMQ_VHOST=plane
```

## Deployment Steps

1. Create new Docker Compose application in Coolify
2. Set repository: `https://github.com/plandex/plane` (or your fork)
3. Set branch: `oss`
4. Set compose file: `docker-compose.coolify.yml`
5. Add environment variables from above
6. Enable "Connect To Predefined Network" for Plane app
7. Set domain for proxy service: `plane.carp.vn`
8. Deploy

## Important Notes

- MinIO bucket `uploads` has been created
- Database `plane` has been reset (clean state)
- All shared services are on the predefined Coolify network
- Plane app must also enable "Connect To Predefined Network" to access shared services
