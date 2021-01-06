let fs = require('fs')
let path = require('path')
let https = require('https')

let TYPE = 'mini'

async function main (replay) {
  if (!replay || !replay.endsWith('.osr')) return console.error('Please input an osu! replay file.')

  let map = await getMapFromReplay(replay)
  if (!map) return console.error('Could not find beatmap from replay.')

  let name = `${map.beatmapset_id} ${map.artist} - ${map.title}`.replace(/[/?<>\\:*|"]/g, '')

  let file = await downloadMap(map.beatmapset_id, (current, total) => {
    write(`Downloading "${name}" ${((current * 100) / total).toFixed(2)}%`)
  })
  fs.writeFileSync(path.join(path.dirname(replay), name) + '.osz', file, { encoding: 'binary' })
}

async function getMapFromReplay (file) {
  let replay = fs.readFileSync(file, { encoding: 'binary' })
  let hash = replay.substr(replay.indexOf(' ') + 2, 32)
  let map = await get('https://ripple.moe/api/get_beatmaps?h=' + hash)
  return JSON.parse(map)[0]
}

async function downloadMap (set, progress) {
  let map = await get(`https://txy1.sayobot.cn/beatmaps/download/${TYPE}/${set}`, 'binary', progress)
  return map
}

function write (msg) {
  process.stdout.cursorTo(0)
  process.stdout.clearLine()
  process.stdout.write(msg)
}

async function get (url, encoding, progress) {
  return new Promise((resolve, reject) => {
    https.get(url, async res => {
      if (res.statusCode >= 300 && res.statusCode < 400) {
        return resolve(get(res.headers.location, encoding, progress))
      }
      if (encoding) res.setEncoding(encoding)
      let total = res.headers['content-length'] || 0
      let data = ''
      res.on('data', d => {
        data += d
        if (progress) progress(data.length, total)
      })
      res.on('end', () => resolve(data))
    })
  })
}

main(process.argv[2])
