const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      target:
        // "https://aclc-guidance-management-sys-7ae44f42e747.herokuapp.com:8080",
        "https://eyefit-store-c24fee073fdb.herokuapp.com:8080",
      changeOrigin: true,
      pathFilter: "/api",
      onBeforeSetupMiddleware: undefined,
      onAfterSetupMiddleware: undefined,
    })
  );
};
