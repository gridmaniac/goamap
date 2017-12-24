'use strict'

require('./interop')

const log = summon('log')(module)

const couchdb = summon('couchdb')
      couchdb.init()

const auth = summon('auth')
      auth.apply()

const Koa = require('koa'),
      app = new Koa()

const session = require('koa-session'),
      bodyParser = require('koa-bodyparser'),
      json = require('koa-json'),
      serve = require('koa-static'),
      passport = require('koa-passport'),
      Pug = require('koa-pug'),
      state = require('koa-state'),
      flash = require('koa-connect-flash')

app.keys = ['asylum']
app.use(session(app))
   .use(bodyParser({ jsonLimit: '25mb', formLimit: '25mb', textLimit: '25mb' }))
   .use(json())
   .use(state())
   .use(flash())

app.use(passport.initialize())
   .use(passport.session())

app.use(serve(`${__dirname}/ui/production`))

app.use((ctx, next) => {
    ctx.setState('notify', ctx.flash('notify'))
    ctx.setState('notifyType', ctx.flash('notifyType'))
    return next()
})

const dir = require('require-dir'),
      routes = dir(`${__dirname}/routes`)

for (let i in routes) {
    routes[i].prefix(i != 'index' ? `/${i}` : '/')
    app.use(routes[i].routes())
}

new Pug({ viewPath: 'ui/views', noCache: true })
    .use(app)

app.listen(3011)