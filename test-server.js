#!/usr/bin/env node

// 簡單的測試腳本，檢查 MCP 伺服器是否能正常啟動
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('測試 MSSQL MCP 伺服器啟動...')

const serverPath = join(__dirname, 'build', 'index.js')
const child = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
})

let hasStarted = false

// 監聽 stderr（伺服器日誌）
child.stderr.on('data', (data) => {
  const message = data.toString()
  console.log('伺服器日誌:', message.trim())
  
  if (message.includes('MSSQL MCP 伺服器已啟動')) {
    hasStarted = true
    console.log('✅ 伺服器啟動成功！')
    child.kill('SIGTERM')
  }
})

// 監聽錯誤
child.on('error', (error) => {
  console.error('❌ 啟動失敗:', error.message)
  process.exit(1)
})

// 監聽退出
child.on('exit', (code) => {
  if (hasStarted) {
    console.log('✅ 測試完成，伺服器正常關閉')
    process.exit(0)
  } else {
    console.error(`❌ 伺服器異常退出，代碼: ${code}`)
    process.exit(1)
  }
})

// 5 秒後強制退出測試
setTimeout(() => {
  if (!hasStarted) {
    console.error('❌ 超時：伺服器未在 5 秒內啟動')
    child.kill('SIGTERM')
    process.exit(1)
  }
}, 5000)