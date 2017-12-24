const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'album',
      db = 'goa-sync'

const schema = {
    title: Joi.string().required(),
    description: Joi.string().allow('').default(''),
    date: Joi.date()
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async (limit, skip, sort, desc) => {
    let opts = {
        limit, skip
    }, sortPart = ''

    if (sort) {
        sortPart = `Sort${sort}`
    }

    if (desc) {
        opts.descending = desc
    }

    const view = `_design/docs/_view/albumAll${sortPart}`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getCount = async () => {
    const view = '_design/docs/_view/albumCount',
          { data } = await couchdb.get(db, view)
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
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
        fields: [ '_id', 'title', 'description'],
        limit,
        skip
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs
}

this.getCountLike = async (like) => {
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
        fields: [ '_id' ]
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs.length
}

this.getByTitle = async (title) => {
    const view = '_design/docs/_view/albumByTitle',
          user = await couchdb.get(db, view, { key: title, limit: 1 })
    
    if (user.data.rows[0])
        return user.data.rows[0].value
    return null
}

this.create = async (entity) => {
    const { error, value } = Joi.validate(entity, schema)
    
    if (error)
        return { err: error.message }

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
        return 'Альбом с таким названием уже существует'

    value.date = Date.now()

    const ids = await couchdb.uniqid()
    value._id = ids[0]

    await couchdb.insert(db, value)
    return { id: value._id }
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
    value.date = data.date
    
    await couchdb.update(db, value)
}

this.remove = async (id) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    await couchdb.del(db, data._id, data._rev)
}

module.exports = this