const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module)

const Guide = model('guide'),
      Article = model('article'),
      Place = model('place')

router.use('/', summon('auth').isAdminAuthenticated)

router.get('/', async (ctx, next) => {
    ctx.setState('pagetitle', 'Путеводитель')
    ctx.render('guides')
})

router.get('/json', async (ctx, next) => {
    try {
        const guides = await Guide.getAll()
        ctx.body = guides
    } catch(e) {
        log.error(e)
    }
})

router.get('/new', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Новый раздел')
        ctx.setState('pending', true)
        ctx.render('guide')
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        const err = await Guide.create(ctx.request.body)

        ctx.setState('pagetitle', 'Новый раздел')
        ctx.setState('pending', true)
        
        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('guide', ctx.request.body)
        }

        ctx.flash('notify', 'Раздел успешно добавлен.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/guides/')
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const err = await Guide.update(id, ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Раздел успешно обновлен.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('/guides')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        await Guide.remove(ctx.params.id)
        ctx.redirect('/guides')
    } catch(e) {
        log.error(e)
    }
})

router.post('/reorder', async (ctx, next) => {
    try {
        const { data } = ctx.request.body
        for (let i in data) {
            if (data[i].parent_id)
                await Guide.reorder(data[i].id, i, data[i].parent_id)
            else
                await Guide.reorder(data[i].id, i)
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const guide = await Guide.findById(ctx.params.id)
        if (guide.guides == 'article') {
            const article = await Article.findById(guide.resource)
            if (article)
                guide.extra = article.title
        }

        if (guide.guides == 'place') {
            const place = await Place.findById(guide.resource)
            if (place)
                guide.extra = place.title
        }
        
        ctx.setState('pagetitle', guide.title)
        ctx.render('guide', guide)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router