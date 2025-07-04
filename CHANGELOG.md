# Changelog

所有重要的變更都會記錄在此文件中。

本專案遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [Unreleased]

### Added
- HTTP/SSE 傳輸層支援
- 多 session 管理功能
- CORS 設定支援
- 健康檢查端點

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