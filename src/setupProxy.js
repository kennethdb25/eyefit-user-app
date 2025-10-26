const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      target:
        "https://eyefit-shop-800355ab3f46.herokuapp.com:5000",
      // "http://localhost:5000",
      changeOrigin: true,
      pathFilter: "/api",
      onBeforeSetupMiddleware: undefined,
      onAfterSetupMiddleware: undefined,
    })
  );
};
