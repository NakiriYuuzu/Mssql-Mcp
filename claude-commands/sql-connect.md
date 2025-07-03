連接到 MSSQL 資料庫伺服器。

參數：$ARGUMENTS

步驟：
1. 解析連接參數（伺服器、使用者、密碼等）
2. 使用 connect-database 工具建立連接
3. 如果成功，顯示連接狀態
4. 如果失敗，提供故障排除建議

範例用法：
- `/project:sql-connect localhost sa MyPassword123`
- `/project:sql-connect server=myserver user=admin password=secret database=TestDB`