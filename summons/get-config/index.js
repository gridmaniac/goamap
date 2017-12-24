const yaml = require('js-yaml'),
      fs = require('fs')

module.exports = () => {
    const file = fs.readFileSync('config.yml', 'utf8')
    return yaml.safeLoad(file)
}