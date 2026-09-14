#!/usr/bin/env bash
# Build Astro site and publish to S3 + CloudFront (marketing: buzzftw.com / www).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export AWS_REGION="${AWS_REGION:-us-west-2}"
export SITE_URL="${SITE_URL:-https://www.buzzftw.com}"
export PUBLIC_GA_MEASUREMENT_ID="${PUBLIC_GA_MEASUREMENT_ID:-G-E7WE8T494E}"
# Root site on custom domain — no /folstad-site base path
unset BASE_PATH || true
export BASE_PATH=""

BUCKET="${MARKETING_BUCKET:-}"
DIST_ID="${MARKETING_DISTRIBUTION_ID:-}"

if [[ -z "$BUCKET" || -z "$DIST_ID" ]]; then
  # Prefer CloudFormation outputs
  BUCKET="${BUCKET:-$(aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name BuzzStack \
    --query "Stacks[0].Outputs[?OutputKey=='OutMarketingBucket'].OutputValue" --output text 2>/dev/null || true)}"
  DIST_ID="${DIST_ID:-$(aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name BuzzStack \
    --query "Stacks[0].Outputs[?OutputKey=='OutMarketingDistributionId'].OutputValue" --output text 2>/dev/null || true)}"
fi

if [[ -z "$BUCKET" || "$BUCKET" == "None" || -z "$DIST_ID" || "$DIST_ID" == "None" ]]; then
  echo "error: set MARKETING_BUCKET and MARKETING_DISTRIBUTION_ID, or deploy BuzzStack with Marketing outputs" >&2
  exit 1
fi

echo "Building Astro site (SITE_URL=${SITE_URL})…"
cd "$ROOT"
npm run build

echo "Syncing dist/ → s3://${BUCKET}/"
aws s3 sync "$ROOT/dist/" "s3://${BUCKET}/" \
  --delete \
  --region "$AWS_REGION" \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# HTML shorter cache so deploys show up
aws s3 sync "$ROOT/dist/" "s3://${BUCKET}/" \
  --region "$AWS_REGION" \
  --cache-control "public,max-age=60" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json" \
  --content-type "text/html; charset=utf-8" \
  --metadata-directive REPLACE 2>/dev/null || \
aws s3 sync "$ROOT/dist/" "s3://${BUCKET}/" \
  --region "$AWS_REGION" \
  --cache-control "public,max-age=60" \
  --exclude "*" \
  --include "*.html"

# Fix content-types for common assets (sync may leave octet-stream)
find "$ROOT/dist" -type f \( -name '*.css' -o -name '*.js' -o -name '*.svg' -o -name '*.ico' \) | while read -r f; do
  rel="${f#"$ROOT/dist/"}"
  case "$f" in
    *.css) ct=text/css ;;
    *.js) ct=application/javascript ;;
    *.svg) ct=image/svg+xml ;;
    *.ico) ct=image/x-icon ;;
    *) continue ;;
  esac
  aws s3 cp "s3://${BUCKET}/${rel}" "s3://${BUCKET}/${rel}" \
    --region "$AWS_REGION" \
    --content-type "$ct" \
    --cache-control "public,max-age=31536000,immutable" \
    --metadata-directive REPLACE >/dev/null 2>&1 || true
done

echo "Invalidating CloudFront ${DIST_ID}…"
aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo "Done → ${SITE_URL}  (bucket=${BUCKET}, dist=${DIST_ID})"
