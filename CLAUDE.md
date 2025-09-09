# MSSQL MCP 伺服器 - Claude Code 專案記憶體

## 專案概述

這是一個使用 TypeScript + **Bun** 開發的 Model Context Protocol (MCP) 伺服器，專門用於與 Microsoft SQL Server 資料庫互動。提供安全的資料庫查詢、瀏覽和管理功能，並利用 **Bunx** 實現極速啟動（比 npx 快 100 倍）。

## 核心功能

### 🔌 連接管理
- **connect-database**: 建立安全的 MSSQL 連接
- **disconnect**: 優雅地關閉資料庫連接
- **connection-status**: 檢查連接狀態和健康度

### 🗄️ 資料庫操作
- **list-databases**: 列出所有可用的使用者資料庫
- **switch-database**: 動態切換工作資料庫
- **list-tables**: 瀏覽目前資料庫的資料表
- **describe-table**: 詳細檢視資料表結構和欄位定義

### 📊 查詢功能
- **execute-query**: 執行安全的 SELECT 查詢
- 自動限制查詢結果筆數
- 內建 SQL 注入防護機制

## 安全特性

1. **查詢限制**: 僅允許 SELECT 和 WITH 查詢，自動阻擋 DML/DDL 操作
2. **輸入驗證**: 對所有輸入進行清理和驗證
3. **連接加密**: 支援 SSL/TLS 加密連接
4. **權限控制**: 建議使用最小權限原則的資料庫帳號

## 專案結構

```
src/
├── index.ts          # MCP 伺服器主程式和工具定義
├── database.ts       # MSSQL 連接管理和操作類別
├── types.ts          # TypeScript 類型定義
└── utils.ts          # 工具函數和安全驗證

claude-commands/      # Claude Code 自訂指令
├── sql-connect.md    # 快速連接指令
├── sql-explore.md    # 資料庫探索指令
├── sql-analyze.md    # 資料表分析指令
└── sql-sample.md     # 樣本資料預覽指令
```

## 開發指令

### 🚀 使用 Bun (推薦 - 極速執行)
```bash
bun install          # 安裝依賴（比 npm 快 10 倍）
bun run dev          # 開發模式（直接執行 TypeScript）
bun start            # 啟動 MCP 伺服器
bun test             # 執行測試
bun run build        # 編譯為獨立執行檔
bun run clean        # 清理建置檔案

# 使用 Bunx 執行
bunx --bun mssql-mcp # 自動安裝並執行
```

### 傳統 npm 指令（備用）
```bash
npm install          # 安裝依賴
npm run dev          # 開發模式
npm start            # 啟動伺服器
npm test             # 測試
```

## Claude Code 整合

### MCP 設定
專案包含 `.mcp.json` 設定檔，Claude Code 會自動偵測並載入 MSSQL MCP 伺服器。

### 自訂指令
提供以下專案特定指令：
- `/project:sql-connect` - 快速連接資料庫
- `/project:sql-explore` - 探索資料庫結構
- `/project:sql-analyze` - 分析資料表統計
- `/project:sql-sample` - 預覽樣本資料

### 使用範例

```
# 連接到本地資料庫
connect-database server="localhost" user="sa" password="password" database="AdventureWorks"

# 探索資料庫結構
list-databases
switch-database database="Northwind"
list-tables

# 查詢資料
execute-query query="SELECT TOP 10 CustomerID, CompanyName FROM Customers"

# 使用自訂指令
/project:sql-explore Northwind
/project:sql-analyze Customers
```

## 設定檔

- `.mcp.json`: Claude Code 自動載入設定（使用 Bunx）
- `mcp-config-bun.json`: Bun/Bunx 執行模式設定範例
- `.env.example`: 環境變數範本
- `tsconfig.json`: TypeScript 編譯設定
- `README-BUNX.md`: Bunx 使用指南和效能分析

## 注意事項

1. **資料庫權限**: 確保使用的資料庫帳號具有適當的讀取權限
2. **網路設定**: 檢查 SQL Server 的遠端連接設定和防火牆規則
3. **SSL 憑證**: 在生產環境中使用有效的 SSL 憑證
4. **查詢效能**: 大型查詢會自動加入 TOP 限制以避免效能問題

## 故障排除

- 連接失敗：檢查伺服器位址、憑證和網路設定
- 權限錯誤：確認資料庫使用者權限
- 查詢被拒：確保查詢為安全的 SELECT 語句
- 伺服器啟動失敗：檢查依賴套件和建置狀態

這個專案遵循 MCP 協定標準，提供穩定、安全的 MSSQL 資料庫存取介面。