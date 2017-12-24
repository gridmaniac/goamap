const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'guide',
      db = 'goa-sync'

const schema = {
    title: Joi.string().required(),
    description: Joi.string().required(),
    icon: Joi.string().allow('').required(),
    parent: Joi.string().allow('').default(''),
    guides: Joi.string().allow('').default(''),
    resource: Joi.string().allow('').default(''),
    sort: Joi.number().default(9999)
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async () => {
    const view = '_design/docs/_view/guideAll',
          { data } = await couchdb.get(db, view)
    return data.rows.map(x => x.value)
}

this.create = async (entity) => {
    const { error, value } = Joi.validate(entity, schema)
    
    if (error)
        return error.message

    const ids = await couchdb.uniqid()
    value._id = ids[0]

    await couchdb.insert(db, value)
}

this.findById = async (id) => {
    const entity = await couchdb.get(db, id, { limit: 1 })
    return entity.data
}

this.update = async (id, entity) => {
    const { error, value } = Joi.validate(entity, schema)

    if (error)
        return error.message

    const { data } = await couchdb.get(db, id, { limit: 1 })
    value._id = data._id
    value._rev = data._rev
    value.parent = data.parent
    value.sort = data.sort
    
    await couchdb.update(db, value)
}

this.remove = async (id) => {
    const mangoQuery = {
        selector: {
            title: {
                parent: id
            },
            type: {
                $eq: name
            }
        },
        fields: [ '_id' ]
    }

    const children = await couchdb.mango(db, mangoQuery)
    for (let child of children.data.docs) {
        const { data } = await couchdb.get(db, child._id, { limit: 1 })
        data.parent = ''
        await couchdb.update(db, data)
    }

    const { data } = await couchdb.get(db, id, { limit: 1 })
    await couchdb.del(db, data._id, data._rev)
}

this.reorder = async (id, sort, parent) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    data.sort = +sort

    if (parent)
        data.parent = parent
    else
        data.parent = ''
    
    await couchdb.update(db, data)
}

module.exports = this