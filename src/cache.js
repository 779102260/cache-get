// 插件通常需要考虑多次实例
import Config from './config.js'
import Store from './store.js'

import util from './util.js'

/**
 * 检查请求传入的参数，正确返回true，错误返回promise对象
 * @param {str} api 
 * @param {Object} conf 
 */
const checkArugs = (api, conf) => {
    let msg = '';
    let isOk = true;
    if (typeof api !== 'string') {
        msg = 'url应该是个字符串';
        isOk = false;
    }
    if (!util.isObject(conf)) {
        msg = '配置项应该是个对象';
        isOk = false;
    }
    return isOk ? true : msg;
}
/**
 * 依据请求的url和配置，生成唯一key
 * @param {Object} fetchConfig 三方插件配置
 */
const buildFetchKey = (api, fetchConfig) => {
    const str = JSON.stringify(fetchConfig);
    return api + '_' + util.getHashCode(str);
}

function Cache(config = {}) {
    this.config = new Config(config)
    this.store = new Store(this.config)
}
/**
 * api 接口名
 * config 参数：混合配置，包括axios和userConfig配置
 * 返回值：axios请求的promise对象
 */
Cache.prototype.get = function(api, conf) {
    // 1. 校验参数
    const checkResult = checkArugs(api, conf);
    if (checkResult !== true) {
        return Promise.reject(checkResult); // return promise
    }
    // 2. 获取config
    // 四级：每个请求的单独配置
    const config = Config.merge(this.config.get(), conf)
    // 分离config
    const [myConfig, fetchConfig] = Config.separate(config)
    // 生成唯一key
    const fetchKey = buildFetchKey(api, fetchConfig);
    // 调试
    if (config.debug === 'on') {
        console.log(`cacheGet debug: ${api}`)
    }
    // 
}
