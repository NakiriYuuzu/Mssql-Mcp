# MSSQL MCP Server - Bunx Edition 🚀

使用 **Bun** 和 **Bunx** 驅動的高效能 MSSQL MCP 伺服器，比傳統 Node.js 快 100 倍！

## 🎯 核心優勢

- **⚡ 極速啟動**: 利用 Bun 的快速啟動時間，比 npx 快約 100 倍
- **📦 原生 TypeScript**: 無需編譯，直接執行 TypeScript 程式碼
- **🔄 自動安裝**: Bunx 自動管理依賴套件
- **💾 全域快取**: 智慧快取機制，避免重複下載
- **🏗️ 獨立執行檔**: 可編譯為單一執行檔，無需安裝 runtime

## 📋 先決條件

```bash
# 安裝 Bun (Windows/Linux/macOS)
curl -fsSL https://bun.sh/install | bash

# 或使用 npm
npm install -g bun
```

## 🚀 快速開始

### 方法 1: 使用 Bunx (推薦)

```bash
# 從 npm 自動安裝並執行
bunx --bun @yuuzu/mssql-mcp

# 或執行本地套件
bunx --bun mssql-mcp
```

### 方法 2: 開發模式

```bash
# 克隆專案
git clone https://github.com/nakiriyuuzu/mssql-mcp.git
cd mssql-mcp

# 安裝依賴
bun install

# 直接執行 TypeScript
bun run start

# 或
bun run src/index.ts
```

### 方法 3: 編譯獨立執行檔

```bash
# 編譯為跨平台執行檔
bun run build

# 編譯為 Windows 執行檔
bun run build:exe

# 執行編譯後的檔案
./dist/mssql-mcp
```

## 🔧 Claude Code 整合

### 1. 自動設定 (使用 .mcp.json)

專案已包含 `.mcp.json` 設定檔，Claude Code 會自動偵測：

```json
{
  "mcpServers": {
    "mssql": {
      "command": "bunx",
      "args": ["--bun", "mssql-mcp"]
    }
  }
}
```

### 2. 手動設定選項

編輯 `mcp-config-bun.json` 選擇不同的執行模式：

```json
{
  "mcpServers": {
    "mssql-local": {
      "comment": "使用本地安裝的套件 (最快)",
      "command": "bunx",
      "args": ["--bun", "mssql-mcp"]
    },
    "mssql-npm": {
      "comment": "從 npm 自動安裝並執行",
      "command": "bunx",
      "args": ["--bun", "@yuuzu/mssql-mcp"]
    },
    "mssql-dev": {
      "comment": "開發模式 - 直接執行 TypeScript",
      "command": "bun",
      "args": ["run", "./src/index.ts"]
    },
    "mssql-compiled": {
      "comment": "執行編譯後的獨立執行檔",
      "command": "./dist/mssql-mcp",
      "args": []
    }
  }
}
```

## 📊 效能比較

| 執行方式 | 啟動時間 | 記憶體使用 | 特點 |
|---------|---------|-----------|------|
| `bunx --bun` | ~10ms | 低 | 最快，自動管理依賴 |
| `bun run` | ~8ms | 最低 | 開發模式，即時執行 |
| `npm/npx` | ~1000ms | 高 | 傳統方式，較慢 |
| 獨立執行檔 | ~5ms | 中 | 無需 runtime，部署簡單 |

## 🛠️ 開發指令

```bash
# 開發模式 (熱重載)
bun run dev

# 執行測試
bun test

# 執行 Bunx 相容性測試
bun run test-bunx.js

# 建置獨立執行檔
bun run build

# 清理建置檔案
bun run clean
```

## 🐛 故障排除

### Bunx 找不到套件

```bash
# 確保套件已正確安裝
bun install

# 或使用完整套件名稱
bunx --bun @yuuzu/mssql-mcp
```

### 權限問題

```bash
# Unix/Linux/macOS
chmod +x src/index.ts

# Windows - 使用 bun run
bun run start
```

### Claude Code 無法連接

1. 確認 Bun 已正確安裝：`bun --version`
2. 檢查 `.mcp.json` 設定
3. 重新載入 Claude Code 視窗

## 🔍 測試執行

```bash
# 執行完整測試套件
bun test

# 測試 Bunx 相容性
bun run test-bunx.js

# 手動測試伺服器啟動
echo "" | bun run src/index.ts
```

## 📦 發布到 npm

```bash
# 使用 Bun 發布
bun publish

# 或使用 npm
npm publish
```

## 🎯 最佳實踐

1. **開發階段**: 使用 `bun run dev` 快速迭代
2. **測試階段**: 使用 `bunx --bun mssql-mcp` 測試套件執行
3. **生產部署**: 編譯為獨立執行檔，無需安裝 runtime
4. **Claude Code**: 使用 `.mcp.json` 自動設定

## 🚄 為什麼選擇 Bun？

- **速度**: 啟動時間比 Node.js 快 100 倍
- **原生 TypeScript**: 無需 ts-node 或編譯步驟
- **內建工具**: 包含套件管理、測試、打包等功能
- **相容性**: 高度相容 Node.js 生態系統
- **效能**: 更低的記憶體使用和 CPU 消耗

## 📚 相關資源

- [Bun 官方文檔](https://bun.sh/docs)
- [Bunx 使用指南](https://bun.sh/docs/cli/bunx)
- [MCP 協定文檔](https://modelcontextprotocol.org)
- [MSSQL MCP GitHub](https://github.com/nakiriyuuzu/mssql-mcp)