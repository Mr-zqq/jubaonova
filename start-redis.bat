@echo off
start "redis" /min E:\yunxiaocode\nestadmin\redis\redis-server.exe E:\yunxiaocode\nestadmin\redis\redis.windows.conf
timeout /t 2 /nobreak >nul
E:\yunxiaocode\nestadmin\redis\redis-cli.exe ping
