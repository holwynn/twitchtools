#!/usr/bin/env node
const tmi = require('tmi.js')
const colors = require('colors/safe')
const config = require('./config.json')

if (!process.argv[2]) {
    console.log('Usage: ./index.js [channel]')
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

const client = new tmi.client(options)
client.connect()

let users = []

function formatUsername(username) {
    if (users[username]) {
        return users[username]
    }

    let options = [
        colors.red(username),
        colors.green(username),
        colors.blue(username),
        colors.magenta(username),
        colors.cyan(username)
    ]

    users[username] = options[Math.floor(Math.random() * options.length)]
    return users[username]
}

function formatBadges(user) {
    let badges = ""

    if (user.badges && user.badges.broadcaster) {
        badges += `[${colors.bold(colors.red('b'))}]`
        // badges += '🏆'
    }

    if (user.mod) {
        badges += `[${colors.bold(colors.green('m'))}]`
        // badges += '💪'
    }

    if (user.subscriber) {
        badges += `[${colors.bold(colors.magenta('s'))}]`
        // badges += '❤️'
    }

    return badges
}

function formatMessage(user, message) {
    if (!user.emotes) {
        return message
    }

    let positions = []

    for (const key of Object.keys(user.emotes)) { 
        for (const pos of user.emotes[key]) {
            positions.push(pos.split('-'))
        }
    }

    positions.sort((a, b) => {
        return a[0] - b[0]
    })

    let formattedMessage = ''
    let lastIndex = 0

    for (const emoteIndex of positions) {
        let emoteText = message.substring(Number(emoteIndex[0]), Number(emoteIndex[1]) + 1)

        formattedMessage += message.substring(lastIndex, emoteIndex[0])
        formattedMessage += colors.bold(colors.yellow(emoteText))
        lastIndex = Number(emoteIndex[1])+1
    }

    return formattedMessage
}

client.addListener('message', (channel, user, message) => {
    console.log(`${formatBadges(user)}${formatUsername(user['display-name'])}: ${formatMessage(user, message)}`)
})

client.addListener('connected', () => {
    console.log('Connected!')
})
