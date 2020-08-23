let fs = require('fs')
let path = require('path')

let add = fs.readFileSync(path.join(__dirname, 'template', 'add.txt'), { encoding: 'utf-8' })
  .replace('%LABEL%', 'Get Map')
  .replace('%PATH%', `\\"${path.join(__dirname, '..', 'run.bat').replace(/\\/g, '\\\\')}\\" \\"%1\\"`)
fs.writeFileSync(path.join(__dirname, '..', 'add.reg'), add)

let remove = fs.readFileSync(path.join(__dirname, 'template', 'remove.txt'), { encoding: 'utf-8' })
fs.writeFileSync(path.join(__dirname, '..', 'remove.reg'), remove)
