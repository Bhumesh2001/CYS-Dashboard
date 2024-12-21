const NodeCache = require("node-cache");
const cache = new NodeCache();

module.exports = {
    cacheMiddleware: (req, res, next) => {
        const key = req.originalUrl;         
        const cachedData = cache.get(key);

        if (cachedData) {
            // console.log("Cache hit!");
            return res.status(200).json(cachedData); // Serve from cache
        };

        // console.log("Cache miss!");
        res.sendResponse = res.json;
        res.json = (body) => {
            cache.set(key, body, 600); // Cache response for 10 minutes
            res.sendResponse(body);
        };

        next();
    },

    // Function to flush specific cache
    flushCacheByKey: (key) => {
        // console.log(`Flushing cache for key: ${key}`);
        cache.del(key);
    },

    // Function to flush entire cache
    flushAllCache: () => {
        // console.log("Flushing all cache");
        cache.flushAll();
    },
};
