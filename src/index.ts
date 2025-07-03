#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { MSSQLManager } from './database.js'
import { DatabaseConfigSchema } from './types.js'
import { 
  formatResultAsTable, 
  validateReadOnlyQuery, 
  addTopLimit, 
  sanitizeDatabaseName,
  sanitizeTableName,
  formatError,
  validateConnectionConfig 
} from './utils.js'

// 建立 MCP 伺服器實例
const server = new McpServer({
  name: 'mssql-mcp-server',
  version: '1.0.0',
  capabilities: {
    tools: {},
  },
})

// MSSQL 管理器實例
const mssqlManager = new MSSQLManager()

// 工具：連接資料庫
server.tool(
  'connect-database',
  '連接到 MSSQL 資料庫伺服器',
  {
    server: z.string().describe('MSSQL 伺服器位址'),
    port: z.number().optional().default(1433).describe('連接埠號 (預設: 1433)'),
    database: z.string().optional().describe('資料庫名稱 (可選)'),
    user: z.string().describe('使用者名稱'),
    password: z.string().describe('密碼'),
    encrypt: z.boolean().optional().default(true).describe('是否加密連接 (預設: true)'),
    trustServerCertificate: z.boolean().optional().default(false).describe('是否信任伺服器憑證 (預設: false)'),
  },
  async ({ server, port, database, user, password, encrypt, trustServerCertificate }) => {
    try {
      // 驗證連接配置
      const configValidation = validateConnectionConfig({ server, user, password, port })
      if (!configValidation.isValid) {
        return {
          content: [
            {
              type: 'text',
              text: `連接配置錯誤:\n${configValidation.errors.join('\n')}`
            }
          ]
        }
      }

      const config = DatabaseConfigSchema.parse({
        server,
        port,
        database: database ? sanitizeDatabaseName(database) : undefined,
        user,
        password,
        options: {
          encrypt,
          trustServerCertificate,
        }
      })

      await mssqlManager.connect(config)
      
      return {
        content: [
          {
            type: 'text',
            text: `成功連接到 MSSQL 伺服器: ${server}${database ? `\n目前資料庫: ${database}` : '\n未指定資料庫'}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `連接失敗: ${formatError(error)}`
          }
        ]
      }
    }
  }
)

// 工具：列出所有資料庫
server.tool(
  'list-databases',
  '列出伺服器上的所有使用者資料庫',
  {},
  async () => {
    try {
      if (!mssqlManager.isConnected()) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未連接到資料庫伺服器。請先使用 connect-database 工具建立連接。'
            }
          ]
        }
      }

      const databases = await mssqlManager.getDatabases()
      
      if (databases.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '沒有找到使用者資料庫。'
            }
          ]
        }
      }

      const databaseList = databases.map(db => 
        `- ${db.name} (建立時間: ${new Date(db.create_date).toLocaleDateString()}, 定序: ${db.collation_name})`
      ).join('\n')

      return {
        content: [
          {
            type: 'text',
            text: `找到 ${databases.length} 個資料庫:\n${databaseList}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `列出資料庫失敗: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      }
    }
  }
)

// 工具：切換資料庫
server.tool(
  'switch-database',
  '切換到指定的資料庫',
  {
    database: z.string().describe('要切換到的資料庫名稱'),
  },
  async ({ database }) => {
    try {
      if (!mssqlManager.isConnected()) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未連接到資料庫伺服器。請先使用 connect-database 工具建立連接。'
            }
          ]
        }
      }

      const sanitizedDatabase = sanitizeDatabaseName(database)
      await mssqlManager.switchDatabase(sanitizedDatabase)
      
      return {
        content: [
          {
            type: 'text',
            text: `成功切換到資料庫: ${sanitizedDatabase}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `切換資料庫失敗: ${formatError(error)}`
          }
        ]
      }
    }
  }
)

// 工具：列出資料表
server.tool(
  'list-tables',
  '列出目前資料庫中的所有資料表',
  {},
  async () => {
    try {
      if (!mssqlManager.isConnected()) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未連接到資料庫伺服器。請先使用 connect-database 工具建立連接。'
            }
          ]
        }
      }

      const currentDb = mssqlManager.getCurrentDatabase()
      if (!currentDb) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未選擇資料庫。請先使用 switch-database 工具選擇資料庫。'
            }
          ]
        }
      }

      const tables = await mssqlManager.getTables()
      
      if (tables.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `資料庫 ${currentDb} 中沒有找到資料表。`
            }
          ]
        }
      }

      const tableList = tables.map(table => 
        `- ${table.table_schema}.${table.table_name} (${table.table_type})`
      ).join('\n')

      return {
        content: [
          {
            type: 'text',
            text: `資料庫 ${currentDb} 中找到 ${tables.length} 個資料表:\n${tableList}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `列出資料表失敗: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      }
    }
  }
)

// 工具：查看資料表結構
server.tool(
  'describe-table',
  '查看指定資料表的欄位結構',
  {
    tableName: z.string().describe('資料表名稱'),
    schemaName: z.string().optional().default('dbo').describe('結構描述名稱 (預設: dbo)'),
  },
  async ({ tableName, schemaName }) => {
    try {
      if (!mssqlManager.isConnected()) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未連接到資料庫伺服器。請先使用 connect-database 工具建立連接。'
            }
          ]
        }
      }

      const currentDb = mssqlManager.getCurrentDatabase()
      if (!currentDb) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未選擇資料庫。請先使用 switch-database 工具選擇資料庫。'
            }
          ]
        }
      }

      const sanitizedTableName = sanitizeTableName(tableName)
      const sanitizedSchemaName = sanitizeTableName(schemaName)
      
      const columns = await mssqlManager.getTableColumns(sanitizedTableName, sanitizedSchemaName)
      
      if (columns.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `找不到資料表 ${sanitizedSchemaName}.${sanitizedTableName}。`
            }
          ]
        }
      }

      const columnList = columns.map(col => {
        let typeInfo = col.data_type
        if (col.character_maximum_length) {
          typeInfo += `(${col.character_maximum_length})`
        } else if (col.numeric_precision && col.numeric_scale !== null) {
          typeInfo += `(${col.numeric_precision},${col.numeric_scale})`
        }
        
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        return `- ${col.column_name}: ${typeInfo} ${nullable}`
      }).join('\n')

      return {
        content: [
          {
            type: 'text',
            text: `資料表 ${sanitizedSchemaName}.${sanitizedTableName} 的欄位結構:\n${columnList}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `查看資料表結構失敗: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      }
    }
  }
)

// 工具：執行查詢
server.tool(
  'execute-query',
  '執行 SQL 查詢語句',
  {
    query: z.string().describe('要執行的 SQL 查詢語句'),
    limit: z.number().optional().default(100).describe('結果筆數限制 (預設: 100)'),
  },
  async ({ query, limit }) => {
    try {
      if (!mssqlManager.isConnected()) {
        return {
          content: [
            {
              type: 'text',
              text: '錯誤: 尚未連接到資料庫伺服器。請先使用 connect-database 工具建立連接。'
            }
          ]
        }
      }

      // 驗證查詢安全性
      const validation = validateReadOnlyQuery(query)
      if (!validation.isValid) {
        return {
          content: [
            {
              type: 'text',
              text: `查詢被拒絕: ${validation.reason}`
            }
          ]
        }
      }

      // 加入 TOP 限制
      const finalQuery = addTopLimit(query, limit)

      const result = await mssqlManager.executeQuery(finalQuery)
      
      if (result.recordset.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '查詢執行成功，但沒有返回任何資料。'
            }
          ]
        }
      }

      // 使用改進的表格格式化
      const tableOutput = formatResultAsTable(result.recordset, limit)
      
      return {
        content: [
          {
            type: 'text',
            text: `查詢執行成功:\n\n${tableOutput}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `查詢執行失敗: ${formatError(error)}`
          }
        ]
      }
    }
  }
)

// 工具：取得連接狀態
server.tool(
  'connection-status',
  '檢查目前的資料庫連接狀態',
  {},
  async () => {
    try {
      const isConnected = mssqlManager.isConnected()
      const currentDb = mssqlManager.getCurrentDatabase()
      
      if (!isConnected) {
        return {
          content: [
            {
              type: 'text',
              text: '狀態: 未連接到資料庫伺服器'
            }
          ]
        }
      }

      const testResult = await mssqlManager.testConnection()
      const status = testResult ? '已連接且運作正常' : '連接異常'
      
      return {
        content: [
          {
            type: 'text',
            text: `狀態: ${status}${currentDb ? `\n目前資料庫: ${currentDb}` : '\n未選擇資料庫'}`
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `檢查連接狀態失敗: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      }
    }
  }
)

// 工具：斷開連接
server.tool(
  'disconnect',
  '斷開資料庫連接',
  {},
  async () => {
    try {
      await mssqlManager.disconnect()
      
      return {
        content: [
          {
            type: 'text',
            text: '已成功斷開資料庫連接。'
          }
        ]
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `斷開連接失敗: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      }
    }
  }
)

// 啟動伺服器
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MSSQL MCP 伺服器已啟動，正在監聽 stdio')
}

// 優雅關閉處理
process.on('SIGINT', async () => {
  console.error('接收到 SIGINT，正在關閉伺服器...')
  await mssqlManager.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.error('接收到 SIGTERM，正在關閉伺服器...')
  await mssqlManager.disconnect()
  process.exit(0)
})

main().catch((error) => {
  console.error('伺服器啟動失敗:', error)
  process.exit(1)
})