const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const async = require('async')
const request = require('superagent')

const {
    COOKIE,
    THREAD_COUNT,
    USER_ID,
    USER_INFO_API,
    DATA_INFO_API,
    ONLY_PIC,
} = require('./config.js')

class Crawler {
    constructor() {
        this.pageIndex = 0
        this.userName = ''
        this.init()
    }

    async init() {
        await this.fetchUser()
        this.fetchData()
    }

    async fetchUser() {
        const query = {
            uid: USER_ID,
        }
        try {
            const { body } = await request.get(USER_INFO_API).query(query).set({ cookie: COOKIE })
            if (body.ok !== 1) {
                console.error('请求数据失败', body.data)
                return
            }
            this.userName = body.data.user.screen_name
        } catch (err) {
            console.error(err)
        }
    }

    async fetchData() {
        this.pageIndex++
        const query = {
            uid: USER_ID,
            page: this.pageIndex,
            feature: 0,
        }
        try {
            const { body } = await request.get(DATA_INFO_API).query(query).set({ cookie: COOKIE })
            if (body.ok !== 1) {
                console.error('请求数据失败', body.data)
                return
            }
            const { list } = body.data
            if (list.length === 0) {
                return
            }
            await async.mapLimit(list, THREAD_COUNT, async (item) => {
                const { source, pic_num, pic_infos, page_info } = item
                if (pic_num > 0) {
                    for (let [key, value] of Object.entries(pic_infos)) {
                        await this.saveImage(value.original.url)
                    }
                    return
                } else if (!ONLY_PIC & page_info && page_info.media_info) {
                    const { mp4_720p_mp4, mp4_hd_url, mp4_sd_url } = page_info.media_info
                    const url = mp4_720p_mp4 || mp4_hd_url || mp4_sd_url
                    if (url) {
                        await this.saveVideo(mp4_720p_mp4 || mp4_hd_url || mp4_sd_url)
                    }
                }
            })
            this.fetchData()
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * 保存图片到本地
     * @param {*} url
     */
    async saveImage(url) {
        const matchRes = url.match(/[^\/]+\.jpg/)
        if (!matchRes) {
            return
        }
        const name = matchRes[0]
        const userPath = path.resolve(__dirname, 'assets', this.userName)
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath)
        }
        const filePath = path.resolve(userPath, name)
        if (fs.existsSync(filePath)) {
            console.log(chalk.yellow(`图片${name}已经存在！`))
        } else {
            try {
                const res = await request.get(url)
                fs.writeFileSync(filePath, res.body)
                console.log(chalk.green(`图片${name}保存成功！`))
            } catch (err) {
                console.error(`图片${name}保存失败`, err)
            }
        }
    }

    /**
     * 保存视频到本地
     * @param {*} url
     */
    async saveVideo(url) {
        const matchRes = url.match(/[^\/]+\.mp4/)
        if (!matchRes) {
            return
        }
        const name = matchRes[0]
        const userPath = path.resolve(__dirname, 'assets', this.userName)
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath)
        }
        const filePath = path.resolve(userPath, name)
        if (fs.existsSync(filePath)) {
            console.log(chalk.yellow(`视频${name}已经存在！`))
        } else {
            try {
                const res = await request.get(url)
                fs.writeFileSync(filePath, res.body)
                console.log(chalk.green(`视频${name}保存成功！`))
            } catch (err) {
                console.error(`视频${name}保存失败`, err)
            }
        }
    }
}

new Crawler()
