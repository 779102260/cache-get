function Store(config) {
    // 以键值对形式，存储每条请求的信息（配置 & http句柄）
    this.store = {
        //...
        // hashkey: {
        //   promise: Promise, // 请求的priomise对象
        //   createTime: Number, // 单位毫秒
        //   overTime: Number, // 过期时长，单位毫秒, -1不过期
        //   flag: Any, // 自定义标记，用于删除
        // }
    }
    this.config = config
    // 上次清洗时间
    this.preWashTime = new Date().getTime()
}
/**
 * 获取存储的请求（未经过检查）
 */
Store.prototype.get = function(key) {
    // 返回前，进行parse
    return this.store[key].promise.then(data => {
      return JSON.parse(data)
    }).catch(err => {
      return JSON.parse(err)
    })
}
/**
 * 根据单条请求的配置，检查请求是否存储且可用
 * 1. 存在
 * 2. 其未过期
 * 3. 标记正确
 */
Store.prototype.check = function(key, config) {
    let cacheItem = store[key];
    if (!cacheItem) { // 未存
      return false;
    }
    // 检查是否过期
    if (cacheItem.overTime && cacheItem.overTime !==-1 && new Date().getTime() - cacheItem.createTime > cacheItem.overTime) { 
      delete store[key];
      return false;
    }
    // 检查标记是否正确
    if (config && config.flag && config.flag !== cacheItem.flag) { // 标记口令不对
      return false;
    }
    return true;
}
Store.prototype.add = function(key, conf, promise) {
    // 添加前，将返回数据stringify，取出时再parse，避免产生引用
    const hanlder = promise.then(res => {
        if (typeof res === 'object') {
          return JSON.stringify(res)
        }
    }).catch(err => {
        if (typeof error === 'object') {
          return JSON.stringify(err)
        }
    })
    // add
    this.store[key] = {
        promise: hanlder,
        createTime: new Date().getTime(),
        overTime: conf.overTime
    }
}
/**
 * 清洗store，超量清空 && 去除过期的缓存（避免爆掉内存）
 */
Store.prototype.wash = function() {
    const nowTime = new Date().getTime();
    // 最大缓存1000条（超出全清）
    if (Object.keys(this.store).length > this.config.maxCache) {
        this.store = {};
        return;
    }
    // 限制清洗频率（5分钟）
    if (nowTime - this.preWashTime < 5 * 60 * 1000) {
        return;
    }
    // 清洗（删除过期的）
    preWashTime = new Date().getTime();
    for (let i in this.store) {
        const cacheItem = store[i];
        // 删除过期的缓存
        const overTime = cacheItem.overTime === undefined ? this.config.overTime : cacheItem.overTime;
        if (overTime !== -1 && nowTime - cacheItem.createTime > overTime) {
            delete this.store[i];
        }
    }
}

export default Store