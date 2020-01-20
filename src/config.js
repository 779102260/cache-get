// - 小型插件应该通过提供 方法 来初始化配置， 大型的通过配置文件更好
// - 将 config 分离开来，解耦形成一个独立的类，更为集中、清晰
import util from './util.js'

// 一级：默认配置（所有的配置都应该有默认配置，否则separate时会丢失部分配置）
let DEFAULT_CONFIG = {
    overTime: 24 * 60 * 60 * 1000, // 可选，不填永久缓存，默认过期时间
    maxCache: 1000, // 最大缓存数量
    debug: 'off',
}

/**
 * 合并配置项并返回
 * 
 * 注：这边并没有考虑深层复制问题，暂时不需要
 * @param {Array} configs 自定义配置项
 */
function merge(...configs) {
    let merged = {}
    if (!Array.isArray(configs)) {
        return
    }
    for(conf of configs) {
        if (!util.isObject(conf)) {
            console.error('cacheGet：配置项应该是个对象')
            return
        }
        merged = {...merged, ...conf}
    }
    return merged
}

/**
 * 分离本插件配置和三方http插件配置
 * @param {Object} mixConfig 混合配置 
 */
function separate(mixConfig) {
    const my = {} // 本插件的
    const other = {} // axios配置
    for (let i in mixConfig) {
      const isMyConfigAttr = DEFAULT_CONFIG.hasOwnProperty(i);
      const value = mixConfig[i]
      if (isMyConfigAttr) {
        my[i] = value
      } else {
        other[i] = value
      }
    }
    return [my, other]
}



/**
 * 配置类
 * @param {Object} config 包含 本插件配置 和 第三方http插件配置
 */
function Config(config = {}) {
    this.config = config
}
Config.merge = merge
Config.separate = separate
// 二级：自定义默认配置
Config.prototype.setDefault = function(config) {
    if (!util.isObject(config)) {
        console.error('cacheGet：配置项应该是个对象')
        return
    }
    DEFAULT_CONFIG = merge(DEFAULT_CONFIG, config)
}
// 三级：自定义实例配置
/**
 * 合并配置项并返回
 * 
 * 注：这边并没有考虑深层复制问题，暂时不需要
 * @param {Array} configs 自定义配置项
 */
Config.prototype.set = function(config) {
    this.config = merge(this.config, config)
}
/**
 * 配置项通过get获取，这样取的时最新值
 */
Config.prototype.get = function() {
    return merge(DEFAULT_CONFIG, this.config)
}

export default Config