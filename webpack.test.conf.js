/**
 * @file webpack test config for swan-app
 * @author lvlei(lvlei03@baidu.com)
 */

module.exports = {
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['env'],
                plugins: [
                    'transform-class-properties',
                    ['transform-object-rest-spread', {
                        useBuiltIns: true
                    }],
                    'transform-decorators-legacy',
                    'transform-object-assign',
                    ['istanbul', {
                        exclude: [
                            'test/**/*', // test单测文件无需考虑
                            'src/log/productLog.js' // 待王杨补充
                        ]
                    }]
                ]
            }
        }]
    }
};