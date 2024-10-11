module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://django:8001",
      },
      "/static": {
        target: "http://django:8001",
      },
      "/__debug__/": {
        target: "http://django:8001",
      },
    },
  },
};
