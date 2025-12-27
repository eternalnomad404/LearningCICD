module.exports = {
  webpack: function(config, env) {
    // Performance optimizations for development
    if (env === 'development') {
      // Disable source maps for faster builds
      config.devtool = false;
      
      // Optimize babel-loader
      const babelLoader = config.module.rules.find(
        rule => rule.oneOf
      )?.oneOf?.find(
        rule => rule.loader && rule.loader.includes('babel-loader')
      );
      
      if (babelLoader && babelLoader.options) {
        babelLoader.options.cacheDirectory = true;
        babelLoader.options.cacheCompression = false;
      }
    }

    return config;
  },
  
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      
      // Remove deprecated options
      delete config.onBeforeSetupMiddleware;
      delete config.onAfterSetupMiddleware;
      
      // Use the new setupMiddlewares option
      config.setupMiddlewares = (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        
        return middlewares;
      };
      
      return config;
    };
  }
};

