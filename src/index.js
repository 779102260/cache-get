/**
 * 用于请求并缓存结果
 * 使用：cacheRequest(url, {flag, overTime, axios配置项})
 * config 是axios配置项 + 本插件需要的配置项（见config）
 */
import axios from 'axios';
import util from './util.js';

// 插件配置
let 
  fetch = axios, // 本插件用的axios，可更换
  fetchConfig = {} // 请求插件默认配置
;
// 本插件配置
let 
  config = {
    overTime: 24 * 60 * 60 * 1000, // 可选，不填永久缓存，默认过期时间
    maxCache: 1000, // 最大缓存数量
  }
;

// 存储对象
let
  store = {
    // hashkey: {
    //   promise: Promise, // 请求的priomise对象
    //   createTime: Number, // 单位毫秒
    //   overTime: Number, // 过期时长，单位毫秒, -1不过期
    //   flag: Any, // 自定义标记，用于删除
    // }
  },
  preWashTime = new Date().getTime() // 上次清洗时间
;  

/**
 * 清洗store，去除过期的缓存（避免爆掉内存）
 */
const washStore = () => {
  const nowTime = new Date().getTime();
  // 最大缓存1000条
  if (Object.keys(store).length > config.maxCache) {
    store = {};
    return;
  }
  // 限制清洗频率（5分钟）
  if (nowTime - preWashTime < 5 * 60 * 1000) {
    return;
  }
  preWashTime = new Date().getTime();
  for (let i in store) {
    const cacheItem = store[i];
    // 删除过期的缓存
    const overTime = cacheItem.overTime === undefined ? config.overTime : cacheItem.overTime;
    if (overTime !== -1 && nowTime - cacheItem.createTime > overTime) {
      delete store[i];
    }
  }
}

/**
 * 将api放入缓存
 * @param {*} key 
 * @param {*} conf 
 * @param {*} promise 
 */
const addToStore = (key, conf, promise) => {
  store[key] = {
    promise,
    createTime: new Date().getTime(),
    overTime: conf.overTime
  }
}
/**
 * 通过axios请求数据，并返回promise
 * @param {*} api 
 * @param {*} conf 
 */
const fetchData = (api, conf) => {
  return fetch.get(api, {...fetchConfig, ...conf})
}

/**
 * 检查请求是否已存储其未过期
 * @param {*} key 
 */
const isStoredAndCanUse = (conf, key) => {
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
  if (conf.flag && conf.flag !== cacheItem.flag) { // 标记口令不对
    return false;
  }
  return true;
}

/**
 * 分离请求传入的混合配置
 * @param {Object} allConfig 混合配置 
 */
const separateConfig = (allConfig) => {
  const myConfig = {}; // 本插件的
  const fetchConfig = {}; // axios配置
  for (let i in allConfig) {
    const isMyConfigAttr = config.hasOwnProperty(i);
    const value = allConfig[i];
    if (isMyConfigAttr) {
      myConfig[i] = value;
    } else {
      fetchConfig[i] = value;
    }
  }
  return [myConfig, fetchConfig]
}

/**
 * 依据请求的url和部分配axios配置，生成唯一key
 * @param {Object} fetchConfig axios配置
 */
const buildFetchKey = (api, fetchConfig) => {
  const str = JSON.stringify(fetchConfig);
  return api + '_' + util.getHashCode(str);
}

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
  return isOk ? true : Promise.resolve(msg);
}



const cacheRequest = {};
cacheRequest.set = function(conf) {
  config = {config, ...conf}
}
/**
 * api 接口名
 * config 参数：混合配置，包括axios和userConfig配置
 * 返回值：axios请求的promise对象
 */
cacheRequest.get = function(api, conf) {
  // 参数校验
  const checkResult = checkArugs(api, conf);
  if (checkResult !== true) {
    return checkResult; // promise
  }
  // 分离config
  const [myConfig, fetchConfig] = separateConfig(conf);
  // 生成唯一key
  const fetchKey = buildFetchKey(api, fetchConfig);
  // 每次get，执行一次store清洗检查
  washStore();

  // console.log(api, store)
  // 检查是否已缓存
  if (isStoredAndCanUse(myConfig, fetchKey)) {
    return store[fetchKey].promise;
  }
  // 正常请求
  const promise = fetchData(api, fetchConfig);
  // 缓存结果
  addToStore(fetchKey, myConfig, promise);
  // 请求错误则删除该缓存（拦截）
  promise.catch((error) => {
    delete store[fetchKey];
    return Promise.reject(error);
  });

  return promise
}
/**
 *  根据api删除 remove(api)
 *  根据flag删除 remove('*', flag)
 *  根据api和flag删除 remove(api, flag)
 *  全部删除 remove() / remove('*')
 */
cacheRequest.remove = function(api, flag) {
  // 清空
  if (!api) {
    store = {};
    return this;
  }
  // 条件删除
  for (let key in store) {
    // api 校验不匹配
    if (api !== '*' && key.indexOf(api) !== 0) {
      break;
    }
    // flag 校验不匹配
    if (flag && flag !== store[key].flag) {
      break;
    }
    delete store[key];
  }
  return this;
}

/**
 * 根据flag（自定义标记）移除
 */
cacheRequest.removeByFlag = (flag) => {
  return this.remove('*', flag);
}
/**
 * 方便调试
 */
cacheRequest.logCache = () => {
  console.log(store)
}

export default cacheRequest