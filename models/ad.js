const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'ad',
      db = 'goa-demand'

const schema = {
    title: Joi.string().required(),
    adcat: Joi.string().required(),
    description: Joi.string().allow('').default(''),
    photos: Joi.string().allow('').default(''),
    address: Joi.string().allow('').default(''),
    phone: Joi.string().allow('').default(''),
    user: Joi.string().required(),
    price: Joi.number().required(),
    expireon: Joi.date(),
    date: Joi.date(),
    active: Joi.boolean().default(true)
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async (limit, skip) => {
    let opts = {
        limit, skip
    }

    const view = `_design/docs/_view/adAll`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getCount = async () => {
    const view = '_design/docs/_view/adCount',
          { data } = await couchdb.get(db, view)
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
}

this.getByAdCat = async (limit, skip, adcat) => {
    let opts = {
        limit, skip, descending: true, key: adcat
    }

    const view = `_design/docs/_view/adByAdCat`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByAdCatLean = async (adcat) => {
    let opts = {
        key: adcat
    }

    const view = `_design/docs/_view/adByAdCatLean`,
          { data } = await couchdb.get(db, view, opts)
    return data.rows.map(x => x.value)
}

this.getByAdCatCount = async (adcat) => {
    const view = '_design/docs/_view/adByAdCatCount',
          { data } = await couchdb.get(db, view, { key: adcat })
    if (!data.rows[0])
        return 0
    else
        return data.rows[0].value
}

this.getAllLike = async (like, limit, skip, adcat) => {
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
                }
            ],
            type: {
                $eq: name
            }
        },
        fields: [ '_id', 'title', 'date', 'expireon', 'user', 'active', 'adcat'],
        limit,
        skip
    }

    if (adcat) {
        mangoQuery.selector.adcat = adcat
    }

    const { data } = await couchdb.mango(db, mangoQuery)
    return data.docs
}

this.getCountLike = async (like, adcat) => {
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
                }
            ],
            type: {
                $eq: name
            }
        },
        fields: [ '_id' ]
    }

    if (adcat) {
        mangoQuery.selector.adcat = adcat
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
    
    await couchdb.update(db, value)
}

this.remove = async (id) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    await couchdb.del(db, data._id, data._rev)
}

this.move = async (id, adcat) => {
    const { data } = await couchdb.get(db, id, { limit: 1 })
    data.adcat = adcat
    await couchdb.update(db, data)
}

module.exports = this