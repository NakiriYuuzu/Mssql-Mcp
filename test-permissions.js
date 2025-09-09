#!/usr/bin/env bun

// MSSQL MCP 權限控制系統測試
// 測試不同的權限設定組合

import { validateReadOnlyQuery } from './src/utils.js';

// 測試用的 SQL 查詢語句
const testQueries = {
  // 安全查詢
  select: "SELECT * FROM Users",
  selectWithTop: "SELECT TOP 10 * FROM Orders",
  withClause: "WITH cte AS (SELECT * FROM Products) SELECT * FROM cte",
  
  // DML 操作
  insert: "INSERT INTO Users (name, email) VALUES ('test', 'test@example.com')",
  update: "UPDATE Users SET status = 'active' WHERE id = 1",
  delete: "DELETE FROM Users WHERE status = 'inactive'",
  merge: "MERGE Users AS target USING source ON target.id = source.id",
  
  // DDL 和高危險操作
  drop: "DROP TABLE Users",
  truncate: "TRUNCATE TABLE Orders",
  alter: "ALTER TABLE Users ADD COLUMN age INT",
  create: "CREATE TABLE NewTable (id INT)",
  grant: "GRANT SELECT ON Users TO public",
  execute: "EXECUTE sp_configure",
  backup: "BACKUP DATABASE TestDB TO DISK = 'backup.bak'",
  
  // SQL 注入測試
  multiStatement: "SELECT * FROM Users; DROP TABLE Users;",
  emptyQuery: "",
  
  // 其他查詢
  showTables: "SHOW TABLES",
  describe: "DESCRIBE Users"
};

// 測試不同的權限配置
const testScenarios = [
  {
    name: "只讀模式（預設）",
    env: {
      MSSQL_ALLOW_INSERT: 'false',
      MSSQL_ALLOW_UPDATE: 'false',
      MSSQL_ALLOW_DELETE: 'false',
      MSSQL_DANGER_MODE: 'false'
    },
    expected: {
      select: true,
      selectWithTop: true,
      withClause: true,
      insert: false,
      update: false,
      delete: false,
      drop: false,
      truncate: false,
      multiStatement: false
    }
  },
  {
    name: "基本寫入模式",
    env: {
      MSSQL_ALLOW_INSERT: 'true',
      MSSQL_ALLOW_UPDATE: 'true',
      MSSQL_ALLOW_DELETE: 'false',
      MSSQL_DANGER_MODE: 'false'
    },
    expected: {
      select: true,
      insert: true,
      update: true,
      delete: false,
      drop: false,
      merge: true
    }
  },
  {
    name: "完整 DML 模式",
    env: {
      MSSQL_ALLOW_INSERT: 'true',
      MSSQL_ALLOW_UPDATE: 'true',
      MSSQL_ALLOW_DELETE: 'true',
      MSSQL_DANGER_MODE: 'false'
    },
    expected: {
      select: true,
      insert: true,
      update: true,
      delete: true,
      drop: false,
      alter: false
    }
  },
  {
    name: "危險模式（允許所有操作）",
    env: {
      MSSQL_ALLOW_INSERT: 'false',
      MSSQL_ALLOW_UPDATE: 'false',
      MSSQL_ALLOW_DELETE: 'false',
      MSSQL_DANGER_MODE: 'true'
    },
    expected: {
      select: true,
      insert: true,
      update: true,
      delete: true,
      drop: true,
      truncate: true,
      alter: true,
      create: true,
      grant: true,
      execute: true,
      backup: true
    }
  }
];

console.log("🧪 MSSQL MCP 權限控制系統測試\n");
console.log("=" .repeat(60));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// 執行測試
for (const scenario of testScenarios) {
  console.log(`\n📋 測試場景: ${scenario.name}`);
  console.log("-".repeat(40));
  
  // 設定環境變數
  for (const [key, value] of Object.entries(scenario.env)) {
    process.env[key] = value;
  }
  
  // 顯示當前權限設定
  console.log("權限設定:");
  console.log(`  INSERT: ${process.env.MSSQL_ALLOW_INSERT === 'true' ? '✅' : '❌'}`);
  console.log(`  UPDATE: ${process.env.MSSQL_ALLOW_UPDATE === 'true' ? '✅' : '❌'}`);
  console.log(`  DELETE: ${process.env.MSSQL_ALLOW_DELETE === 'true' ? '✅' : '❌'}`);
  console.log(`  DANGER: ${process.env.MSSQL_DANGER_MODE === 'true' ? '🚨' : '❌'}`);
  console.log();
  
  // 測試每個查詢
  for (const [queryType, expectedResult] of Object.entries(scenario.expected)) {
    const query = testQueries[queryType];
    const result = validateReadOnlyQuery(query);
    const expected = expectedResult;
    const passed = result.isValid === expected;
    
    totalTests++;
    if (passed) {
      passedTests++;
      console.log(`  ✅ ${queryType}: ${expected ? '允許' : '拒絕'} (正確)`);
    } else {
      failedTests++;
      console.log(`  ❌ ${queryType}: 預期 ${expected ? '允許' : '拒絕'}，實際 ${result.isValid ? '允許' : '拒絕'}`);
      if (!result.isValid && result.reason) {
        console.log(`     原因: ${result.reason}`);
      }
    }
  }
}

// 特殊測試案例
console.log("\n📋 特殊測試案例");
console.log("-".repeat(40));

// 測試空查詢
process.env.MSSQL_DANGER_MODE = 'false';
const emptyResult = validateReadOnlyQuery("");
totalTests++;
if (!emptyResult.isValid && emptyResult.reason) {
  passedTests++;
  console.log(`  ✅ 空查詢: 正確拒絕 - ${emptyResult.reason}`);
} else {
  failedTests++;
  console.log(`  ❌ 空查詢: 應該要拒絕`);
}

// 測試多語句
const multiResult = validateReadOnlyQuery("SELECT * FROM Users; DROP TABLE Users;");
totalTests++;
if (!multiResult.isValid && multiResult.reason) {
  passedTests++;
  console.log(`  ✅ 多語句: 正確拒絕 - ${multiResult.reason}`);
} else {
  failedTests++;
  console.log(`  ❌ 多語句: 應該要拒絕`);
}

// 顯示測試結果摘要
console.log("\n" + "=".repeat(60));
console.log("📊 測試結果摘要");
console.log("-".repeat(40));
console.log(`總測試數: ${totalTests}`);
console.log(`✅ 通過: ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
console.log(`❌ 失敗: ${failedTests} (${(failedTests/totalTests*100).toFixed(1)}%)`);

if (failedTests === 0) {
  console.log("\n🎉 所有測試都通過了！權限控制系統運作正常。");
} else {
  console.log("\n⚠️ 部分測試失敗，請檢查權限控制邏輯。");
  process.exit(1);
}