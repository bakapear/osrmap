let fs = require('fs')
let https = require('https')
let path = require('path')

async function main () {
  let file = process.argv[2]
  if (!file || !file.endsWith('.osr')) return console.error('Please input an osu! replay file.')
  let replay = fs.readFileSync(file, { encoding: 'binary' })
  let hash = replay.substr(replay.indexOf(' ') + 2, 32)
  let map = await get('https://ripple.moe/api/get_beatmaps?h=' + hash)
  map = JSON.parse(map)[0]
  if (!map) return console.error('Could not find beatmap from replay.')
  let name = `${map.beatmapset_id} ${map.artist} - ${map.title}`
  let osu = await get('https://bloodcat.com/osu/_data/beatmaps/' + map.beatmapset_id + '.osz', 'binary', (current, total) => {
    write(`Downloading "${name}" ${((current * 100) / total).toFixed(2)}%`)
  })
  name = name.replace(/[/?<>\\:*|"]/g, '')
  fs.writeFileSync(path.join(path.dirname(file), name) + '.osz', osu, { encoding: 'binary' })
}

main()

function get (url, encoding, progress) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (encoding) res.setEncoding(encoding)
      let total = Number(res.headers['content-length'])
      let cur = 0
      let body = ''
      res.on('data', function (chunk) {
        body += chunk
        cur += chunk.length
        if (progress) progress(cur, total)
      })
      res.on('end', () => resolve(body))
    }).on('error', reject)
  })
}

function write (msg) {
  process.stdout.cursorTo(0)
  process.stdout.clearLine()
  process.stdout.write(msg)
}
