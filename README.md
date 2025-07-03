# MSSQL MCP Server

這是一個 Model Context Protocol (MCP) 伺服器，提供與 Microsoft SQL Server 資料庫互動的功能。支援資料庫連接、切換、查詢等操作。

## 功能特色

- 🔌 **彈性連接**: 支援多種 MSSQL 連接配置
- 🔄 **資料庫切換**: 動態切換不同資料庫
- 📊 **安全查詢**: 內建安全檢查，防止危險操作
- 📋 **資料表瀏覽**: 列出資料表和欄位結構
- 🛡️ **錯誤處理**: 完善的錯誤處理和回報機制

## 安裝與設定

### 1. 安裝相依套件

```bash
npm install
```

### 2. 設定環境變數

複製環境變數範例檔案：

```bash
cp .env.example .env
```

編輯 `.env` 檔案，填入您的 MSSQL 連接資訊：

```env
MSSQL_SERVER=your_server_address
MSSQL_PORT=1433
MSSQL_USER=your_username
MSSQL_PASSWORD=your_password
MSSQL_ENCRYPT=true
MSSQL_TRUST_SERVER_CERTIFICATE=false
```

### 3. 建置專案

```bash
npm run build
```

### 4. 啟動伺服器

```bash
npm start
```

或開發模式：

```bash
npm run dev
```

## 可用工具

### 資料庫連接管理

- **connect-database**: 連接到 MSSQL 伺服器
- **disconnect**: 斷開資料庫連接
- **connection-status**: 檢查連接狀態

### 資料庫操作

- **list-databases**: 列出所有使用者資料庫
- **switch-database**: 切換到指定資料庫
- **list-tables**: 列出目前資料庫的所有資料表
- **describe-table**: 查看資料表的欄位結構

### 查詢操作

- **execute-query**: 執行 SQL 查詢語句（僅限 SELECT）

## 使用範例

### 在 Claude Code 中使用

1. 設定 MCP 伺服器配置（`.mcp.json`）：

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["path/to/mssql-mcp-server/build/index.js"]
    }
  }
}
```

2. 在 Claude Code 中使用工具：

```
# 連接資料庫
connect-database server="localhost" user="sa" password="your_password"

# 列出資料庫
list-databases

# 切換資料庫
switch-database database="MyDatabase"

# 列出資料表
list-tables

# 查看資料表結構
describe-table tableName="Users"

# 執行查詢
execute-query query="SELECT TOP 10 * FROM Users" limit=10
```

## 安全性注意事項

- 本伺服器僅允許執行 `SELECT` 查詢，會自動阻擋 `INSERT`、`UPDATE`、`DELETE` 等修改性操作
- 建議使用具有適當權限的專用資料庫使用者帳號
- 在生產環境中請啟用 SSL/TLS 加密連接

## 故障排除

### 常見問題

1. **連接失敗**
   - 檢查伺服器位址和連接埠是否正確
   - 確認使用者名稱和密碼是否正確
   - 檢查網路連接和防火牆設定

2. **憑證錯誤**
   - 如果使用自簽名憑證，可設定 `trustServerCertificate: true`
   - 建議在生產環境中使用有效的 SSL 憑證

3. **權限不足**
   - 確認資料庫使用者具有適當的讀取權限
   - 檢查是否有存取特定資料庫和資料表的權限

## 開發

### 專案結構

```
src/
├── index.ts          # MCP 伺服器主程式
├── database.ts       # MSSQL 資料庫管理類別
└── types.ts          # TypeScript 類型定義
```

### 建置指令

```bash
# 開發建置
npm run dev

# 生產建置
npm run build

# 清理建置檔案
npm run clean
```

## 授權

MIT License