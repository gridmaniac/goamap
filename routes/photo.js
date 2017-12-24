const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module)

const Photo = model('photo')

router.get('/:id', async (ctx, next) => {
    try {
        const photo = await Photo.findById(ctx.params.id),
              content = photo.content
        
        ctx.type = content.split('base64,')[0].replace('data:', '')
        ctx.body = Buffer.from(content.split('base64,')[1], 'base64')
    } catch(e) {
        log.error(e)
    }
})

module.exports = router