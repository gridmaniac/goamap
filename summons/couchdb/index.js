
const log = summon('log')(module),
      NodeCouchDb = require('node-couchdb'),
      getConfig = summon('get-config')
      getViews = summon('get-views')

const config = getConfig()
const couchdb = new NodeCouchDb({
    auth: config.couchdb.auth
})

const createDbs = async (newDbs) => {
    try {
        const dbs = await couchdb.listDatabases()
        for (let db of newDbs) {
            if (dbs.indexOf(db) == -1)
                await couchdb.createDatabase(db)
        }
    } catch(e) {
        log.error(e)
    }
}

const createViews = async (dbs) => {
    try {
        const view = '_design/docs'
        for (let db of dbs) {
            await couchdb.insert(db, {
                _id: view,
                views: getViews(db)
            })
        }
    } catch(e) {
        log.error(e)
    }
}

const createAdmin = async () => {
    try {
        const view = '_design/docs/_view/userAdminCount',
              res = await couchdb.get('goa-demand', view)

        if (!res.data.rows[0]) {
            const ids = await couchdb.uniqid()
            await couchdb.insert('goa-demand', {
                _id: ids[0],
                type: 'user',
                email: config.admin.user,
                password: config.admin.pass,
                role: 1,
                name: config.admin.name,
                balance: 0
            })
        }
    } catch(e) {
        log.error(e)
    }
}

const createSettings = async () => {
    try {
        const view = '_design/docs/_view/settingCount',
              res = await couchdb.get('goa-sync', view)
        
        if (!res.data.rows[0]) {
            await model('setting').init()
        }
    } catch(e) {
        log.error(e)
    }
}

couchdb.init = async () => {
    await createDbs(['goa-demand', 'goa-sync'])
    await createViews(['goa-demand', 'goa-sync'])
    await createAdmin()
    await createSettings()
}

module.exports = couchdb