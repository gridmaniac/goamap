const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      paginate = require('koa-ctx-paginate'),
      moment = require('moment')

const Album = model('album'),
      Photo = model('photo'),
      Place = model('place')

router.use('/', summon('auth').isAdminAuthenticated)
router.use(paginate.middleware(15, 15))

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Альбомы')

        const httpQuery = ctx.request.query
              l = ctx.query.limit,
              s = ctx.paginate.skip,
              albums = {},
              count = 0

        if (httpQuery.like) {
            [ albums, count ] = [
                await Album.getAllLike(httpQuery.like, l, s),
                await Album.getCountLike(httpQuery.like)
            ]
        } else if (httpQuery.sort) {
            switch (httpQuery.sort) {
                case 'date':
                    albums = await Album.getAll(l, s, 'Date', false)
                    break
                case 'date-desc':
                    albums = await Album.getAll(l, s, 'Date', true)
                    break
            }
        } else {
            albums = await Album.getAll(l, s)
        }

        if (!count) {
            count = await Album.getCount()
        }

        const pageCount = Math.ceil(count / l)
        
        return ctx.render('albums', {
            albums,
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
        ctx.setState('pagetitle', 'Новый альбом')
        ctx.setState('pending', true)
        ctx.render('album')
    } catch(e) {
        log.error(e)
    }
})

router.post('/new', async (ctx, next) => {
    try {
        const { err } = await Album.create(ctx.request.body)

        ctx.setState('pagetitle', 'Новый альбом')
        ctx.setState('pending', true)

        if (err) {
            ctx.setState('notify', err)
            ctx.setState('notifyType', 'danger')
            return ctx.render('album', ctx.request.body)
        }

        ctx.flash('notify', 'Альбом успешно создан.')
        ctx.flash('notifyType', 'info')
        ctx.redirect('/albums')
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const err = await Album.update(id, ctx.request.body)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        ctx.flash('notify', 'Альбом успешно обновлен.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('/albums')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        const photos = await Photo.getByAlbumLean(ctx.params.id)
        for (let photo of photos) {
            const places = await Place.getWithPhoto(photo._id)
            for (let place of places) {
                let photos = place.photos.split(','),
                    ix = photos.indexOf(photo._id)
    
                let newPhotos = photos.filter(x => x && x != photo._id)
                place.photos = newPhotos.join(',')
                const placeId = place._id

                delete place._id
                delete place._rev
                await Place.update(placeId, place)
            }

            Photo.remove(photo._id)
        }

        await Album.remove(ctx.params.id)
        ctx.redirect('/albums')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            for (let id of ids) {
                const photos = await Photo.getByAlbumLean(id)
                for (let photo of photos) {
                    const places = await Place.getWithPhoto(photo._id)
                    for (let place of places) {
                        let photos = place.photos.split(','),
                            ix = photos.indexOf(photo._id)
            
                        let newPhotos = photos.filter(x => x != x && photo._id)
                        place.photos = newPhotos.join(',')
                        const placeId = place._id
                        
                        delete place._id
                        delete place._rev
                        await Place.update(placeId, place)
                    }
                    
                    Photo.remove(photo._id)
                }

                await Album.remove(id)
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const albums = await Album.getAllLike(ctx.params.query, 15, 0)
        ctx.body = albums
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const album = await Album.findById(ctx.params.id)
        
        ctx.setState('pagetitle', album.title)
        ctx.render('album', album)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router