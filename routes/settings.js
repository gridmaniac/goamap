const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module)

const Setting = model('setting')

router.get('/', async (ctx, next) => {
    try {
        const settings = await Setting.getAll()

        ctx.setState('pagetitle', 'Настройки')
        ctx.render('settings', settings)
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const err = await Setting.update(ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Настройки успешно обновлены.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('back')
    } catch(e) {
        log.error(e)
    }
})

module.exports = router