#!/usr/bin/env bun

/**
 * Bunx 測試腳本
 * 用於驗證 MSSQL MCP 伺服器可以通過 Bunx 正確執行
 */

import { spawn } from 'child_process'

console.log('🚀 測試 Bunx 執行 MSSQL MCP 伺服器...\n')

// 測試配置
const tests = [
  {
    name: '測試 1: 直接使用 Bun 執行 TypeScript',
    command: 'bun',
    args: ['run', './src/index.ts'],
    timeout: 3000
  },
  {
    name: '測試 2: 使用 Bunx 執行本地套件',
    command: 'bunx',
    args: ['--bun', 'mssql-mcp'],
    timeout: 3000
  },
  {
    name: '測試 3: 使用 npm scripts',
    command: 'bun',
    args: ['run', 'start'],
    timeout: 3000
  }
]

// 執行測試函數
async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n📋 ${test.name}`)
    console.log(`   命令: ${test.command} ${test.args.join(' ')}`)
    
    const child = spawn(test.command, test.args, {
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    })
    
    let output = ''
    let errorOutput = ''
    
    child.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })
    
    // 設定超時，確認伺服器啟動
    setTimeout(() => {
      if (errorOutput.includes('MSSQL MCP 伺服器已啟動')) {
        console.log('   ✅ 測試通過 - 伺服器成功啟動')
        child.kill('SIGTERM')
        resolve(true)
      } else {
        console.log('   ❌ 測試失敗 - 伺服器未正確啟動')
        console.log('   錯誤輸出:', errorOutput.slice(0, 200))
        child.kill('SIGTERM')
        resolve(false)
      }
    }, test.timeout)
    
    child.on('error', (err) => {
      console.log(`   ❌ 執行錯誤: ${err.message}`)
      resolve(false)
    })
  })
}

// 執行所有測試
async function runAllTests() {
  console.log('🔍 開始執行 Bunx 相容性測試...')
  console.log('================================')
  
  const results = []
  
  for (const test of tests) {
    const result = await runTest(test)
    results.push({ name: test.name, passed: result })
  }
  
  // 顯示測試結果摘要
  console.log('\n\n📊 測試結果摘要')
  console.log('================')
  
  let passedCount = 0
  results.forEach(result => {
    const status = result.passed ? '✅ 通過' : '❌ 失敗'
    console.log(`${status} - ${result.name}`)
    if (result.passed) passedCount++
  })
  
  console.log(`\n總計: ${passedCount}/${results.length} 個測試通過`)
  
  if (passedCount === results.length) {
    console.log('\n🎉 所有測試通過！MSSQL MCP 已成功整合 Bunx')
  } else {
    console.log('\n⚠️ 部分測試失敗，請檢查錯誤訊息')
  }
}

// 執行測試
runAllTests().catch(console.error)