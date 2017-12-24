const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      paginate = require('koa-ctx-paginate')
const User = model('user')

router.use('/', summon('auth').isAdminAuthenticated)
router.use(paginate.middleware(15, 15))

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Пользователи')

        const httpQuery = ctx.request.query
              l = ctx.query.limit,
              s = ctx.paginate.skip,
              users = {},
              count = 0

        if (httpQuery.like) {
            [ users, count ] = [
                await User.getAllLike(httpQuery.like, l, s),
                await User.getCountLike(httpQuery.like)
            ]
        } else if (httpQuery.sort) {
            switch (httpQuery.sort) {
                case 'date':
                    users = await User.getAll(l, s, 'Date', false)
                    break
                case 'date-desc':
                    users = await User.getAll(l, s, 'Date', true)
                    break
            }
        } else {
            users = await User.getAll(l, s)
        }

        if (!count) {
            count = await User.getCount()
        }

        const pageCount = Math.ceil(count / l)
        
        return ctx.render('users', {
            users,
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

        const err = await User.update(id, ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Пользователь успешно обновлен.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('/users')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        await User.remove(ctx.params.id)
        ctx.redirect('/albums')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            await User.remove(id)
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const users = await User.getAllLike(ctx.params.query, 15, 0)
        ctx.body = users
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const user = await User.findById(ctx.params.id)
        
        ctx.setState('pagetitle', user.name)
        ctx.render('user', user)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router