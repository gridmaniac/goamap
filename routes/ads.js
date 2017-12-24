const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      paginate = require('koa-ctx-paginate'),
      moment = require('moment')

const Ad = model('ad'),
      AdCat = model('adcat')

router.use('/', summon('auth').isAdminAuthenticated)
router.use(paginate.middleware(15, 15))

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Объявления')

        const httpQuery = ctx.request.query
              l = ctx.query.limit,
              s = ctx.paginate.skip,
              ads = {},
              count = 0

        if (httpQuery.like && !httpQuery.adcat) {
            [ ads, count ] = [
                await Ad.getAllLike(httpQuery.like, l, s),
                await Ad.getCountLike(httpQuery.like)
            ]
        } else if (httpQuery.like && httpQuery.adcat){
            [ ads, count ] = [
                await Ad.getAllLike(httpQuery.like, l, s, httpQuery.adcat),
                await Ad.getCountLike(httpQuery.like, httpQuery.adcat)
            ]
        } else if (httpQuery.adcat) {
            ads = await Ad.getByAdCat(l, s, httpQuery.adcat)
            count = await Ad.getByAdCatCount(httpQuery.adcat)
        } else {
            ads = await Ad.getAll(l, s)
        }

        if (!count && count != 0) {
            count = await Ad.getCount()
        }

        const adcats = await AdCat.getAll(9999, 0),
              pageCount = Math.ceil(count / l)
        
        return ctx.render('ads', {
            ads,
            adcats,
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

        const ad = ctx.request.body
        const err = await Ad.update(id, ad)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        const adcat = await AdCat.findById(ad.adcat)
        Ad.addTag(id, adcat.title)

        ctx.flash('notify', 'Объявление успешно обновлено.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('back')
    } catch(e) {
        log.error(e)
    }
})

router.get('/new', async (ctx, next) => {
    try {
        const adcats = await AdCat.getAll(9999, 0)

        ctx.setState('pagetitle', 'Новое объявление')
        ctx.setState('adcats', adcats)
        ctx.setState('adcat', ctx.query.adcat)
        ctx.setState('pending', true)
    
        ctx.render('ad')
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        const { err, id } = await Ad.create(ctx.request.body),
              adcats = await AdCat.getAll(9999, 0)

        ctx.setState('pagetitle', 'Новое место')
        ctx.setState('pending', true)
        ctx.setState('adcats', adcats)

        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('ad', ctx.request.body)
        }
        
        ctx.flash('notify', 'Объявление успешно добавлено.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/ads/' + id)
    } catch(e) {
        log.error(e)
    }
})


router.get('/remove/:id', async (ctx, next) => {
    try {
        await Ad.remove(ctx.params.id)
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
                    await Ad.remove(id)
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
              adcat = await AdCat.findById(ctx.request.body.to)

        if (ids) {
            for (let id of ids) {
                if (id) {
                    await Ad.move(id, adcat._id)
                }
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const ad = await Ad.findById(ctx.params.id),
              adcats = await AdCat.getAll(9999, 0)
            
        ctx.setState('pagetitle', ad.title)
        ctx.setState('adcats', adcats)

        ctx.render('ad', ad)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router