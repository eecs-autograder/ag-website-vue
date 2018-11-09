const PROXY_CONFIG = [
    {
        context: [
            "/api",
            "/static",
            "/__debug__/"
        ],
        target: "http://django:8001",
        secure: false,
        // logLevel: 'debug',
        // changeOrigin: true
    }
];

module.exports = PROXY_CONFIG;
