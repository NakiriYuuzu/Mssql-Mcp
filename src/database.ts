import sql from 'mssql'
import { DatabaseConfig, QueryResult, DatabaseInfo, TableInfo, ColumnInfo } from './types.js'

export class MSSQLManager {
  private pool: sql.ConnectionPool | null = null
  private config: DatabaseConfig | null = null
  private currentDatabase: string | null = null

  constructor() {}

  /**
   * 建立資料庫連接
   */
  async connect(config: DatabaseConfig): Promise<void> {
    try {
      // 如果已有連接，先關閉
      if (this.pool) {
        await this.disconnect()
      }

      this.config = config
      this.currentDatabase = config.database || null

      const poolConfig: sql.config = {
        server: config.server,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        options: config.options || {
          encrypt: true,
          trustServerCertificate: false,
          connectionTimeout: 30000,
          requestTimeout: 30000,
        }
      }

      this.pool = new sql.ConnectionPool(poolConfig)
      await this.pool.connect()
      
      console.log(`已連接到 MSSQL 伺服器: ${config.server}${config.database ? `, 資料庫: ${config.database}` : ''}`)
    } catch (error) {
      throw new Error(`連接資料庫失敗: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 斷開資料庫連接
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close()
      this.pool = null
      console.log('已斷開資料庫連接')
    }
  }

  /**
   * 檢查是否已連接
   */
  isConnected(): boolean {
    return this.pool !== null && this.pool.connected
  }

  /**
   * 取得目前資料庫名稱
   */
  getCurrentDatabase(): string | null {
    return this.currentDatabase
  }

  /**
   * 切換到指定資料庫
   */
  async switchDatabase(databaseName: string): Promise<void> {
    if (!this.isConnected() || !this.config) {
      throw new Error('尚未建立資料庫連接')
    }

    try {
      // 建立新的連接配置
      const newConfig = { ...this.config, database: databaseName }
      await this.connect(newConfig)
      this.currentDatabase = databaseName
      
      console.log(`已切換到資料庫: ${databaseName}`)
    } catch (error) {
      throw new Error(`切換資料庫失敗: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 執行 SQL 查詢
   */
  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.isConnected() || !this.pool) {
      throw new Error('尚未建立資料庫連接')
    }

    try {
      const request = this.pool.request()
      const result = await request.query(query)
      
      return {
        recordset: result.recordset || [],
        recordsets: result.recordsets ? (Array.isArray(result.recordsets) ? result.recordsets.map(rs => Array.from(rs)) : [Array.from(result.recordsets as any)]) : [],
        rowsAffected: Array.isArray(result.rowsAffected) ? result.rowsAffected : [result.rowsAffected || 0],
        output: result.output || {}
      }
    } catch (error) {
      throw new Error(`執行查詢失敗: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 取得所有資料庫清單
   */
  async getDatabases(): Promise<DatabaseInfo[]> {
    const query = `
      SELECT 
        name,
        database_id,
        create_date,
        collation_name
      FROM sys.databases 
      WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb')
      ORDER BY name
    `
    
    const result = await this.executeQuery(query)
    return result.recordset as DatabaseInfo[]
  }

  /**
   * 取得目前資料庫的所有資料表
   */
  async getTables(): Promise<TableInfo[]> {
    if (!this.currentDatabase) {
      throw new Error('尚未選擇資料庫')
    }

    const query = `
      SELECT 
        TABLE_NAME as table_name,
        TABLE_SCHEMA as table_schema,
        TABLE_TYPE as table_type
      FROM INFORMATION_SCHEMA.TABLES
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `
    
    const result = await this.executeQuery(query)
    return result.recordset as TableInfo[]
  }

  /**
   * 取得指定資料表的欄位資訊
   */
  async getTableColumns(tableName: string, schemaName: string = 'dbo'): Promise<ColumnInfo[]> {
    if (!this.currentDatabase) {
      throw new Error('尚未選擇資料庫')
    }

    const query = `
      SELECT 
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        IS_NULLABLE as is_nullable,
        CHARACTER_MAXIMUM_LENGTH as character_maximum_length,
        NUMERIC_PRECISION as numeric_precision,
        NUMERIC_SCALE as numeric_scale
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}' AND TABLE_SCHEMA = '${schemaName}'
      ORDER BY ORDINAL_POSITION
    `
    
    const result = await this.executeQuery(query)
    return result.recordset as ColumnInfo[]
  }

  /**
   * 測試連接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1 as test')
      return true
    } catch {
      return false
    }
  }
}