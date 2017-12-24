const Router = require('koa-router'),
      router = new Router()

router.use('/', summon('auth').isAdminAuthenticated)

router.get('/', async (ctx, next) => {
    ctx.setState('pagetitle', 'Статистика')
    ctx.render('statistics')
})

module.exports = router