# swan-app

## 作用：

作为`swan-js`和`swan-js-api`、`swan-component`的最上游模块，也是管理模块依赖关系的容器。通过构造器注入的方式，将所需要的 global、 api、 components、 注入到核心模块 core 中。

## 编译脚本：

`sh build.sh` 请注意npm换源

## 内部结构：

master: 产出 `swanjs`的逻辑层

master/master.html 客户端加载的入口h5文件（非v8/jsc环境）

master/master.js 客户端加载的入口h5文件的主逻辑

slave： 产出 `swanjs`的视图层

slave/slave.html 客户端加载的入口文件

slave/slave.js 客户端加载的入口h5文件的主逻辑

runtime/index.js： v8/jsc环境下的入口主逻辑文件

monitor/index.js： 性能监控相关
