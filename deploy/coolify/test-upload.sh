#!/bin/bash
# ===========================================
# Plane Upload Troubleshooting Script
# ===========================================
# Usage: ./test-upload.sh [domain]
# Example: ./test-upload.sh plane.carp.vn

DOMAIN="${1:-plane.carp.vn}"
BASE_URL="https://${DOMAIN}"

echo "================================================"
echo "Plane Upload Troubleshooting - ${DOMAIN}"
echo "================================================"

# Test 1: MinIO proxy endpoint
echo ""
echo "=== Test 1: MinIO Proxy Endpoint ==="
echo "Testing: ${BASE_URL}/uploads/"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/uploads/" 2>&1)
if [ "$STATUS" = "403" ]; then
    echo "✅ Status: ${STATUS} (Access Denied - Expected for unauthenticated requests)"
elif [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
    echo "✅ Status: ${STATUS} (MinIO is accessible)"
else
    echo "❌ Status: ${STATUS} (MinIO might not be accessible)"
fi

# Test 2: API health
echo ""
echo "=== Test 2: API Health ==="
echo "Testing: ${BASE_URL}/api/"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/" 2>&1)
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ] || [ "$API_STATUS" = "401" ]; then
    echo "✅ Status: ${API_STATUS} (API is responding)"
else
    echo "❌ Status: ${API_STATUS} (API might have issues)"
fi

# Test 3: Check presigned URL format (requires session cookie)
echo ""
echo "=== Test 3: Presigned URL Format ==="
echo "To test presigned URLs, run this in browser console:"
echo ""
cat << 'CONSOLE_SCRIPT'
fetch('/api/assets/v2/workspaces/<your-workspace-slug>/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'test.png',
    type: 'image/png',
    size: 1000,
    entity_type: 'PROJECT_COVER',
    entity_identifier: null
  })
})
.then(r => r.json())
.then(data => {
  const url = data.upload_data?.url || 'N/A';
  const protocol = url.split('://')[0];
  console.log('Presigned URL:', url);
  console.log('Protocol:', protocol);
  if (protocol === 'https') {
    console.log('✅ Presigned URL uses HTTPS - Upload should work!');
  } else {
    console.log('❌ Presigned URL uses HTTP - Will cause Mixed Content error!');
    console.log('Fix: Set MINIO_ENDPOINT_SSL=1 in environment');
  }
});
CONSOLE_SCRIPT

echo ""
echo "================================================"
echo "Common Issues and Fixes:"
echo "================================================"
echo ""
echo "1. Mixed Content Error (http:// presigned URL on https:// page)"
echo "   Fix: Set MINIO_ENDPOINT_SSL=1 in docker-compose.coolify.yml"
echo ""
echo "2. SSL Validation Error in API logs"
echo "   Fix: Set AWS_S3_ENDPOINT_URL=http://plane-minio:9000 (internal)"
echo ""
echo "3. 403 Access Denied on /uploads/"
echo "   This is NORMAL for unauthenticated requests"
echo "   Presigned URLs include authentication tokens"
echo ""
echo "4. Unhealthy status in Coolify"
echo "   Fix: Add 'exclude_from_hc: true' to migrator, worker, beat-worker"
echo ""
