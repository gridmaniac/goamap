const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module)

const Photo = model('photo'),
      Album = model('album'),
      PlaceTag = model('placetag'),
      Place = model('place')

router.use('/', summon('auth').isAdminAuthenticated)

router.get('/:batch', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Пакетная обработка')
        
        const photos = await Photo.getByBatch(ctx.params.batch)
        for (let photo of photos) {
            const album = await Album.findById(photo.album)
            photo.album = album.title
        }
        
        return ctx.render('batch', {
            photos: photos.sort((a, b) => {
                if (a.get < b.geo) {
                    return -1
                }

                if (a.get > b.geo) {
                    return 1
                }

                return 0
            })
        })
    } catch(e) {
        log.error(e)
    }
})

module.exports = router