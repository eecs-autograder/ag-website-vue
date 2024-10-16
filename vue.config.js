module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://django:8000",
      },
      "/static": {
        target: "http://django:8000",
      },
      "/__debug__/": {
        target: "http://django:8000",
      },
    },
  },
};
