## 流程
- 建立 redis 連線
- 建立 mongodb 連線
- 取得現在年份
- 取得全部股票ID
- 取得目前爬蟲抓取序列指標
- 取得股票殖利率資訊（股價、歷年平均殖利率、年均殖利率、發放股利年份、該年份填權息成功與否）
  - 取得股價
  - 取得每一年度的殖利率資料
  - 判斷取得的是年份還是∟
  - 若是∟則繼續直到找到下一個年份，並計算同一年份是否全都有填權息
  - 儲存當年份資訊
  - 直到所有年份皆儲存
  
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