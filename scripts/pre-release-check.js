#!/usr/bin/env node

import { promises as fs } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function checkRelease() {
  console.log('🔍 執行發布前檢查...\n')
  
  let hasErrors = false
  
  // 1. 檢查 package.json
  console.log('📦 檢查 package.json...')
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'))
    
    if (packageJson.author === 'Your Name') {
      console.error('❌ 請更新 package.json 中的 author 欄位')
      hasErrors = true
    }
    
    if (packageJson.repository.url.includes('YOUR_USERNAME')) {
      console.error('❌ 請更新 package.json 中的 repository URL')
      hasErrors = true
    }
    
    console.log(`✅ 版本號: ${packageJson.version}`)
  } catch (error) {
    console.error('❌ 無法讀取 package.json:', error.message)
    hasErrors = true
  }
  
  // 2. 檢查必要檔案
  console.log('\n📁 檢查必要檔案...')
  const requiredFiles = [
    'README.md',
    'package.json',
    'package-lock.json',
    '.env.example',
    'tsconfig.json',
    'mcp-config.json',
    'CLAUDE.md'
  ]
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file)
      console.log(`✅ ${file}`)
    } catch {
      console.error(`❌ 缺少檔案: ${file}`)
      hasErrors = true
    }
  }
  
  // 3. 檢查建置
  console.log('\n🔨 檢查建置...')
  try {
    const { stdout, stderr } = await execAsync('npm run build')
    if (stderr) {
      console.error('❌ 建置警告:', stderr)
    }
    console.log('✅ 建置成功')
  } catch (error) {
    console.error('❌ 建置失敗:', error.message)
    hasErrors = true
  }
  
  // 4. 檢查 .env.example
  console.log('\n🔐 檢查環境變數範例...')
  try {
    const envExample = await fs.readFile('.env.example', 'utf8')
    if (envExample.includes('your_password_here') || envExample.includes('YourPassword123!')) {
      console.log('⚠️  .env.example 包含範例密碼（這是正常的）')
    }
    console.log('✅ .env.example 存在')
  } catch {
    console.error('❌ 無法讀取 .env.example')
    hasErrors = true
  }
  
  // 5. 檢查 Git 狀態
  console.log('\n📊 檢查 Git 狀態...')
  try {
    const { stdout: gitStatus } = await execAsync('git status --porcelain')
    if (gitStatus) {
      console.error('❌ 有未提交的變更：')
      console.error(gitStatus)
      hasErrors = true
    } else {
      console.log('✅ 工作目錄乾淨')
    }
  } catch (error) {
    console.error('❌ 無法檢查 Git 狀態:', error.message)
    hasErrors = true
  }
  
  // 總結
  console.log('\n' + '='.repeat(50))
  if (hasErrors) {
    console.error('\n❌ 發布前檢查失敗！請修復上述問題。')
    process.exit(1)
  } else {
    console.log('\n✅ 所有檢查通過！可以進行發布。')
    console.log('\n下一步：')
    console.log('1. git tag v1.0.0')
    console.log('2. git push origin main --tags')
  }
}

checkRelease().catch(console.error)