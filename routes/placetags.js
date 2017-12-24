const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      moment = require('moment')

const PlaceTag = model('placetag'),
      Place = model('place')

router.use('/', summon('auth').isAdminAuthenticated)

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Категории мест')
        
        const placetags = await PlaceTag.getAll()
        return ctx.render('placetags', {
            placetags,
            moment
        })
    } catch(e) {
        log.error(e)
    }
})

router.get('/new', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Новая категория мест')
        ctx.setState('pending', true)
        ctx.render('placetag')
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        const err = await PlaceTag.create(ctx.request.body)

        ctx.setState('pagetitle', 'Новая категория мест')
        ctx.setState('pending', true)
        
        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('placetag', ctx.request.body)
        }

        ctx.flash('notify', 'Категория мест успешно добавлена.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/placetags')
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const err = await PlaceTag.update(id, ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Категория мест успешно обновлена.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('/placetags')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        const places = await Place.getByPlaceTagLean(ctx.params.id)
        for (let place of places) {
            Place.remove(place._id)
        }

        await PlaceTag.remove(ctx.params.id)
        ctx.redirect('/placetags')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            for (let id of ids) {
                const places = await Place.getByPlaceTagLean(id)
                for (let place of places) {
                    Place.remove(place._id)
                }

                await PlaceTag.remove(id)
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const placetags = await PlaceTag.getAllLike(ctx.params.query, 15, 0)
        ctx.body = placetags
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const placetag = await PlaceTag.findById(ctx.params.id)
        
        ctx.setState('pagetitle', placetag.title)
        ctx.render('placetag', placetag)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router