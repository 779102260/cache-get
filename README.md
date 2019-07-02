# cache-get

封装axios GET请求，会缓存请求结果，下次请求同样的接口时，直接从浏览器内存读取

#### 安装

```
npm i -S cache-get
```

#### 直接使用
```vue
import cacheGet from 'cache-get';
cacheGet.get(url, { params: {x} }).then((res) => {
  // 请求成功
}).catch((err) => {
  // 请求失败
})
```

#### 集成到vue

1. 入口文件引入
```js
import cacheGet from 'cache-get';
Vue.prototype.$cacheHttp = cacheGet ;
```

#### api

1 . **`set([config])`**

配置插件，配置项如下：

- `overTime: [number]` 过期时间，毫秒，默认24小时
- `maxCache: [number]` 最大缓存数量，默认1000 （大于此值将会清空所有缓存）

2 . **`get(api, [conf])`**

发送get请求。

- `api: [string]` 请求接口
- `conf: [overTime|flag|axiosConfig]` 配置项
  `flag`指此次请求的标记，`axiosConfig`指本次请求axios的配置项

3 . **`remove([api], [flag])`**

根据api和flag删除指定缓存，2个参数都不填时为清空所有缓存

4 . **`removeByFlag([flag])`**

根据flag删除指定缓存

5 . **`logCache()`**

输出缓存，用于调试