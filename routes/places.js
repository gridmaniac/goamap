const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      paginate = require('koa-ctx-paginate'),
      moment = require('moment')

const Place = model('place'),
      PlaceTag = model('placetag')

router.use('/', summon('auth').isAdminAuthenticated)
router.use(paginate.middleware(15, 15))

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Места')

        const httpQuery = ctx.request.query
              l = ctx.query.limit,
              s = ctx.paginate.skip,
              places = {},
              count = 0

        if (httpQuery.like && !httpQuery.placetag) {
            [ places, count ] = [
                await Place.getAllLike(httpQuery.like, l, s),
                await Place.getCountLike(httpQuery.like)
            ]
        } else if (httpQuery.like && httpQuery.placetag){
            [ places, count ] = [
                await Place.getAllLike(httpQuery.like, l, s, httpQuery.placetag),
                await Place.getCountLike(httpQuery.like, httpQuery.placetag)
            ]
        } else if (httpQuery.placetag) {
            places = await Place.getByPlaceTag(l, s, httpQuery.placetag)
            count = await Place.getByPlaceTagCount(httpQuery.placetag)
        } else {
            places = await Place.getAll(l, s)
        }

        if (!count && count != 0) {
            count = await Place.getCount()
        }

        const placetags = await PlaceTag.getAll(9999, 0),
              pageCount = Math.ceil(count / l)
        
        return ctx.render('places', {
            places,
            placetags,
            moment,
            query: ctx.request.query,
            pageCount,
            currentPage: ctx.query.page,
            pages: paginate.getArrayPages(ctx)(5, pageCount, ctx.query.page)
        })
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const place = ctx.request.body
        const err = await Place.update(id, place)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        const placetag = await PlaceTag.findById(place.placetag)
        Place.addTag(id, placetag.title)

        ctx.flash('notify', 'Место успешно обновлено.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('back')
    } catch(e) {
        log.error(e)
    }
})

router.get('/new', async (ctx, next) => {
    try {
        const placetags = await PlaceTag.getAll(9999, 0),
              settings = await model('setting').getAll()

        ctx.setState('pagetitle', 'Новое место')
        ctx.setState('placetags', placetags)
        ctx.setState('placetag', ctx.query.placetag)
        ctx.setState('pending', true)
    
        ctx.render('place', { 
            latitude: settings.centerLat,
            longitude: settings.centerLng,
            zoom: settings.centerZoom,
            icon: placetags.filter(x => x._id == ctx.query.placetag)[0].icon,
            photos: null
        })
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        const { err, id } = await Place.create(ctx.request.body),
              placetags = await PlaceTag.getAll(9999, 0),
              settings = await model('setting').getAll()

        ctx.setState('pagetitle', 'Новое место')
        ctx.setState('pending', true)
        ctx.setState('placetags', placetags)

        ctx.setState('zoom', settings.centerZoom)
        ctx.setState('icon', placetags.filter(x => x._id == ctx.request.body.placetag)[0].icon)

        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('place', ctx.request.body)
        }
        
        ctx.flash('notify', 'Место успешно добавлено.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/places/' + id)
    } catch(e) {
        log.error(e)
    }
})


router.get('/remove/:id', async (ctx, next) => {
    try {
        await Place.remove(ctx.params.id)
        ctx.redirect('back')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            for (let id of ids) {
                if (id)
                    await Place.remove(id)
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.post('/move', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data,
              placetag = await PlaceTag.findById(ctx.request.body.to)

        if (ids) {
            for (let id of ids) {
                if (id) {
                    await Place.move(id, placetag._id)
                    Place.addTag(id, placetag.title)
                }
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const places = await Place.getAllLike(ctx.params.query, 15, 0)
        ctx.body = places
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const place = await Place.findById(ctx.params.id),
              placetags = await PlaceTag.getAll(9999, 0),
              settings = await model('setting').getAll()
              
        ctx.setState('zoom', settings.centerZoom)
        ctx.setState('icon', placetags.filter(x => x._id == place.placetag)[0].icon)
        ctx.setState('pagetitle', place.title)
        ctx.setState('placetags', placetags)

        ctx.render('place', place)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router