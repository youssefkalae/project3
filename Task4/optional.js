const express = require('express');
const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379
});
client.on('error', (err) => console.log('Redis Client Error', err));

const app = express();
app.use(express.json());

app.get('/stocks', (req, res) => {
    client.zrevrange('mostViewedStocks', 0, -1, 'WITHSCORES', (err, result) => {
        if (err) {
            res.status(500).send('Error retrieving stocks');
            return;
        }
        const stocks = [];
        for (let i = 0; i < result.length; i += 2) {
            stocks.push({ stockId: result[i], views: parseInt(result[i + 1]) });
        }
        res.json(stocks);
    });
});

app.post('/stocks', (req, res) => {
    const { stockId } = req.body;
    client.zincrby('mostViewedStocks', 1, stockId, (err, result) => {
        if (err) {
            res.status(500).send('Error incrementing stock view count');
            return;
        }
        res.send(`Updated view count for stock ${stockId}: ${result}`);
    });
});

app.put('/stocks', (req, res) => {
    const { stockId, count } = req.body;
    client.zadd('mostViewedStocks', count, stockId, (err, result) => {
        if (err) {
            res.status(500).send('Error modifying stock view count');
            return;
        }
        res.send(`Set view count for stock ${stockId} to ${count}`);
    });
});

app.delete('/stocks', (req, res) => {
    const { stockId } = req.body;
    client.zrem('mostViewedStocks', stockId, (err, result) => {
        if (err) {
            res.status(500).send('Error deleting stock');
            return;
        }
        res.send(`Deleted stock ${stockId} from view count list`);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    client.connect();
});