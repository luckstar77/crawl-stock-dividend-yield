import { connect as redisConnect } from './db/redis';
import { connect as mongodbConnect } from './db/mongodb';
import axios from 'axios';
import * as acorn from "acorn";


const COLLECTION = 'stock';
const STOCK_IDS_URL = 'https://goodinfo.tw/tw/StockLib/js/TW_STOCK_ID_NM_LIST.js?0';

(async () => {
    const mongodbClient = await mongodbConnect();
    const redisClient = await redisConnect();
    
    let stockIdsIndex:number = parseInt((await redisClient.get('stockIdsIndex'))!);
    const findResult = await mongodbClient.collection(COLLECTION).find({}).toArray();
    const {data: stockIdsText} = await axios.get(STOCK_IDS_URL);
    const stockIdsParsed = acorn.parse(
        stockIdsText,
        { ecmaVersion: 2020 }
      );

       // TODO: https://github.com/acornjs/acorn/issues/741
       // @ts-ignore
    const stockIds: number[] = stockIdsParsed.body[1].declarations[0].init.elements

    // stockIds the first useful value is third element.
    const STOCK_IDS_MAX = stockIds.length;
    if(stockIdsIndex >= STOCK_IDS_MAX) stockIdsIndex = 2;
    if(stockIdsIndex < 2) stockIdsIndex = 2;

    

})();