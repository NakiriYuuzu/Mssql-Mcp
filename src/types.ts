import { z } from 'zod'

// 資料庫連接配置結構
export const DatabaseConfigSchema = z.object({
  server: z.string(),
  port: z.number().optional().default(1433),
  database: z.string().optional(),
  user: z.string(),
  password: z.string(),
  options: z.object({
    encrypt: z.boolean().optional().default(true),
    trustServerCertificate: z.boolean().optional().default(false),
    connectionTimeout: z.number().optional().default(30000),
    requestTimeout: z.number().optional().default(30000),
  }).optional()
})

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>

// 查詢結果結構
export interface QueryResult {
  recordset: any[]
  recordsets: any[]
  rowsAffected: number[]
  output: Record<string, any>
}

// 資料庫資訊
export interface DatabaseInfo {
  name: string
  database_id: number
  create_date: string
  collation_name: string
}

// 資料表資訊
export interface TableInfo {
  table_name: string
  table_schema: string
  table_type: string
}

// 欄位資訊
export interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  character_maximum_length: number | null
  numeric_precision: number | null
  numeric_scale: number | null
}