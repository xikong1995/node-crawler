const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const async = require('async')
const cheerio = require('cheerio')
const request = require('superagent')
require('superagent-proxy')(request)

const { COOKIE, PROXY, USERNAME, THREAD_COUNT, FIRST_PART_API, OTHER_PART_API, HOMEPAGE_HASH } = require('./config.js')

class Crawler {
    constructor() {
        this.pageIndex = 1
        this.pageCount = -1
        this.init()
    }

    init() {
        this.fetchFirstPageData()
    }

    /**
     * 抓取用户第一页图片数据
     */
    async fetchFirstPageData() {
        console.log(FIRST_PART_API)
        try {
            const res = await request.get(FIRST_PART_API).set({ cookie: COOKIE }).proxy(PROXY)
            const $ = cheerio.load(res.text)
            const body = $('body')
            const html = body.find('script').eq(0).html()
            const jsonStr = html.replace(/window._sharedData\s*=\s*(\{.+\})\;/g, '$1')
            const jsonObj = JSON.parse(jsonStr)
            const data = jsonObj.entry_data
            const user = data.ProfilePage[0].graphql.user
            const userinfo = user.edge_owner_to_timeline_media
            const { count, page_info, edges } = userinfo
            await this.parseSource(edges)

            if (page_info.has_next_page) {
                await this.fetchOtherPageData(user.id, page_info.end_cursor)
            }
        } catch (err) {
            console.error('抓取用户第一页数据失败：', err)
        }
    }

    /**
     * 抓取用户其他页图片数据
     * @param {string} id 用户id
     * @param {string} after 下一页的标识符
     */
    async fetchOtherPageData(id, after) {
        const query = {
            query_hash: HOMEPAGE_HASH,
            variables: `{"id":"${id}","first":12,"after":"${after}"}`,
        }
        try {
            const res = await request
                .get(OTHER_PART_API)
                .query(query)
                .set({ 'Content-Type': 'application/json', cookie: COOKIE })
                .proxy(PROXY)
            const {
                data: { user },
            } = res.body
            const userinfo = user.edge_owner_to_timeline_media
            const { count, page_info, edges } = userinfo
            await this.parseSource(edges)

            if (page_info.has_next_page) {
                await this.fetchOtherPageData(id, page_info.end_cursor)
            }
        } catch (err) {
            console.error('抓取用户其他页数据失败：', err.message)
        }
    }

    /**
     * 解析图片地址并进行下载
     * @param {array} edges 用户主页信息
     */
    async parseSource(edges) {
        return async.mapLimit(edges, THREAD_COUNT, async ({ node }) => {
            if (node.is_video) {
                return await this.downloadVideo(node.video_url)
            } else {
                return await this.downloadImage(node.display_url)
            }
        })
    }

    /**
     * 下载图片到本地
     * @param {string} url 图片地址
     */
    async downloadImage(url) {
        const userPath = path.resolve(__dirname, 'assets', USERNAME)
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath)
        }
        const pattern = /[^\/]+\.jpg/
        const fileName = url.match(pattern)[0]
        const filePath = path.resolve(userPath, fileName)

        try {
            if (!fs.existsSync(filePath)) {
                const res = await request.get(url).proxy(PROXY)
                fs.writeFileSync(filePath, res.body)
                console.log(chalk.hex('#FF9966')(`图片${fileName}下载成功`))
            } else {
                console.log(chalk.hex('#FF9966')(`图片${fileName}已经存在`))
            }
            return fileName
        } catch (err) {
            console.error('图片下载失败：', err.message)
        }
    }

    /**
     * 下载视频到本地
     * @param {string} url 视频地址
     */
    async downloadVideo(url) {
        const userPath = path.resolve(__dirname, 'assets', USERNAME)
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath)
        }
        const pattern = /[^\/]+\.mp4/
        const fileName = url.match(pattern)[0]
        const filePath = path.resolve(userPath, fileName)

        try {
            if (!fs.existsSync(filePath)) {
                const res = await request.get(url).proxy(PROXY)
                fs.writeFileSync(filePath, res.body)
                console.log(chalk.hex('#FFCCCC')(`视频${fileName}下载成功`))
            } else {
                console.log(chalk.hex('#FFCCCC')(`视频${fileName}已经存在`))
            }
            return fileName
        } catch (err) {
            console.error('视频下载失败：', err.message)
        }
    }
}

new Crawler()
