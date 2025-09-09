# Changelog

所有重要的變更都會記錄在此文件中。

本專案遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

### Added
- HTTP/SSE 傳輸層支援
- 多 session 管理功能
- CORS 設定支援
- 健康檢查端點

## [1.1.1] - 2025-01-09

### Added
- 🚀 **Bun 執行環境支援** - 提供 100 倍極速啟動體驗
- 📦 **Bunx 直接執行** - 使用 `bunx --bun @yuuzu/mssql-mcp` 無需安裝即可執行
- 🔒 **多層次權限控制系統** - 新增環境變數權限設定：
  - `MSSQL_ALLOW_INSERT` - 允許 INSERT 操作
  - `MSSQL_ALLOW_UPDATE` - 允許 UPDATE 操作
  - `MSSQL_ALLOW_DELETE` - 允許 DELETE 操作
  - `MSSQL_DANGER_MODE` - Danger 模式（允許大部分寫入操作）
- 📝 **預設權限模式** - 新增多種預設啟動模式：
  - `start:safe` - 僅讀取模式
  - `start:write` - 允許 INSERT/UPDATE
  - `start:full` - 允許 INSERT/UPDATE/DELETE
  - `start:danger` - Danger 模式
- 🎯 **智能 Wrapper Script** - bin/mssql-mcp.js 自動偵測並使用 Bun 或 fallback 到 bunx

### Changed
- 🔄 **完整遷移至 Bun Runtime** - 原生 TypeScript 執行，無需編譯
- 📂 **重構專案結構** - 移除過時的 claude-commands 資料夾
- 🔧 **更新 CI/CD Pipeline** - GitHub Actions 使用 Bun 進行建置和測試
- 📋 **配置檔案重新命名**：
  - `.env.example` → `.env.sample`
  - `mcp-config.json` → `mcp-config-bun.json`

### Fixed
- 🐛 **修正 MCP SDK inputSchema 相容性問題** - 確保工具參數正確序列化
- 🔍 **改進查詢驗證邏輯** - 更精確的 SQL 語句安全檢查

### Security
- 🛡️ **增強安全驗證** - 即使在 Danger Mode 下也禁止 DROP、TRUNCATE、ALTER 等極度危險操作
- 🔐 **細緻權限控制** - 可針對不同操作類型進行獨立授權
- ⚠️ **安全警告提示** - 在使用寫入權限時顯示明確警告

### Performance
- ⚡ **啟動速度提升 100 倍** - 使用 Bun 取代 Node.js
- 🚀 **直接執行 TypeScript** - 無需預編譯步驟
- 📦 **更小的套件大小** - 優化依賴和打包配置

## [1.0.0] - 2025-01-04

### Added
- 初始版本發布
- MSSQL 資料庫連接功能
- 安全的查詢執行（僅限 SELECT）
- 資料庫和資料表瀏覽功能
- 資料表結構查詢
- MCP 協定支援
- Claude Code 整合
- 自訂指令支援
- TypeScript 支援

### Security
- SQL 注入防護
- 查詢結果數量限制
- 僅允許讀取操作