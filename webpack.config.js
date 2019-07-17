/**
 * @file webpack config for swan
 * @author sunweinan(sunweinan@baidu.com)
 */
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const pkg = require('./package.json');
const polyfill = require('./tool/polyfill');
const path = require('path');
const prevDir = path.resolve(__dirname, '..');

module.exports = {
    entry: {
        'master': [...polyfill.resource, __dirname + '/src/master/index.js'],
        'slaves': [...polyfill.resource, __dirname + '/src/slaves/index.js'],
        'monitor': __dirname + '/src/monitor/index.js',
        'runtime': __dirname + '/src/runtime/index.js',
        'promise-polyfill': 'core-js/fn/promise'
    },
    output: {
        path: __dirname + '/dist/box/',
        filename: '[name]/index.js',
        libraryTarget: 'umd'
    },
    devtool: false,
    plugins: [
        new CopyWebpackPlugin([
            {
                from: prevDir + '/swan-js/dist/box/**',
                to: __dirname + '/dist/box/[1].[ext]',
                test: /box\/(.*)\.[^.]+$/
            },
            {
                from: prevDir + '/swan-components/dist/styles_index.css',
                to: __dirname + '/dist/box/slaves/styles_slaves.css'
            },
            {
                from: __dirname + '/src/*/*.html',
                to: __dirname + '/dist/box/[1]/[name].[ext]',
                transform: function (content, path) {
                    if (path.indexOf('master.html') >= 0 || path.indexOf('slaves.html') >= 0) {
                        return new Buffer(content
                            .toString('utf-8')
                            .replace('\'<%- SwanVersion %>\'', '\'' + pkg.version + '\''));
                    } else {
                        return content;
                    }
                },
                test: /([^/]+)\/([^/]+)\.[^.]+$/
            }
        ]),
        new webpack.DefinePlugin({
            V8RUNTIMESWANVERION: JSON.stringify(pkg.version)
        }),
        new webpack.optimize.UglifyJsPlugin({
            // sourceMap: true,
            compress: {
                warnings: false,
                /* eslint-disable fecs-camelcase */
                drop_console: false,
                pure_funcs: ['console.log'] // 移除console
                /* eslint-disable fecs-camelcase */
            },
            // sourceMap: true,
            comments: false
        })
    ],
    resolve: {
        symlinks: false
    },
    module: {
        loaders: [{
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                    plugins: [
                        'transform-class-properties', ['transform-object-rest-spread', {'useBuiltIns': true}],
                        'transform-decorators-legacy',
                        'transform-object-assign'
                    ]
                }
            }
        ]
    }
};
