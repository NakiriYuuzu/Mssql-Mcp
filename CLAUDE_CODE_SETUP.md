# Claude Code 設定指南

## 前置準備

1. 確保已安裝 [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/overview)
2. 確保專案已建置：`npm run build`

## 設定方式

### 方法一：專案級設定（推薦）

在專案根目錄已有 `.mcp.json` 檔案，Claude Code 會自動偵測：

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["/完整路徑/到/mssql-mcp-server/build/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### 方法二：全域設定

在 `~/.claude/mcp.json` 中設定：

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["/build/index.js"]
    }
  }
}
```

## 啟動 Claude Code

```bash
# 在專案目錄中啟動
cd your-path
claude

# 或從任何地方啟動（如果使用全域設定）
claude --mcp-config ~/.claude/mcp.json
```

## 使用範例

### 1. 連接到資料庫

```
connect-database server="localhost" user="sa" password="your_password" database="TestDB"
```

### 2. 列出所有資料庫

```
list-databases
```

### 3. 切換資料庫

```
switch-database database="MyDatabase"
```

### 4. 列出資料表

```
list-tables
```

### 5. 查看資料表結構

```
describe-table tableName="Users" schemaName="dbo"
```

### 6. 執行查詢

```
execute-query query="SELECT TOP 10 * FROM Users WHERE Active = 1" limit=10
```

### 7. 檢查連接狀態

```
connection-status
```

### 8. 斷開連接

```
disconnect
```

## 完整工作流程範例

```
# 1. 連接資料庫
> connect-database server="localhost" user="sa" password="MyPassword123" encrypt=true

# 2. 查看有哪些資料庫
> list-databases

# 3. 切換到特定資料庫
> switch-database database="AdventureWorks"

# 4. 查看資料表
> list-tables

# 5. 查看特定資料表結構
> describe-table tableName="Person" schemaName="Person"

# 6. 執行查詢
> execute-query query="SELECT TOP 5 FirstName, LastName FROM Person.Person WHERE EmailPromotion = 1"

# 7. 進行更複雜的查詢
> execute-query query="SELECT p.FirstName, p.LastName, e.EmailAddress FROM Person.Person p INNER JOIN Person.EmailAddress e ON p.BusinessEntityID = e.BusinessEntityID WHERE p.PersonType = 'EM'" limit=20
```

## 自然語言使用方式

您也可以用自然語言與 Claude Code 互動：

```
# 自然語言查詢
> 幫我連接到本地的 SQL Server，使用者是 sa，密碼是 MyPassword123

> 列出所有可用的資料庫

> 切換到 Northwind 資料庫

> 查詢所有客戶的公司名稱和聯絡人

> 找出最近 30 天的訂單
```

## 故障排除

### 1. MCP 伺服器未啟動

檢查路徑是否正確：
```bash
# 測試伺服器是否能正常啟動
npm test
```

### 2. 連接權限問題

確保：
- SQL Server 允許遠端連接
- 使用者帳號具有適當權限
- 防火牆設定正確

### 3. 查看 Claude Code 日誌

```bash
# 啟動時加入除錯模式
claude --debug

# 或查看 MCP 伺服器日誌
claude --mcp-debug
```

### 4. 重啟 MCP 伺服器

如果遇到問題，可以重新啟動 Claude Code：
```bash
# 退出當前 Claude Code 會話
> /quit

# 重新啟動
claude
```

## 安全注意事項

1. **密碼安全**: 避免在指令歷史中暴露密碼
2. **權限控制**: 使用具有最小必要權限的資料庫使用者
3. **網路安全**: 在生產環境中啟用 SSL/TLS 加密
4. **查詢限制**: 伺服器自動限制只能執行 SELECT 查詢

## 高級功能

### 使用環境變數

建立 `.env` 檔案：
```env
MSSQL_SERVER=localhost
MSSQL_USER=sa
MSSQL_PASSWORD=MyPassword123
MSSQL_DATABASE=DefaultDB
```

然後在 Claude Code 中：
```
> 使用環境變數連接到預設的資料庫
```

### 批次操作

```
> 連接到資料庫後，幫我分析 Orders 資料表的銷售趨勢，包括：
> 1. 每月銷售總額
> 2. 最受歡迎的產品
> 3. 客戶分佈情況
```

Claude Code 會自動執行多個查詢來完成這個複雜的分析任務。