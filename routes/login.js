const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      passport = require('koa-passport')

router.get('/', passport.authenticate('login'), (ctx) => {
    ctx.redirect('/statistics')
})

module.exports = router