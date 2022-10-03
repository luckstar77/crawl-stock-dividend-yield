import { connect as redisConnect } from './db/redis';
import { connect as mongodbConnect } from './db/mongodb';
import axios from 'axios';
import * as acorn from "acorn";
import * as cheerio from "cheerio";


const COLLECTION = 'stock';
const STOCK_IDS_URL = 'https://goodinfo.tw/tw/StockLib/js/TW_STOCK_ID_NM_LIST.js?0';
const DIVIDEND_PREFIX_URL = 'https://goodinfo.tw/tw/StockDividendPolicy.asp?STOCK_ID=';

enum DividendState {
    SUCCESS,
    FAILURE,
    NOTHING
}

interface Dividend {
    [key: string]: DividendState[]
}

(async () => {
    const mongodbClient = await mongodbConnect();
    const redisClient = await redisConnect();
    
    let stockIdsIndex:number = parseInt((await redisClient.get('STOCK_ID_INDEX'))!);
    const findResult = await mongodbClient.collection(COLLECTION).find({}).toArray();
    const {data: stockIdsText} = await axios.get(STOCK_IDS_URL);
    const stockIdsParsed = acorn.parse(
        stockIdsText,
        { ecmaVersion: 2020 }
      );

       // TODO: https://github.com/acornjs/acorn/issues/741
       // @ts-ignore
    const stockIds: {value: string}[] = stockIdsParsed.body[0].declarations[0].init.elements

    // stockIds the first useful value is third element.
    const STOCK_IDS_MAX = stockIds.length;
    if(stockIdsIndex >= STOCK_IDS_MAX) stockIdsIndex = 2;
    if(stockIdsIndex < 2) stockIdsIndex = 2;
    const [stockId, stockName] = stockIds[stockIdsIndex].value.split(' ');

       // TODO: https://github.com/acornjs/acorn/issues/741
       // @ts-ignore
    const {data: dividendText} = await axios.get(DIVIDEND_PREFIX_URL + stockId);
    let $ = cheerio.load(dividendText);
    const price = parseFloat($('body > table:nth-child(8) > tbody > tr > td:nth-child(3) > table:nth-child(1) > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(3) > td:nth-child(1)').text());
    const allAvgCashYields = parseFloat($('#divDividendSumInfo > div > div > table > tbody > tr:nth-child(4) > td:nth-child(5)').text())
    const allAvgRetroactiveYields = parseFloat($('#divDividendSumInfo > div > div > table > tbody > tr:nth-child(6) > td:nth-child(5)').text())

    let yearText:string;
    let year:number;
    let $trs = $('#tblDetail > tbody > tr');
    let dividends: Dividend = {};
    for(let i = 4; i < $trs.length - 1; i++) {
        let dividendState: DividendState = DividendState.NOTHING 
        let $dividendTr = $trs.eq(i);
        yearText = $dividendTr.children('td').eq(0).text()
        if(!isNaN(yearText as any)) {
            year = parseInt(yearText);
            dividends[year] = [];
        } else if(yearText !== '∟') continue;
        const cashDividendText = $dividendTr.children('td').eq(3).text()
        const stockDividendText = $dividendTr.children('td').eq(6).text()
        const cashDividendSpendDaysText = $dividendTr.children('td').eq(10).text()
        const stockDividendSpendDaysText = $dividendTr.children('td').eq(11).text()
        if(cashDividendText !== '0' && cashDividendText !== '-') {
            if(cashDividendSpendDaysText !== '-') dividendState = DividendState.SUCCESS;
            else dividendState = DividendState.FAILURE;
        }
        if(stockDividendText !== '0' && stockDividendText !== '-' && dividendState !== DividendState.FAILURE) {
            if(stockDividendSpendDaysText !== '-') dividendState = DividendState.SUCCESS;
            else dividendState = DividendState.FAILURE;
        }
        dividends[year!].push(dividendState);
    }
})();