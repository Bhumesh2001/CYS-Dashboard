const NodeCache = require("node-cache");
const cache = new NodeCache();

module.exports = {
    cacheMiddleware: (req, res, next) => {
        const key = req.originalUrl;         
        const cachedData = cache.get(key);

        if (cachedData) {
            return res.status(200).json(cachedData); // Serve from cache
        };

        res.sendResponse = res.json;
        res.json = (body) => {
            cache.set(key, body, 1800); // Cache response for 10 minutes
            res.sendResponse(body);
        };

        next();
    },

    // Function to flush specific cache
    flushCacheByKey: (key) => {
        cache.del(key);
    },

    // Function to flush entire cache
    flushAllCache: () => {
        cache.flushAll();
    },
};
