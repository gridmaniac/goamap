const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'placetag',
      db = 'goa-sync'

const schema = {
    title: Joi.string().required(),
    singular: Joi.string().allow('').default(''),
    icon: Joi.string().allow('').required(),
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async () => {
    const view = `_design/docs/_view/placeTagAll`,
          { data } = await couchdb.get(db, view)
    return data.rows.map(x => x.value)
}

this.create = async (entity) => {
    const { error, value } = Joi.validate(entity, schema)
    
    if (error)
        return error.message

    const mangoQuery = {
        selector: {
            title: {
                $regex: value.title
            },
            type: {
                $eq: name
            }
        },
        fields: [ '_id' ]
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    if (data.docs.length > 0)
        return 'Категория мест с таким названием уже существует'

    const ids = await couchdb.uniqid()
    value._id = ids[0]

    await couchdb.insert(db, value)
}

this.getAllLike = async (like, limit, skip) => {
    const mangoQuery = {
        selector: {
            $or: [
                {
                    title: {
                        $regex: like
                    }
                },
                {
                    title: {
                        $regex: like.toUpperCase()
                    }
                },
                {
                    title: {
                        $regex: like.charAt(0).toUpperCase() + like.slice(1)
                    }
                }
            ],
            type: {
                $eq: name
            }
        },
        fields: [ '_id', 'title'],
        limit,
        skip
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs
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
    
    await couchdb.update(db, value)
}

this.remove = async (id) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    await couchdb.del(db, data._id, data._rev)
}

module.exports = this