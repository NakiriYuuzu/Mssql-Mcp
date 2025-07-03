取得指定資料表的樣本資料進行預覽。

參數：$ARGUMENTS (格式: 資料表名稱 [筆數])

步驟：
1. 解析資料表名稱和樣本筆數（預設 10 筆）
2. 檢查資料表是否存在
3. 執行 SELECT TOP N 查詢取得樣本資料
4. 格式化顯示結果，包括：
   - 欄位名稱和資料類型
   - 樣本資料表格
   - 資料摘要統計

範例用法：
- `/project:sql-sample Users`
- `/project:sql-sample Orders 20`
- `/project:sql-sample dbo.Products 5`