## 流程
- 建立 redis 連線
- 建立 mongodb 連線
- 取得現在年份
- 取得全部股票ID
- 取得目前爬蟲抓取序列指標
- 取得股票殖利率資訊（股價、歷年平均殖利率、年均殖利率、發放股利年份、該年份填權息成功與否）
  - 取得股價
  - 取得歷年殖利率資料
  - 設定填權息狀態(成功、失敗、未發放)
  - 設定填權息次數
  - 判斷取得的是年份還是∟
  - 若是∟則繼續直到找到下一個年份，並計算同一年份是否全都有填權息
  - 判斷是否有發現金股利
  - 有發現金股利則判斷是否有填息
  - 沒填息設定失敗、有填息設定成功
  - 判斷是否有發股票股利
  - 有發股票股利則判斷是否有填權
  - 沒填權設定失敗、有填權設定成功
  - 儲存當年份資訊
  - 直到所有年份皆儲存
- 判斷所有年分的填權息成功列表
  - 判斷是否一年當中有超過一次配息
  - 若有則判斷除了第一個外其他全部都要成功填權息
  - 沒有則判斷第一個是否成功填權息
  - 成功填權息則將記錄增加1
- 取得的紀錄除上所有年份的數量得出填權息成功率
- 將填權息成功率記錄到資料庫
- 增加爬蟲抓取序列指標並記錄
  
## 參考第三方 API
- 取得GOODINFO網站的股票ID資訊 <https://goodinfo.tw/tw/StockLib/js/TW_STOCK_ID_NM_LIST.js?0>  
```
/*檔案更新時間:2022/09/21 06:03:22*/
var garrTW_LIST_STOCK_ID_NM = []
var garrTW_LIST_STOCK_ID = []  //取得股票ID
var garrTW_LIST_STOCK_NM = []
```

---

- 取得GOODINFO的股票年均殖利率資訊 https://goodinfo.tw/tw/StockDividendPolicy.asp?STOCK_ID=2330  

```
// 股價
document.querySelector("body > table:nth-child(8) > tbody > tr > td:nth-child(3) > table:nth-child(1) > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)")

// 歷年平均殖利率
document.querySelector("#divDividendSumInfo > div > div > table > tbody > tr:nth-child(6) > td:nth-child(5)")

// 發放股利年份（需判斷年份是否重複，重複則繼續直到找到下一個年份，並計算同一年份是否全都有填權息）
document.querySelector("#tblDetail > tbody > tr:nth-child(5) > td:nth-child(1) > nobr > b")

// 年均殖利率
document.querySelector("#tblDetail > tbody > tr:nth-child(5) > td:nth-child(19)")

// 填息天數
document.querySelector("#tblDetail > tbody > tr:nth-child(5) > td:nth-child(11)")

// 填權天數
document.querySelector("#tblDetail > tbody > tr:nth-child(5) > td:nth-child(12)")
```

## 公式
- 現金殖利率公式 =（現金股利 ÷ 除權息前一日收盤價）
- 除權息參考價公式 = (除權息前一日收盤價 - 現金股利 ) ÷ ( 1 +（股票股利 ÷ 10）)
- 配股 = 股票股利 x 100
- 配股價值公式 = 配股 x 除權息參考價
- 還原殖利率公式 =（現金股利 + 配股價值）÷ 除權息前一日收盤價

## 資料庫
- mongodb
  - stock
    - id `string`
    - company `string`
    - price `double`
    - historicDividendYield `double`
    - fulfillDividend `bool`
- redis
  - STOCK_ID_INDEX `int`

## 開發流程
- sudo service mongodb start
- sudo service redis-server start