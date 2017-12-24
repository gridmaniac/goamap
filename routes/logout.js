const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      passport = require('koa-passport')

router.use('/', summon('auth').isAdminAuthenticated)

router.get('/', async (ctx, next) => {
    ctx.logout()
    ctx.status = 401
    ctx.body = '<script>window.location="/"</script>'
})

module.exports = router