const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const async = require('async')
const cheerio = require('cheerio')
const request = require('superagent')

const { COOKIE, THREAD_COUNT, SCRIPT_URI, FIRST_PART_API, OTHER_PART_API } = require('./config.js')

class Crawler {
    constructor() {
        this.pageIndex = 1
        this.pageCount = -1
        this.init()
    }

    async init() {
        await this.fetchPartFirst()
    }

    /**
     * 获取每一页的第一部分。PS：微博网页版每一页分三部分。
     */
    async fetchPartFirst() {
        console.log(chalk.blueBright(`--开始下载第${this.pageIndex}页--`))
        const query = {
            profile_ftype: 1,
            is_all: 1,
            page: this.pageIndex,
        }
        let res = ''
        try {
            res = await request.get(FIRST_PART_API).query(query).set({ cookie: COOKIE })
        } catch (err) {
            console.error('获取每页第一部分片段失败', err)
            return
        }
        const $ = cheerio.load(res.text)
        const scripts = $('script')
        let rawHtml = ''
        for (let i = 0; i < scripts.length; i++) {
            const html = $(scripts[i]).html()
            if (html.includes('FM.view({"ns":"pl.content.homeFeed.index","domid":"Pl_Official_')) {
                rawHtml = html
            }
            if (html.includes('var $CONFIG = {};')) {
                global.eval(html)
                this.config = $CONFIG
            }
        }
        // 解析FM.view(...)
        const rawData = rawHtml.slice(8, -1)
        const data = JSON.parse(rawData)
        this.domid = data.domid
        const { imageUrls, videoUrls } = this.parseHtml(data.html)
        await async.mapLimit(imageUrls, THREAD_COUNT, async (item) => {
            return await this.saveImage(item)
        })
        await async.mapLimit(videoUrls, THREAD_COUNT, async (item) => {
            return await this.saveVideo(item)
        })
        await this.fetchPartOther()
    }

    /**
     * 获取每一页的第二、三部分。主要由pagebar参数区分，0表示第二部分，1表示第三部分
     * @param {*} pagebar
     */
    async fetchPartOther(pagebar = 0) {
        const query = {
            ajwvr: 6,
            domain: this.config.domain,
            is_search: 0,
            visible: 0,
            is_all: 1,
            is_tag: 0,
            profile_ftype: 1,
            page: this.pageIndex,
            pagebar: pagebar,
            pl_name: this.domid,
            id: `${this.config.domain}${this.config.oid}`,
            script_uri: SCRIPT_URI,
            feed_type: 0,
            pre_page: this.pageIndex,
            domain_op: this.config.domain,
            __rnd: Date.now(),
        }
        let res = ''
        try {
            res = await request.get(OTHER_PART_API).query(query).set({ cookie: COOKIE })
        } catch (err) {
            console.error('获取每页第二、三部分片段失败', err)
            return
        }
        const html = res.body.data
        if (this.pageCount < 0 && pagebar === 1) {
            this.initPageCount(html)
        }
        const { imageUrls, videoUrls } = this.parseHtml(html)
        await async.mapLimit(imageUrls, THREAD_COUNT, async (item) => {
            return await this.saveImage(item)
        })
        await async.mapLimit(videoUrls, THREAD_COUNT, async (item) => {
            return await this.saveVideo(item)
        })
        if (pagebar === 0) {
            // 获取该页第三部分片段
            await this.fetchPartOther(1)
        } else if (this.pageIndex < this.pageCount) {
            // 获取下一页内容
            this.pageIndex++
            await this.init()
        }
    }

    /**
     * 获取总页数
     * @param {*} html
     */
    initPageCount(html) {
        const $ = cheerio.load(html)
        const list = $('div[action-type=feed_list_page_morelist]').find('li')
        if (list) {
            this.pageCount = list.length
        }
    }

    /**
     * 解析html片段，分离出图片路径
     * @param {*} html
     */
    parseHtml(html) {
        const $ = cheerio.load(html)
        const list = $('div[action-type=feed_list_item]')
        const imageUrls = []
        const videoUrls = []
        list.map((index, item) => {
            const imgs = $(item).find('li[action-type=fl_pics] img')
            imgs.map((index, img) => {
                try {
                    const path = $(img).attr('src')

                    let url = path.replace('thumb150', 'mw690').replace('orj360', 'mw690')
                    url = url.indexOf('http') > -1 ? url : 'http:' + url
                    imageUrls.push(url)
                } catch (err) {
                    console.error('提取图片路径失败', err)
                }
            })

            const videos = $(item).find('li[node-type=fl_h5_video]')
            videos.map((index, video) => {
                try {
                    let path = $(video).prop('video-sources')
                    path = path.replace('fluency=', '')
                    path = decodeURIComponent(decodeURIComponent(path))
                    videoUrls.push(path)
                } catch (err) {
                    console.error('提取视频路径失败', err)
                }
            })
        })

        return { imageUrls, videoUrls }
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
        const userPath = path.resolve(__dirname, 'assets', this.config.title_value)
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
        const userPath = path.resolve(__dirname, 'assets', this.config.title_value)
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
