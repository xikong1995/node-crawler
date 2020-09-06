// 登录用户 cookie
const COOKIE = ''
// 用户域名 URI
const SCRIPT_URI = ''
// 同一时间发起的请求数量
const THREAD_COUNT = 3
// 固定值，一般不用修改
const FIRST_PART_API = `https://weibo.com${SCRIPT_URI}`
// 固定值，一般不用修改
const OTHER_PART_API = 'https://weibo.com/p/aj/v6/mblog/mbloglist'

module.exports = {
    COOKIE,
    THREAD_COUNT,
    SCRIPT_URI,
    FIRST_PART_API,
    OTHER_PART_API,
}
