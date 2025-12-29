# Plane Deployment Guide for Coolify

Hướng dẫn triển khai Plane lên Coolify với 2 môi trường Production và Development.

> **Tài liệu tham khảo**:
> - [Coolify Docker Compose Build Pack](https://coolify.io/docs/applications/build-packs/docker-compose)
> - [Coolify Docker Compose Knowledge Base](https://coolify.io/docs/knowledge-base/docker/compose)

## Lưu ý quan trọng

Theo [Coolify Docs](https://coolify.io/docs/knowledge-base/docker/compose):
- **Docker Compose file là "single source of truth"** - mọi cấu hình trong compose file
- **KHÔNG define `ports:` mapping** - Coolify tự quản lý routing qua Traefik
- **Environment variables** dùng syntax `${VAR:-default}` để hiện trong Coolify UI

## Branch Mapping

| Branch | Environment | Compose File |
|--------|-------------|--------------|
| `tantran` | Production | `docker-compose.prod.yml` |
| `oss` | Development | `docker-compose.dev.yml` |

---

## Hướng dẫn triển khai Development

### Bước 1: Truy cập Coolify Dashboard

Mở browser và vào Coolify server của bạn (ví dụ: `https://coolify.yourserver.com`)

### Bước 2: Tạo Project mới

1. Ở sidebar trái, click **Projects**
2. Click **+ Add** (góc phải trên)
3. Đặt tên: `plane-development`
4. Click **Continue**

### Bước 3: Thêm Resource mới

1. Trong project vừa tạo, click **+ Add New Resource**
2. Chọn **Private Repository (with GitHub App)** hoặc **Public Repository**

   **Nếu repo private:**
   - Chọn **GitHub App**
   - Nếu chưa có, click **+ Add a new GitHub App** và làm theo hướng dẫn
   - Cài đặt GitHub App vào repository của bạn

   **Nếu repo public:**
   - Chọn **Public Repository**
   - Paste URL: `https://github.com/your-username/plane`

### Bước 4: Cấu hình Repository

1. **Repository**: Chọn repo plane của bạn
2. **Branch**: Nhập `oss`
3. Click **Continue**

### Bước 5: Chọn Build Pack

1. Coolify mặc định chọn **Nixpacks**
2. Click vào dropdown và chọn **Docker Compose**
3. Click **Continue**

### Bước 6: Cấu hình Docker Compose

1. **Base Directory**: `/` (giữ mặc định)
2. **Docker Compose Location**: `deploy/coolify/docker-compose.dev.yml`
3. Check **☑ Preserve Repository During Deployment** (quan trọng để mount files)
4. Click **Continue**

### Bước 7: Chờ Coolify load Compose file

Coolify sẽ parse compose file và hiển thị danh sách services.

### Bước 8: Cấu hình Domain cho Proxy service

1. Tìm service **proxy** trong danh sách
2. Click vào **proxy**
3. Trong phần **Domains**, thêm domain của bạn:
   ```
   dev.plane.yourdomain.com:80
   ```
   > **Lưu ý**: Thêm `:80` vì proxy listen trên port 80

4. Click **Save**

### Bước 9: Cấu hình Environment Variables

1. Vào tab **Environment Variables** (hoặc trong Settings)
2. Coolify sẽ tự detect các biến từ compose file
3. Điền giá trị cho các biến quan trọng:

```bash
# URLs - THAY BẰNG DOMAIN THẬT
WEB_URL=https://dev.plane.yourdomain.com
CORS_ALLOWED_ORIGINS=https://dev.plane.yourdomain.com

# Security (optional - có default)
SECRET_KEY=your-secret-key-here
LIVE_SERVER_SECRET_KEY=your-live-secret-key

# Database (optional - có default)
POSTGRES_USER=plane_dev
POSTGRES_PASSWORD=your-db-password
POSTGRES_DB=plane_dev

# RabbitMQ (optional - có default)
RABBITMQ_USER=plane_dev
RABBITMQ_PASSWORD=your-mq-password
RABBITMQ_VHOST=plane_dev

# MinIO (optional - có default)
AWS_ACCESS_KEY_ID=your-minio-key
AWS_SECRET_ACCESS_KEY=your-minio-secret
```

4. Click **Save**

### Bước 10: Deploy

1. Click nút **Deploy** (góc phải trên)
2. Chờ Coolify thực hiện:
   - Clone repository từ branch `oss`
   - Build 7 images từ source (lần đầu mất ~15-30 phút)
   - Start tất cả containers theo thứ tự dependency

### Bước 11: Theo dõi Deployment

1. Click vào tab **Deployments** để xem logs real-time
2. Khi thấy "Deployment successful", tiếp tục bước tiếp

### Bước 12: Cấu hình SSL (tự động)

Coolify tự động cấu hình Let's Encrypt SSL cho domain của bạn.

### Bước 13: Truy cập ứng dụng

1. Mở browser: `https://dev.plane.yourdomain.com`
2. Vào God Mode: `https://dev.plane.yourdomain.com/god-mode/`
3. Tạo tài khoản admin đầu tiên
4. Hoàn thành setup wizard

---

## Cấu hình Auto Deploy

1. Trong resource settings, tìm **Webhooks**
2. Enable **Auto Deploy**
3. Mỗi khi push code lên branch `oss`, Coolify sẽ tự động rebuild và deploy

---

## Troubleshooting

### Build fails - Out of memory

```bash
# SSH vào server và enable swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### "No Available Server" sau deploy

Service có thể đang unhealthy. Kiểm tra:
1. Vào **Deployments** → xem logs
2. Đảm bảo database services khởi động trước API

### Container không connect được với nhau

Đảm bảo tất cả services đều trong cùng network `plane-dev`.

### Domain không hoạt động

1. Kiểm tra DNS đã trỏ về IP server Coolify
2. Đảm bảo đã thêm port vào domain (`:80`)
3. Chờ SSL certificate được cấp (có thể mất vài phút)

---

## Services Overview

| Service | Mô tả | Internal Port |
|---------|-------|---------------|
| proxy | Caddy reverse proxy (entry point) | 80 |
| web | Main web UI | 3000 |
| admin | Admin panel (/god-mode) | 3000 |
| space | Public spaces (/spaces) | 3000 |
| api | Django REST API | 8000 |
| live | Real-time collaboration | 3000 |
| worker | Celery background tasks | - |
| beat-worker | Celery scheduler | - |
| plane-db | PostgreSQL | 5432 |
| plane-redis | Redis/Valkey | 6379 |
| plane-mq | RabbitMQ | 5672 |
| plane-minio | MinIO storage | 9000 |

---

## Backup Database

```bash
# SSH vào Coolify server
ssh user@your-coolify-server

# Tìm container name (thường có prefix)
docker ps | grep plane-db

# Backup
docker exec <container-name> pg_dump -U plane_dev plane_dev > backup_$(date +%Y%m%d).sql
```

---

## Tài liệu tham khảo

- [Coolify Docker Compose Build Pack](https://coolify.io/docs/applications/build-packs/docker-compose)
- [Coolify Docker Compose Knowledge Base](https://coolify.io/docs/knowledge-base/docker/compose)
- [Coolify Applications](https://coolify.io/docs/applications/)
