#!/bin/sh
set -e

echo "🚀 Kích hoạt tiến trình Entrypoint kiểm soát vòng đời dịch vụ..."

# Đảm bảo tuyệt đối cả NITRO_PORT và PORT đều là 8080 (hoặc biến môi trường chỉ định)
export PORT=${NITRO_PORT:-${PORT:-8080}}
export NITRO_PORT=${PORT}
export HOST=${NITRO_HOST:-${HOST:-0.0.0.0}}
export NITRO_HOST=${HOST}

echo "🟢 Môi trường sẵn sàng. Khởi động ứng dụng SSR (Nitro) trên host ${HOST}, cổng ${PORT}..."
exec node .output/server/index.mjs
