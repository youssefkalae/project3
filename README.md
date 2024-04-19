# project3
final project 

For the command line, I checked with John and it seems the example and instructions allow just commands with the functionality and not the need to execute the query. But just incase, I have a demo here:

import { createClient } from 'redis';
import { MongoClient } from 'mongodb';

async function initializeStockViewsFromMongoToRedis() {
    const mongoClient = new MongoClient('mongodb://localhost:27017');
    const redisClient = createClient({
        url: 'redis://localhost:6379'
    });

    try {
        // Connect to both MongoDB and Redis
        await mongoClient.connect();
        await redisClient.connect();

        // Fetch stock data from MongoDB
        const database = mongoClient.db('project2');
        const collection = database.collection('Stocks');
        const stocks = await collection.find({}).toArray();

        // Use the fetched data to set or increment view counts in Redis
        for (const stock of stocks) {
            const { _id, viewCount } = stock;
            await redisClient.zAdd('mostViewedStocks', { score: viewCount, value: _id });
            console.log(`Initialized/Updated view count for stock ${_id} to ${viewCount}`);
        }
    } catch (error) {
        console.error('Error in processing:', error);
    } finally {
        // Ensure both clients will close when you finish/error
        await mongoClient.close();
        await redisClient.quit();
    }
}

// Run the function
initializeStockViewsFromMongoToRedis();

// essentially this connects the servers of both mongo and redis
// increments the view count of a stock (using redis)

I used chatGPT to speed up the process on building the requirements and making command lines more simple on redis 