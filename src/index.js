const path = require('path')
const { spawn } = require('child_process')
const chalk = require('chalk')

const type = process.argv[2] || 'weibo'
const args = [path.resolve(__dirname, type, 'index.js')]

const ls = spawn('node', args)

ls.stdout.on('data', (data) => {
    console.log(chalk.green(data.toString()))
})

ls.stderr.on('data', (data) => {
    console.error(data.toString())
})

ls.on('close', (code) => {
    console.log(chalk.blueBright('全部爬取结束'))
})
