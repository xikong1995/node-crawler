// 登录用户 cookie
const COOKIE =
    'SINAGLOBAL=2459088061473.1426.1618933553333; login_sid_t=8df5ed4a84c724adc621721cf3d55e; cross_origin_proto=SSL; WBStorage=2ceabba76d81138d|undefined; _s_tentry=cn.bing.com; UOR=,,cn.bing.com; wb_view_log=1920*10801; Apache=3876261740503.0576.1625900496252; ULV=1625900496261:3:1:1:3876261740503.0576.1625900496252:1623415002222; ALF=1657436543; SSOLoginState=1625900544; SUB=_2A25N7TZRDeRhGe1US-S3LzTWIHXVumyCZrDV8PUNbmtAKLUj6kW9NQhLG-ECjyNUoPtVJ7Sd1RT5C2p8-1Tvx; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9W5c2DrqDGmfUXns9ZpipH865JpX5KzhUgL.FoMfShM01KeNSo.2dJLoIEXLxK-L12eL1KMLxK-L1hqLBK-LxKqL1-eL1h.LxKBLBonL1h5LxK.LBozLBozt; XSRF-TOKEN=f5Psn9gX931Y0hZHC_p7bfQ_; WBPSESS=XITuXYSnBE80mwpFTRyLCOi0Re1Rzs9NJtGXvsfM1qeQhsOKvHrlxIRvKpYq3NhUk6R8hCnVWV_KfTJil2bkS_CJc-X7IhRSRQgjse8HaMlcg2K739tGnvL6T9'
// 用户域名 URI
const USER_ID = '3261134763'
// 同一时间发起的请求数量
const THREAD_COUNT = 10
// 固定值，一般不用修改
const USER_INFO_API = 'https://www.weibo.com/ajax/profile/info'
const DATA_INFO_API = 'https://www.weibo.com/ajax/statuses/mymblog'
// 是否只爬取图片
const ONLY_PIC = true

module.exports = {
    COOKIE,
    USER_ID,
    THREAD_COUNT,
    USER_INFO_API,
    DATA_INFO_API,
    ONLY_PIC,
}
