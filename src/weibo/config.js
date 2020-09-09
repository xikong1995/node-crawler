// 登录用户 cookie
const COOKIE =
    'SINAGLOBAL=263887192097.334.1596989047030; login_sid_t=0a8e68c300f204e5b770092dc67a4bd2; cross_origin_proto=SSL; _s_tentry=login.sina.com.cn; UOR=www.16xx8.com,widget.weibo.com,cn.bing.com; Apache=4473859130209.192.1599656492622; ULV=1599656492628:5:3:2:4473859130209.192.1599656492622:1599379361733; SUB=_2A25yXKItDeRhGeNO4lUX9C3KwzyIHXVRK5TlrDV8PUNbmtANLVHxkW9NTtYmhIvkxhVv3Xi5bzX9qHSwMUAKSTVY; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WF4F-bnDsH9C09jxBEcbOsU5JpX5KzhUgL.Fo-71KMcShec1h52dJLoIEBLxKML1-qLBoeLxKMLBKeL122LxK-L12qL1KBLxK-L12qL1KBt; SUHB=0oUoPB2z0YQsMH; ALF=1631192573; SSOLoginState=1599656573; wvr=6; webim_unReadCount=%7B%22time%22%3A1599656591828%2C%22dm_pub_total%22%3A0%2C%22chat_group_client%22%3A0%2C%22chat_group_notice%22%3A0%2C%22allcountNum%22%3A0%2C%22msgbox%22%3A0%7D'
// 用户域名 URI
const SCRIPT_URI = '/u/5141494199'
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
