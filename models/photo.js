const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'photo',
      db = 'goa-sync'

const schema = {
    name: Joi.string(),
    title: Joi.string().required(),
    album: Joi.string().required(),
    batch: Joi.string().allow('').default(''),
    geo: Joi.string().allow('').default(''),
    date: Joi.date(),
    content: Joi.string().required(),
    tag: Joi.string().allow('').default('')
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async (limit, skip) => {
    let opts = {
        limit, skip
    }

    const view = `_design/docs/_view/photoAll`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getCount = async () => {
    const view = '_design/docs/_view/photoCount',
          { data } = await couchdb.get(db, view)
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
}

this.getByBatch = async (batch) => {
    let opts = {
        key: batch
    }

    const view = `_design/docs/_view/photoByBatch`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByAlbum = async (limit, skip, album) => {
    let opts = {
        limit, skip, descending: true, key: album
    }

    const view = `_design/docs/_view/photoByAlbum`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByAlbumLean = async (album) => {
    let opts = {
        key: album
    }

    const view = `_design/docs/_view/photoByAlbumLean`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByAlbumCount = async (album) => {
    const view = '_design/docs/_view/photoByAlbumCount',
          { data } = await couchdb.get(db, view, { key: album })
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
}

this.getAllLike = async (like, limit, skip, album) => {
    let mangoQuery = {
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
                },
                {
                    name: {
                        $regex: like
                    }
                },
                {
                    name: {
                        $regex: like.toUpperCase()
                    }
                },
                {
                    name: {
                        $regex: like.charAt(0).toUpperCase() + like.slice(1)
                    }
                },
                {
                    tag: {
                        $regex: like
                    }
                },
                {
                    tag: {
                        $regex: like.toUpperCase()
                    }
                },
                {
                    tag: {
                        $regex: like.charAt(0).toUpperCase() + like.slice(1)
                    }
                }
            ],
            type: {
                $eq: name
            }
        },
        fields: [ '_id', 'title', 'date', 'content'],
        limit,
        skip
    }

    if (album) {
        mangoQuery.selector.album = album
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs
}

this.getCountLike = async (like, album) => {
    let mangoQuery = {
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
                },
                {
                    name: {
                        $regex: like
                    }
                },
                {
                    name: {
                        $regex: like.toUpperCase()
                    }
                },
                {
                    name: {
                        $regex: like.charAt(0).toUpperCase() + like.slice(1)
                    }
                },
                {
                    tag: {
                        $regex: like
                    }
                },
                {
                    tag: {
                        $regex: like.toUpperCase()
                    }
                },
                {
                    tag: {
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

    if (album) {
        mangoQuery.selector.album = album
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs.length
}

this.create = async (entity) => {
    const { error, value } = Joi.validate(entity, schema)
    
    if (error)
        return { err: error.message }

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
    value.tag = data.tag
    
    await couchdb.update(db, value)
}

this.addTag = async (id, tag) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    data.tag += tag
    await couchdb.update(db, data)
}

this.remove = async (id) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    await couchdb.del(db, data._id, data._rev)
}

this.move = async (id, album) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    data.album = album
    await couchdb.update(db, data)
}

module.exports = this