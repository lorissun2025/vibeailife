#!/bin/bash
cd "$(dirname "$0")/.."
npx prisma db push --accept-data-loss
