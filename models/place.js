const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'place',
      db = 'goa-sync'

const schema = {
    title: Joi.string().required(),
    placetag: Joi.string().required(),
    tags: Joi.string().allow('').default(''),
    description: Joi.string().allow('').default(''),
    latitude: Joi.number(),
    longitude: Joi.number(),
    photos: Joi.string().allow('').default(''),
    article: Joi.string().allow('').default(''),
    address: Joi.string().allow('').default(''),
    phone: Joi.string().allow('').default(''),
    website: Joi.string().allow('').default(''),
    workstart: Joi.string().allow('').default(''),
    workend: Joi.string().allow('').default(''),
    workoff: Joi.array().allow([]).default([]),
    date: Joi.date(),
    tag: Joi.string().allow('').default('')
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async (limit, skip) => {
    let opts = {
        limit, skip
    }

    const view = `_design/docs/_view/placeAll`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getCount = async () => {
    const view = '_design/docs/_view/placeCount',
          { data } = await couchdb.get(db, view)
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
}

this.getByPlaceTag = async (limit, skip, placetag) => {
    let opts = {
        limit, skip, descending: true, key: placetag
    }

    const view = `_design/docs/_view/placeByPlaceTag`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByPlaceTagLean = async (placetag) => {
    let opts = {
        key: placetag
    }

    const view = `_design/docs/_view/placeByPlaceTagLean`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByPlaceTagCount = async (placetag) => {
    const view = '_design/docs/_view/placeByPlaceTagCount',
          { data } = await couchdb.get(db, view, { key: placetag })
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
}

this.getAllLike = async (like, limit, skip, placetag) => {
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
        fields: [ '_id', 'title', 'date', 'address', 'phone', 'placetag'],
        limit,
        skip
    }

    if (placetag) {
        mangoQuery.selector.placetag = placetag
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs
}

this.getCountLike = async (like, placetag) => {
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
                },
                {
                    tags: {
                        $regex: like
                    }
                },
                {
                    tags: {
                        $regex: like.toUpperCase()
                    }
                },
                {
                    tags: {
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

    if (placetag) {
        mangoQuery.selector.placetag = placetag
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs.length
}

this.getWithPhoto = async (photo) => {
    let mangoQuery = {
        selector: {
            photos: {
                $regex: photo
            },
            type: {
                $eq: name
            }
        }
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs
}

this.create = async (entity, lat, lng) => {
    const { error, value } = Joi.validate(entity, schema)
    
    if (error)
        return { err: error.message }

    value.date = Date.now()

    const ids = await couchdb.uniqid()
    value._id = ids[0]

    if (lat) value.latitude = lat
    if (lng) value.longitude = lng

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

this.move = async (id, placetag) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    data.placetag = placetag
    await couchdb.update(db, data)
}

module.exports = this