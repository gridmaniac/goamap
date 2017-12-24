const passport = require('koa-passport'),
      User = model('user'),
      BasicStrategy = require('passport-http').BasicStrategy

this.apply = () => {
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        const user = await User.findById(id)
        done(null, user)
    })
    
    passport.use('login', new BasicStrategy({},
        (email, password, done) => {
            User.getByEmail(email).then(user => {
                if (!user) { return done(null, false) }
                if (user.password != password ){ return done(null, false) }
                return done(null, user)
            })
        }
    ))
}

this.isAdminAuthenticated = (ctx, next) => {
    if (ctx.isAuthenticated() && ctx.state.user.role == 1)
        return next()
    ctx.redirect('/login')
}