#!/usr/bin/env node
const tmi = require('tmi.js')
const config = require('./config.json')

if (!process.argv[2]) {
    console.log('Usage: ./wordcount.js [channel]')
    process.exit(-1)
}

const channel = process.argv[2]

const options = {
    options: {
        debug: false
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: config.username,
        password: config.password
    },
    channels: [channel]
}

let words_db = {}
let blacklist = ['Nightbot', 'Moobot']

const client = new tmi.client(options)
client.addListener('message', (channel, user, message) => {
    if (blacklist.includes(user.username)) {
        console.log(`Reject from ${user.username}`)
        return
    }

    const words = message.split(' ')

    for (const word of words) {
        const w = word.toLowerCase()
        if (words_db[w]) {
            words_db[w] += 1
            continue
        }

        words_db[w] = 1
    }

    const sorted = Object.keys(words_db).sort((a,b) => {
        return words_db[a] - words_db[b]
    })

    console.log(sorted.slice(-10))
})

client.connect()
