const Joi = require('joi'),
      couchdb = summon('couchdb'),
      log = summon('log')(module)

const name = 'setting',
      db = 'goa-sync'
      
const schema = {
    centerLat: Joi.number().default(15.49),
    centerLng: Joi.number().default(73.82),
    centerZoom: Joi.number().default(17),
    
    maxPhotoWidth: Joi.number().default(480),

    adPer1: Joi.number().default(0.75),
    adPer7: Joi.number().default(4.19),
    adPer14: Joi.number().default(6.29),
    adPer30: Joi.number().default(8.99),
    adRise: Joi.number().default(0.30)
}

schema.type = Joi.string().equal(name).default(name)

this.getAll = async () => {
    const view = `_design/docs/_view/settingAll`,
          { data } = await couchdb.get(db, view)
    return data.rows[0].value
}

this.update = async (entity) => {
    const { error, value } = Joi.validate(entity, schema)

    if (error)
        return error.message

    const view = `_design/docs/_view/settingAll`,
        { data } = await couchdb.get(db, view)

    const settings = await couchdb.get(db, data.rows[0].value._id, { limit: 1 })
    value._id = settings.data._id
    value._rev = settings.data._rev
    
    await couchdb.update(db, value)
}

this.init = async () => {
    const ids = await couchdb.uniqid(),
          { error, value } = Joi.validate({}, schema)

    await couchdb.insert(db, value)
}


module.exports = this