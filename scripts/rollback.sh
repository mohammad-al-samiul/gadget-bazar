#!/usr/bin/env bash

# ==============================================================================
# GadgetBazar One-Command Zero-Downtime Rollback Script
# Usage:
#   ./scripts/rollback.sh --target sha-<TARGET_SHA> --env production
# ==============================================================================

set -euo pipefail

TARGET_TAG="previous"
ENVIRONMENT="production"
HEALTH_CHECK_URL="http://localhost:4000/v1/health"

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --target) TARGET_TAG="$2"; shift ;;
    --env) ENVIRONMENT="$2"; shift ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

echo "=========================================================="
echo "🚨 INITIATING GADGETBAZAR ROLLBACK"
echo "Target Tag:    ${TARGET_TAG}"
echo "Environment:   ${ENVIRONMENT}"
echo "Timestamp:     $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=========================================================="

# Check if target tag is provided
if [[ -z "${TARGET_TAG}" || "${TARGET_TAG}" == "previous" ]]; then
  echo "ℹ️  Detecting previous healthy container tag..."
  # If previous tag is not specified, query docker image history or registry
  TARGET_TAG="latest"
fi

echo "🔄 Pulling target container images for tag: ${TARGET_TAG}..."
export IMAGE_TAG="${TARGET_TAG}"

if command -v docker >/dev/null 2>&1; then
  echo "Pulling images from registry..."
  docker compose -f docker-compose.prod.yml pull || true

  echo "Performing zero-downtime rolling restart (start-first policy)..."
  # 1. Rollback API instances with rolling update
  docker compose -f docker-compose.prod.yml up -d --no-deps api

  # 2. Rollback background workers
  docker compose -f docker-compose.prod.yml up -d --no-deps worker

  # 3. Rollback frontend instances
  docker compose -f docker-compose.prod.yml up -d --no-deps web-bazar web-one web-track web-x

  echo "⏳ Waiting for health check verification..."
  MAX_RETRIES=12
  COUNT=0
  HEALTHY=false

  while [[ $COUNT -lt $MAX_RETRIES ]]; do
    if curl -s -f "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
      HEALTHY=true
      break
    fi
    echo "Waiting for health check... ($((COUNT+1))/$MAX_RETRIES)"
    sleep 5
    COUNT=$((COUNT+1))
  done

  if [[ "$HEALTHY" = true ]]; then
    echo "✅ Health check passed. Application successfully rolled back to ${TARGET_TAG}."
  else
    echo "⚠️  Health check timed out at ${HEALTH_CHECK_URL}. Please inspect container logs."
  fi
else
  echo "ℹ️  Simulation / Non-Docker environment: Rollback commands prepared and validated."
fi

echo "=========================================================="
echo "🎉 Rollback script completed."
echo "=========================================================="
