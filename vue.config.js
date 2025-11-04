const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config
        .output
        .filename('js/[name].js')
        .chunkFilename('js/[name].js')

      config.plugin('extract-css').tap(args => {
        args[0].filename = 'css/[name].css'
        args[0].chunkFilename = 'css/[name].css]'
        return args
      })
    }
  }
})
