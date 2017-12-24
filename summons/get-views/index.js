const yaml = require('js-yaml'),
      fs = require('fs')

module.exports = (db) => {
    const file = fs.readFileSync(`summons/couchdb/${db}.yml`, 'utf8')
    return yaml.safeLoad(file)
}