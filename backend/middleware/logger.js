const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const start = Date.now();

    res.on('finish', () => {
        const status = res.statusCode;
        const finish = Date.now();
        const timeResponse = finish - start;

        console.log(`[${timestamp}] ${method} ${url} - ${status} - ${timeResponse}ms`);
    });
    next();
};

module.exports = logger;