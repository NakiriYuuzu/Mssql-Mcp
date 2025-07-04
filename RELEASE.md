# 發布流程

## 準備工作

### 1. 設定 NPM Token
1. 登入 [npm](https://www.npmjs.com/)
2. 前往 Account Settings > Access Tokens
3. 建立新的 Automation token
4. 在 GitHub repository 設定中加入 secret：
   - 名稱：`NPM_TOKEN`
   - 值：您的 npm token

### 2. 更新 package.json
請更新以下欄位：
- `author`: 您的名字
- `repository.url`: 您的 GitHub repository URL
- `bugs.url`: 您的 issues URL
- `homepage`: 您的 repository 首頁

## 發布新版本

### 自動發布（推薦）
```bash
# 1. 確保所有變更已提交
git add .
git commit -m "準備發布 v1.0.0"

# 2. 建立版本標籤
git tag v1.0.0

# 3. 推送標籤觸發 CI/CD
git push origin main --tags
```

GitHub Actions 會自動：
- 建置專案
- 執行測試
- 建立 GitHub Release
- 發布到 npm

### 手動發布
```bash
# 1. 清理並建置
npm run clean
npm run build

# 2. 測試
npm test

# 3. 更新版本號
npm version patch  # 或 minor, major

# 4. 發布到 npm
npm publish

# 5. 建立 GitHub Release
git push origin main --tags
```

## 版本號規則

遵循語意化版本 (SemVer)：
- `major`: 重大變更，不相容的 API 變更
- `minor`: 新功能，向下相容
- `patch`: 錯誤修復，向下相容

範例：
- 1.0.0 -> 1.0.1 (patch): 修復錯誤
- 1.0.1 -> 1.1.0 (minor): 新增功能
- 1.1.0 -> 2.0.0 (major): 重大變更

## 檢查清單

發布前請確認：
- [ ] 所有測試通過
- [ ] README.md 已更新
- [ ] CHANGELOG.md 已更新（如果有的話）
- [ ] package.json 版本號已更新
- [ ] 沒有敏感資訊（密碼、API keys）
- [ ] .env.example 包含所有必要的環境變數範例