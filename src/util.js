const util = {};

/**
 * 获取字符串的 哈希值 
 */
util.getHashCode = (str, caseSensitive) => {
  if(!caseSensitive){
    str = str.toLowerCase();
  }
  let hash = 1315423911,i,ch;
  for (i = str.length - 1; i >= 0; i--) {
    ch = str.charCodeAt(i);
    hash ^= ((hash << 5) + ch + (hash >> 2));
  }
  return  (hash & 0x7FFFFFFF);
}
util.isObject = (data) => {
  return Object.prototype.toString.call(data) === '[object Object]'
}
export default util;