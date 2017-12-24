const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      paginate = require('koa-ctx-paginate'),
      moment = require('moment')

const Article = model('article')

router.use('/', summon('auth').isAdminAuthenticated)
router.use(paginate.middleware(15, 15))

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Статьи')

        const httpQuery = ctx.request.query
              l = ctx.query.limit,
              s = ctx.paginate.skip,
              articles = {},
              count = 0

        if (httpQuery.like) {
            [ articles, count ] = [
                await Article.getAllLike(httpQuery.like, l, s),
                await Article.getCountLike(httpQuery.like)
            ]
        } else if (httpQuery.sort) {
            switch (httpQuery.sort) {
                case 'date':
                    articles = await Article.getAll(l, s, 'Date', false)
                    break
                case 'date-desc':
                    articles = await Article.getAll(l, s, 'Date', true)
                    break
            }
        } else {
            articles = await Article.getAll(l, s)
        }

        if (!count) {
            count = await Article.getCount()
        }

        const pageCount = Math.ceil(count / l)
        
        return ctx.render('articles', {
            articles,
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

router.get('/new', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Новая статья')
        ctx.setState('pending', true)
        ctx.render('article')
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        delete ctx.request.body.files
        const err = await Article.create(ctx.request.body)

        ctx.setState('pagetitle', 'Новая статья')
        ctx.setState('pending', true)

        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('article', ctx.request.body)
        }

        ctx.flash('notify', 'Статья успешно добавлена.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/articles')
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        delete ctx.request.body.files
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const err = await Article.update(id, ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Статья успешно сохранена.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('/articles')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        await Article.remove(ctx.params.id)
        ctx.redirect('/articles')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            for (let id of ids) {
                await Article.remove(id)
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const articles = await Article.getAllLike(ctx.params.query, 15, 0)
        ctx.body = articles
    } catch(e) {
        log.error(e)
    }
})


router.get('/:id', async (ctx, next) => {
    try {
        const article = await Article.findById(ctx.params.id)
        
        ctx.setState('pagetitle', article.title)
        ctx.render('article', article)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router