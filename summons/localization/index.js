const yaml = require('js-yaml'),
      fs = require('fs'),

const log = summon('log')(module)
const config = yaml
    .safeLoad(
        fs.readFileSync('config.yml', 'utf8'))

const couchdb = new NodeCouchDb({
    auth: config.couchdb.auth
})