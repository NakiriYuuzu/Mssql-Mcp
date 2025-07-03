/**
 * 格式化查詢結果為表格形式
 */
export function formatResultAsTable(data: any[], maxRows: number = 100): string {
  if (!data || data.length === 0) {
    return '查詢結果為空'
  }

  const limitedData = data.slice(0, maxRows)
  const headers = Object.keys(limitedData[0])
  
  // 計算每欄的最大寬度
  const columnWidths = headers.map(header => {
    const headerWidth = header.length
    const dataWidth = Math.max(
      ...limitedData.map(row => {
        const value = row[header]
        return value === null ? 4 : String(value).length // 'NULL' 長度為 4
      })
    )
    return Math.max(headerWidth, dataWidth, 3) // 最小寬度為 3
  })

  // 建立分隔線
  const separator = columnWidths.map(width => '-'.repeat(width)).join(' | ')
  
  // 格式化標題行
  const headerRow = headers.map((header, index) => 
    header.padEnd(columnWidths[index])
  ).join(' | ')
  
  // 格式化資料行
  const dataRows = limitedData.map(row => 
    headers.map((header, index) => {
      const value = row[header]
      const displayValue = value === null ? 'NULL' : String(value)
      return displayValue.padEnd(columnWidths[index])
    }).join(' | ')
  )

  const totalRows = data.length
  const footer = totalRows > maxRows ? `\n\n顯示 ${maxRows} / ${totalRows} 筆資料` : `\n\n共 ${totalRows} 筆資料`

  return [headerRow, separator, ...dataRows].join('\n') + footer
}

/**
 * 驗證 SQL 查詢是否安全（僅限讀取操作）
 */
export function validateReadOnlyQuery(query: string): { isValid: boolean; reason?: string } {
  const trimmedQuery = query.trim().toLowerCase()
  
  // 檢查是否為空查詢
  if (!trimmedQuery) {
    return { isValid: false, reason: '查詢語句不能為空' }
  }

  // 危險關鍵字檢查
  const dangerousKeywords = [
    'drop', 'delete', 'truncate', 'alter', 'create', 
    'insert', 'update', 'merge', 'replace', 'rename',
    'grant', 'revoke', 'deny', 'execute', 'exec',
    'sp_', 'xp_', 'backup', 'restore'
  ]

  for (const keyword of dangerousKeywords) {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i')
    if (pattern.test(trimmedQuery)) {
      return { 
        isValid: false, 
        reason: `查詢包含危險關鍵字: ${keyword.toUpperCase()}。僅允許 SELECT 查詢。` 
      }
    }
  }

  // 檢查是否為 SELECT 查詢
  if (!trimmedQuery.startsWith('select') && !trimmedQuery.startsWith('with')) {
    return { 
      isValid: false, 
      reason: '僅允許 SELECT 查詢和 WITH 子句查詢' 
    }
  }

  // 檢查是否包含分號後的額外語句（防止 SQL 注入）
  const statements = query.split(';').filter(stmt => stmt.trim())
  if (statements.length > 1) {
    return { 
      isValid: false, 
      reason: '不允許執行多個 SQL 語句' 
    }
  }

  return { isValid: true }
}

/**
 * 為查詢添加 TOP 限制
 */
export function addTopLimit(query: string, limit: number): string {
  const trimmedQuery = query.trim()
  
  // 如果已經有 TOP 子句，不再添加
  if (/select\s+top\s+\d+/i.test(trimmedQuery)) {
    return trimmedQuery
  }
  
  // 如果是 WITH 子句開頭的查詢，更複雜的處理
  if (/^with\s+/i.test(trimmedQuery)) {
    return trimmedQuery // 暫時不處理 WITH 子句的 TOP 限制
  }
  
  // 為 SELECT 查詢添加 TOP 限制
  return trimmedQuery.replace(/^select\s+/i, `SELECT TOP ${limit} `)
}

/**
 * 清理和標準化資料庫名稱
 */
export function sanitizeDatabaseName(name: string): string {
  // 移除特殊字符，只保留字母、數字、底線和連字號
  return name.replace(/[^a-zA-Z0-9_-]/g, '')
}

/**
 * 清理和標準化資料表名稱
 */
export function sanitizeTableName(name: string): string {
  // 移除特殊字符，只保留字母、數字、底線
  return name.replace(/[^a-zA-Z0-9_.]/g, '')
}

/**
 * 格式化錯誤訊息
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return '發生未知錯誤'
}

/**
 * 檢查字串是否為有效的資料庫識別符
 */
export function isValidIdentifier(identifier: string): boolean {
  // 檢查是否符合 SQL 識別符規則
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/
  return pattern.test(identifier)
}

/**
 * 轉義 SQL 識別符（添加方括號）
 */
export function escapeIdentifier(identifier: string): string {
  return `[${identifier.replace(/]/g, ']]')}]`
}

/**
 * 驗證連接配置
 */
export function validateConnectionConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.server || typeof config.server !== 'string') {
    errors.push('伺服器位址是必需的且必須是字串')
  }
  
  if (!config.user || typeof config.user !== 'string') {
    errors.push('使用者名稱是必需的且必須是字串')
  }
  
  if (!config.password || typeof config.password !== 'string') {
    errors.push('密碼是必需的且必須是字串')
  }
  
  if (config.port && (typeof config.port !== 'number' || config.port < 1 || config.port > 65535)) {
    errors.push('連接埠必須是 1-65535 之間的數字')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}