import { connect as redisConnect } from './db/redis';
import { connect as mongodbConnect } from './db/mongodb';

const COLLECTION = 'stock';

(async () => {
    const mongodbClient = await mongodbConnect();
    const redisClient = await redisConnect();
    
    const STOCK_ID_INDEX = await redisClient.get('STOCK_ID_INDEX');
    const findResult = await mongodbClient.collection(COLLECTION).find({}).toArray();
})();