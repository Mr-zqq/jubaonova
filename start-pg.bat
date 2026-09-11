@echo off
set PGBIN=E:\yunxiaocode\nestadmin\pgsql\pgsql\bin
set PGDATA=E:\yunxiaocode\nestadmin\pgdata
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l E:\yunxiaocode\nestadmin\pg.log start
"%PGBIN%\psql.exe" -h localhost -U postgres -p 5432 -c "select version();"
