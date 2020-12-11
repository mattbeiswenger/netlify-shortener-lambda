const fs = require('fs')
const { clone } = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const path = require('path')
const { shorten } = require('netlify-shortener')

exports.handler = async function (event, context) {
    const baseUrl = 'example.com'
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const { url, endpoint } = JSON.parse(event.body)
    if (url === undefined) {
        return {
            statusCode: 404,
            body: 'You must provide a "url" parameter',
        }
    }

    const dir = path.join(process.cwd(), 'shortener-clone')
    await clone({
        fs,
        http,
        dir,
        corsProxy: 'https://cors.isomorphic-git.org',
        url: 'https://github.com/mattbeiswenger/netlify-shortener-lambda',
        ref: 'main',
        onAuth: () => {
            return {
                username: `${process.env.GITHUB_TOKEN}`,
            }
        },
    })

    const link = shorten(baseUrl, dir, url, endpoint)

    return {
        statusCode: 200,
        body: link,
    }
}
