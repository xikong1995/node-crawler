// 登录用户 cookie
const COOKIE = ''
// VPN代理
const PROXY = ''
// 域名
const DOMAIN = 'https://www.instagram.com'
// 用户ID
const USERNAME = ''
// 同一时间发起的请求数量
const THREAD_COUNT = 3
// 固定值，一般不用修改
const FIRST_PART_API = `${DOMAIN}/${USERNAME}/`
// 固定值，一般不用修改
const OTHER_PART_API = `${DOMAIN}/graphql/query/`
// 固定值，一般不用修改
const HOMEPAGE_HASH = 'bfa387b2992c3a52dcbe447467b4b771'

module.exports = {
    COOKIE,
    PROXY,
    USERNAME,
    THREAD_COUNT,
    FIRST_PART_API,
    OTHER_PART_API,
    HOMEPAGE_HASH,
}
