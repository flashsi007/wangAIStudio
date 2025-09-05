#!/usr/bin/env bash
set -e

cd /home/wangai-studio

PS3="请选择操作: "
options=("更新容器（保留镜像，重新构建并重启）" \
         "全部更新（删除容器+镜像，重新构建并重启）" \
         "退出")
select opt in "${options[@]}"; do
    case $REPLY in
        1)
            echo ">>> 仅更新容器 ..."
            sudo docker compose up --build -d
            break
            ;;
        2)
            echo ">>> 删除容器+镜像，重新构建 ..."
            sudo docker compose down
            sudo docker rmi wangai-studio || true
            sudo docker compose up --build -d
            break
            ;;
        3)
            echo "已取消"
            break
            ;;
        *)
            echo "无效选项，请重新选择"
            ;;
    esac
done