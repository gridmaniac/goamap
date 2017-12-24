const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      moment = require('moment')

const AdCat = model('adcat'),
      Ad = model('ad')

router.use('/', summon('auth').isAdminAuthenticated)

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Категории объявлений')
        
        const adcats = await AdCat.getAll()
        return ctx.render('adcats', {
            adcats,
            moment
        })
    } catch(e) {
        log.error(e)
    }
})

router.get('/new', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Новая категория объявлений')
        ctx.setState('pending', true)
        ctx.render('adcat')
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        const err = await AdCat.create(ctx.request.body)

        ctx.setState('pagetitle', 'Новая категория объявлений')
        ctx.setState('pending', true)
        
        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('adcat', ctx.request.body)
        }

        ctx.flash('notify', 'Категория объявлений успешно добавлена.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/adcats')
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const err = await AdCat.update(id, ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Категория объявлений успешно обновлена.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('/adcats')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        const ads = await Ad.getByAdCatLean(ctx.params.id)
        for (let ad of ads) {
            Ad.remove(ad._id)
        }

        await AdCat.remove(ctx.params.id)
        ctx.redirect('/adcats')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            for (let id of ids) {
                const ads = await Ad.getByAdCatLean(id)
                for (let ad of ads) {
                    Ad.remove(ad._id)
                }

                await AdCat.remove(id)
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const adcats = await AdCat.getAllLike(ctx.params.query, 15, 0)
        ctx.body = adcats
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const adcat = await AdCat.findById(ctx.params.id)
        
        ctx.setState('pagetitle', adcat.title)
        ctx.render('adcat', adcat)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router