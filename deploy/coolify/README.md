# Plane Deployment Guide for Coolify

Hướng dẫn chi tiết triển khai Plane lên Coolify với Docker Compose.

## Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Nguyên tắc viết Docker Compose cho Coolify](#nguyên-tắc-viết-docker-compose-cho-coolify)
3. [Environment Variables](#environment-variables)
4. [Hướng dẫn triển khai từng bước](#hướng-dẫn-triển-khai-từng-bước)
5. [Xử lý sự cố](#xử-lý-sự-cố)
6. [Các vấn đề thường gặp](#các-vấn-đề-thường-gặp)

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
│                            │                                    │
│                            ▼                                    │
│                   ┌─────────────────┐                          │
│                   │  Coolify Caddy  │  ← SSL Termination       │
│                   │  (HTTPS:443)    │    (https://plane.carp.vn)│
│                   └────────┬────────┘                          │
│                            │ HTTP                              │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Nginx Proxy                           │   │
│  │                    (Port 80)                             │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  Path Routing:                                   │    │   │
│  │  │  /api/*      → api:8000                         │    │   │
│  │  │  /auth/*     → api:8000                         │    │   │
│  │  │  /god-mode/* → admin:3000                       │    │   │
│  │  │  /spaces/*   → space:3000                       │    │   │
│  │  │  /live/*     → live:3000 (WebSocket)            │    │   │
│  │  │  /uploads/*  → plane-minio:9000                 │    │   │
│  │  │  /*          → web:3000                         │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│  │    web     │    │    api     │    │   admin    │           │
│  │  :3000     │    │   :8000    │    │   :3000    │           │
│  └────────────┘    └─────┬──────┘    └────────────┘           │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│         ▼                ▼                ▼                    │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐             │
│  │ PostgreSQL │   │   Valkey   │   │  RabbitMQ  │             │
│  │  :5432     │   │   :6379    │   │   :5672    │             │
│  └────────────┘   └────────────┘   └────────────┘             │
│                                                                 │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐             │
│  │   MinIO    │   │   worker   │   │beat-worker │             │
│  │ :9000/9090 │   │  (Celery)  │   │  (Celery)  │             │
│  └────────────┘   └────────────┘   └────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Các thành phần chính

| Service         | Mô tả                                 | Port      |
| --------------- | ------------------------------------- | --------- |
| **proxy**       | Nginx reverse proxy, routing requests | 80        |
| **web**         | Main web application (React)          | 3000      |
| **admin**       | Admin panel "God Mode"                | 3000      |
| **space**       | Public spaces viewer                  | 3000      |
| **live**        | Real-time collaboration (WebSocket)   | 3000      |
| **api**         | Django REST API                       | 8000      |
| **worker**      | Celery background worker              | -         |
| **beat-worker** | Celery beat scheduler                 | -         |
| **migrator**    | Database migration (one-time)         | -         |
| **plane-db**    | PostgreSQL database                   | 5432      |
| **plane-redis** | Valkey (Redis-compatible)             | 6379      |
| **plane-mq**    | RabbitMQ message queue                | 5672      |
| **plane-minio** | MinIO object storage                  | 9000/9090 |

---

## Nguyên tắc viết Docker Compose cho Coolify

### 1. KHÔNG define `ports:` mapping

Coolify tự quản lý routing qua Traefik/Caddy. Chỉ define port trong Dockerfile.

```yaml
# ❌ SAI - Không làm thế này
proxy:
  ports:
    - "80:80"

# ✅ ĐÚNG - Để Coolify xử lý
proxy:
  build:
    context: ./apps/proxy
    dockerfile: Dockerfile.coolify
  # Không có ports
```

### 2. Chỉ định service chính để gán domain

Trong Coolify UI, gán domain cho service `proxy` (entry point):

```yaml
# Comment giúp người dùng biết cần làm gì
# IMPORTANT: In Coolify UI, assign domain to "proxy" service
proxy:
  build:
    context: ./apps/proxy
    dockerfile: Dockerfile.coolify
```

### 3. Sử dụng YAML anchors để tránh lặp lại

```yaml
x-app-env: &app-env
  WEB_URL: ${WEB_URL:-https://plane.carp.vn}
  DATABASE_URL: postgresql://${POSTGRES_USER:-plane}:${POSTGRES_PASSWORD:-plane}@plane-db:5432/${POSTGRES_DB:-plane}
  REDIS_URL: redis://plane-redis:6379
  # ... các biến khác

services:
  api:
    environment:
      <<: *app-env # Kế thừa tất cả biến từ anchor

  worker:
    environment:
      <<: *app-env # Cùng config với api
```

### 4. Healthcheck cho các service quan trọng

```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/"]
    interval: 30s
    timeout: 10s
    retries: 10
    start_period: 120s # Cho phép thời gian khởi động dài

plane-db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-plane} -d ${POSTGRES_DB:-plane}"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### 5. Exclude services không có HTTP endpoint khỏi healthcheck

Coolify kiểm tra healthcheck của tất cả services. Services không có HTTP endpoint hoặc one-time jobs cần được exclude:

```yaml
migrator:
  restart: "no" # Chạy một lần rồi exit
  exclude_from_hc: true # Coolify-specific: không check health

worker:
  restart: always
  exclude_from_hc: true # Celery worker không có HTTP endpoint

beat-worker:
  restart: always
  exclude_from_hc: true # Celery beat không có HTTP endpoint
```

> **Tại sao cần `exclude_from_hc`?**
>
> - `migrator` exit sau khi chạy xong → Coolify thấy "exited" và báo unhealthy
> - `worker` và `beat-worker` không có HTTP endpoint → không có cách check health
> - Nếu không exclude, Coolify sẽ hiển thị "Running (unhealthy)"

### 6. Dependency ordering với conditions

```yaml
api:
  depends_on:
    migrator:
      condition: service_completed_successfully # Đợi migration xong
    plane-db:
      condition: service_healthy # Đợi DB sẵn sàng
    plane-redis:
      condition: service_healthy
    plane-mq:
      condition: service_healthy

web:
  depends_on:
    api:
      condition: service_healthy # Đợi API sẵn sàng
```

### 7. Named volumes cho data persistence

```yaml
services:
  plane-db:
    volumes:
      - pgdata:/var/lib/postgresql/data

  plane-minio:
    volumes:
      - uploads:/export

volumes:
  pgdata: # PostgreSQL data
  redisdata: # Redis data
  mqdata: # RabbitMQ data
  uploads: # MinIO uploads
```

---

## Environment Variables

### Biến bắt buộc (phải set trong Coolify)

```bash
# Application secrets - PHẢI thay đổi!
SECRET_KEY=your-super-secret-key-at-least-50-chars
LIVE_SERVER_SECRET_KEY=your-live-secret-key

# Domain chính
WEB_URL=https://plane.carp.vn
```

### Biến quan trọng cho SSL/HTTPS và File Upload

```bash
# MinIO endpoint - QUAN TRỌNG!
# API sử dụng internal endpoint để communicate với MinIO (không SSL)
AWS_S3_ENDPOINT_URL=http://plane-minio:9000

# Presigned URLs phải dùng HTTPS vì browser truy cập qua Coolify's Caddy
# PHẢI set thành "1" để tránh Mixed Content Error
MINIO_ENDPOINT_SSL=1
```

### Giải thích chi tiết MINIO_ENDPOINT_SSL

```
┌──────────────────────────────────────────────────────────────┐
│                     Request Flow                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Browser gọi API để lấy presigned URL                     │
│     POST https://plane.carp.vn/api/assets/v2/workspaces/...  │
│                                                               │
│  2. API tạo presigned URL:                                   │
│     ┌─────────────────────────────────────────────────────┐  │
│     │ if MINIO_ENDPOINT_SSL == "1":                       │  │
│     │     protocol = "https"                              │  │
│     │ else:                                               │  │
│     │     protocol = request.scheme  # "http" sau proxy!  │  │
│     │                                                     │  │
│     │ presigned_url = f"{protocol}://{host}/uploads/..."  │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                               │
│  3. API trả về:                                              │
│     - MINIO_ENDPOINT_SSL=0 → http://plane.carp.vn/uploads    │
│     - MINIO_ENDPOINT_SSL=1 → https://plane.carp.vn/uploads   │
│                                                               │
│  4. Browser upload file đến presigned URL:                   │
│     - Nếu HTTP → Mixed Content Error (blocked!)             │
│     - Nếu HTTPS → Upload thành công ✓                       │
│                                                               │
│  5. Request flow khi upload thành công:                      │
│     Browser → Coolify Caddy (HTTPS) → Nginx (/uploads/*)     │
│                                      → MinIO:9000 (HTTP)     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Mẫu .env đầy đủ

```bash
# ===========================================
# Plane Coolify Environment Variables
# ===========================================

# Application URL (REQUIRED)
WEB_URL=https://plane.carp.vn

# Application Secrets (REQUIRED - generate secure values)
# Generate: openssl rand -base64 50
SECRET_KEY=your-secret-key-here
LIVE_SERVER_SECRET_KEY=your-live-secret-key-here

# Database (uses internal PostgreSQL)
POSTGRES_USER=plane
POSTGRES_PASSWORD=secure-password-here
POSTGRES_DB=plane

# RabbitMQ (uses internal RabbitMQ)
RABBITMQ_USER=plane
RABBITMQ_PASSWORD=secure-password-here
RABBITMQ_VHOST=plane

# MinIO/S3 Storage (uses internal MinIO)
AWS_ACCESS_KEY_ID=access-key
AWS_SECRET_ACCESS_KEY=secret-key
AWS_S3_BUCKET_NAME=uploads

# Optional Settings
DEBUG=0
GUNICORN_WORKERS=2
FILE_SIZE_LIMIT=10485760
API_KEY_RATE_LIMIT=120/minute
CORS_ALLOWED_ORIGINS=
```

---

## Hướng dẫn triển khai từng bước

### Bước 1: Chuẩn bị files

Đảm bảo có các files sau trong repository:

```
plane/
├── docker-compose.coolify.yml       # Main compose file
├── apps/
│   ├── proxy/
│   │   ├── Dockerfile.coolify       # Nginx proxy Dockerfile
│   │   └── nginx.coolify.conf       # Nginx config
│   ├── web/
│   │   └── Dockerfile.web
│   ├── admin/
│   │   └── Dockerfile.admin
│   ├── space/
│   │   └── Dockerfile.space
│   ├── live/
│   │   └── Dockerfile.live
│   └── api/
│       └── Dockerfile.api
└── deploy/
    └── coolify/
        ├── README.md                 # Tài liệu này
        ├── .env.coolify.example      # Mẫu environment variables
        └── test-upload.sh            # Script troubleshoot
```

### Bước 2: Tạo Project trong Coolify

1. Đăng nhập Coolify dashboard
2. Click **Projects** → **+ Add**
3. Đặt tên: `plane-production`
4. Click **Continue**

### Bước 3: Thêm Resource

1. Click **+ Add New Resource**
2. Chọn **Public Repository** (hoặc Private nếu cần)
3. Paste URL với branch:
   ```
   https://github.com/your-username/plane/tree/oss
   ```
4. Click **Continue**

### Bước 4: Chọn Build Pack

1. Chọn **Docker Compose** (không phải Nixpacks)
2. **Docker Compose Location**: `docker-compose.coolify.yml`
3. Click **Continue**

### Bước 5: Cấu hình Domain

**QUAN TRỌNG**: Chỉ cấu hình domain cho service `proxy`!

```
Domains for proxy     ← CẤU HÌNH CÁI NÀY: plane.carp.vn:80
Domains for web       ← Bỏ trống
Domains for admin     ← Bỏ trống
Domains for space     ← Bỏ trống
Domains for live      ← Bỏ trống
Domains for api       ← Bỏ trống
... (bỏ trống tất cả)
```

### Bước 6: Cấu hình Environment Variables

1. Vào tab **Environment Variables**
2. Thêm các biến từ mẫu `.env.coolify.example`
3. **Quan trọng**: Thay đổi các secrets và passwords!

### Bước 7: Deploy

1. Click **Deploy**
2. Đợi build hoàn thành (lần đầu ~15-30 phút)
3. Kiểm tra logs nếu có lỗi

### Bước 8: Initial Setup

1. Truy cập `https://plane.carp.vn/god-mode/`
2. Tạo tài khoản admin đầu tiên
3. Hoàn thành setup wizard
4. Truy cập `https://plane.carp.vn/` để sử dụng

---

## Xử lý sự cố

### Script troubleshoot nhanh

```bash
./deploy/coolify/test-upload.sh plane.carp.vn
```

### Kiểm tra trong browser console

```javascript
// Test presigned URL format (chạy sau khi đăng nhập)
fetch("/api/assets/v2/workspaces/your-workspace/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    name: "test.png",
    type: "image/png",
    size: 1000,
    entity_type: "PROJECT_COVER",
  }),
})
  .then((r) => r.json())
  .then((data) => {
    const url = data.upload_data?.url || "N/A";
    const protocol = url.split("://")[0];
    console.log("Presigned URL:", url);
    console.log("Protocol:", protocol);
    if (protocol === "https") {
      console.log("✅ Upload should work!");
    } else {
      console.log("❌ Will cause Mixed Content error!");
      console.log("Fix: Set MINIO_ENDPOINT_SSL=1");
    }
  });
```

### Kiểm tra endpoints

```bash
# Test MinIO proxy endpoint
curl -I https://plane.carp.vn/uploads/
# Expected: 403 Access Denied (bình thường cho unauthenticated)

# Test API health
curl https://plane.carp.vn/api/
# Expected: 200 hoặc response từ API
```

---

## Các vấn đề thường gặp

### 1. Mixed Content Error khi upload file

**Triệu chứng:**

```
Mixed Content: The page was loaded over HTTPS, but requested an insecure
XMLHttpRequest endpoint 'http://plane.carp.vn/uploads'
```

**Nguyên nhân:** Presigned URL được tạo với HTTP thay vì HTTPS

**Giải pháp:**

```yaml
# docker-compose.coolify.yml
MINIO_ENDPOINT_SSL: "1" # Phải là "1", không phải "0"
```

### 2. SSL Validation Error trong API logs

**Triệu chứng:**

```
SSL validation failed for https://plane.carp.vn/uploads
[SSL: TLSV1_ALERT_INTERNAL_ERROR]
```

**Nguyên nhân:** API container cố gắng truy cập MinIO qua public HTTPS URL

**Giải pháp:**

```yaml
# docker-compose.coolify.yml
# API phải dùng internal endpoint (không SSL)
AWS_S3_ENDPOINT_URL: http://plane-minio:9000
```

### 3. Coolify báo "Unhealthy"

**Nguyên nhân:** Coolify check health của tất cả containers, bao gồm cả những service không có HTTP endpoint

**Giải pháp:**

```yaml
migrator:
  exclude_from_hc: true

worker:
  exclude_from_hc: true

beat-worker:
  exclude_from_hc: true
```

### 4. ERR_TOO_MANY_REDIRECTS

**Nguyên nhân:** Cấu hình SSL/redirect loop giữa Coolify và app

**Giải pháp:**

- Đảm bảo Nginx proxy listen port 80 (không phải 443)
- Để Coolify's Caddy xử lý SSL termination
- Không cấu hình HTTPS trong Nginx

### 5. Database connection failed

**Nguyên nhân:** Service khởi động trước khi database sẵn sàng

**Giải pháp:**

```yaml
api:
  depends_on:
    plane-db:
      condition: service_healthy
```

### 6. File upload size limit

**Nguyên nhân:** Nginx có default limit 1MB

**Giải pháp:**

```nginx
# nginx.coolify.conf
client_max_body_size 100M;
```

### 7. WebSocket không hoạt động

**Nguyên nhân:** Thiếu cấu hình WebSocket trong Nginx

**Giải pháp:**

```nginx
# nginx.coolify.conf
location /live/ {
    proxy_pass http://live_upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ...
}
```

---

## Cấu trúc files quan trọng

### apps/proxy/Dockerfile.coolify

```dockerfile
FROM nginx:1.25-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy nginx config
COPY nginx.coolify.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### apps/proxy/nginx.coolify.conf

```nginx
upstream web_upstream {
    server web:3000;
}

upstream api_upstream {
    server api:8000;
}

upstream admin_upstream {
    server admin:3000;
}

upstream space_upstream {
    server space:3000;
}

upstream live_upstream {
    server live:3000;
}

upstream minio_upstream {
    server plane-minio:9000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # API routes
    location /api/ {
        proxy_pass http://api_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth routes
    location /auth/ {
        proxy_pass http://api_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin/God-mode
    location /god-mode/ {
        proxy_pass http://admin_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Spaces
    location /spaces/ {
        proxy_pass http://space_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Live collaboration (WebSocket)
    location /live/ {
        proxy_pass http://live_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # MinIO uploads
    location ~ ^/uploads(/.*)?$ {
        proxy_pass http://minio_upstream$request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        chunked_transfer_encoding off;
    }

    # Static files
    location /static/ {
        proxy_pass http://api_upstream;
        proxy_set_header Host $host;
    }

    # Default - Main web app
    location / {
        proxy_pass http://web_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Checklist trước khi deploy

- [ ] Đã tạo `docker-compose.coolify.yml` với đúng cấu trúc
- [ ] Đã tạo `apps/proxy/Dockerfile.coolify` và `nginx.coolify.conf`
- [ ] Đã set `MINIO_ENDPOINT_SSL=1` cho HTTPS presigned URLs
- [ ] Đã set `AWS_S3_ENDPOINT_URL=http://plane-minio:9000` (internal)
- [ ] Đã thêm `exclude_from_hc: true` cho migrator, worker, beat-worker
- [ ] Đã thay đổi tất cả secrets và passwords
- [ ] Đã gán domain cho service `proxy` trong Coolify (không phải services khác)
- [ ] Đã enable HTTPS trong Coolify

---

## Tham khảo

- [Coolify Documentation](https://coolify.io/docs)
- [Coolify Docker Compose Build Pack](https://coolify.io/docs/applications/build-packs/docker-compose)
- [Coolify Docker Compose Knowledge Base](https://coolify.io/docs/knowledge-base/docker/compose)
- [Coolify Health Checks](https://coolify.io/docs/knowledge-base/health-checks)
- [Plane Documentation](https://docs.plane.so)
