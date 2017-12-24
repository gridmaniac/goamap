const Router = require('koa-router'),
      router = new Router()

const log = summon('log')(module),
      paginate = require('koa-ctx-paginate'),
      moment = require('moment'),
      resize = summon('resize'),
      gps = summon('gps')

const Photo = model('photo'),
      Album = model('album'),
      PlaceTag = model('placetag'),
      Place = model('place')

router.use('/', summon('auth').isAdminAuthenticated)
router.use(paginate.middleware(15, 15))

router.get('/', async (ctx, next) => {
    try {
        ctx.setState('pagetitle', 'Фотографии')

        const httpQuery = ctx.request.query
              l = ctx.query.limit,
              s = ctx.paginate.skip,
              photos = {},
              count = 0

        if (httpQuery.like && !httpQuery.album) {
            [ photos, count ] = [
                await Photo.getAllLike(httpQuery.like, l, s),
                await Photo.getCountLike(httpQuery.like)
            ]
        } else if (httpQuery.like && httpQuery.album){
            [ photos, count ] = [
                await Photo.getAllLike(httpQuery.like, l, s, httpQuery.album),
                await Photo.getCountLike(httpQuery.like, httpQuery.album)
            ]
        } else if (httpQuery.album) {
            photos = await Photo.getByAlbum(l, s, httpQuery.album)
            count = await Photo.getByAlbumCount(httpQuery.album)
        } else {
            photos = await Photo.getAll(l, s)
        }

        if (!count && count != 0) {
            count = await Photo.getCount()
        }

        const albums = await Album.getAll(9999, 0),
              pageCount = Math.ceil(count / l)
        
        return ctx.render('photos', {
            photos,
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

router.post('/', async (ctx, next) => {
    try {
        let photo = ctx.request.body.data
        photo.title = photo.name
        photo.geo = await gps(photo.content)
        photo.content = await resize(photo.content)
        
        const { err, id } = await Photo.create(photo)

        if (err) {
            return ctx.body = { err }
        }

        const album = await Album.findById(photo.album)
        Photo.addTag(id, album.title)

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.post('/push', async (ctx, next) => {
    try {
        let payload = ctx.request.body.data,
            photo = {
                name: payload.name,
                title: payload.title
            }

        photo.content = await resize(payload.content)
        
        const placetag = await PlaceTag.findById(payload.placetag),
              album = await Album.getByTitle(placetag.title)

        if (album) {
            photo.album = album._id
        } else {
            const { id } = await Album.create({
                title: placetag.title,
                date: Date.now()
            })

            photo.album = id
        }

        photo.tag = placetag.title + payload.title

        const { err, id } = await Photo.create(photo)

        if (err) {
            return ctx.body = { err }
        }

        ctx.body = id
    } catch(e) {
        log.error(e)
    }
})

router.post('/update', async (ctx, next) => {
    try {
        const id = ctx.request.body.id
        delete ctx.request.body.id

        const photo = ctx.request.body
        photo.content = await resize(photo.content)

        const err = await Photo.update(id, photo)

        if (err) {
            ctx.flash('notify', err)
            ctx.flash('notifyType', 'danger')
            return ctx.redirect('back')
        }

        const album = await Album.findById(photo.album)
        Photo.addTag(id, album.title)

        ctx.flash('notify', 'Фотография успешно обновлена.')
        ctx.flash('notifyType', 'success')

        ctx.redirect('back')
    } catch(e) {
        log.error(e)
    }
})

router.get('/remove/:id', async (ctx, next) => {
    try {
        const id = ctx.params.id,
              places = await Place.getWithPhoto(id)

        for (let place of places) {
            let photos = place.photos.split(','),
                ix = photos.indexOf(id)

            let newPhotos = photos.filter(x => x && x != id)
            place.photos = newPhotos.join(',')
            const placeId = place._id

            delete place._id
            delete place._rev
            await Place.update(placeId, place)
        }

        await Photo.remove(id)
        ctx.redirect('back')
    } catch(e) {
        log.error(e)
    }
})

router.post('/remove', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data
        if (ids) {
            for (let id of ids) {
                if (id) {
                    const places = await Place.getWithPhoto(id)
                    for (let place of places) {
                        let photos = place.photos.split(','),
                            ix = photos.indexOf(id)
            
                        let newPhotos = photos.filter(x => x && x != id)
                        place.photos = newPhotos.join(',')
                        const placeId = place._id

                        delete place._id
                        delete place._rev
                        await Place.update(placeId, place)
                    }

                    await Photo.remove(id)
                }    
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.post('/move', async (ctx, next) => {
    try {
        const ids = ctx.request.body.data,
              album = await Album.findById(ctx.request.body.to)

        if (ids) {
            for (let id of ids) {
                if (id) {
                    await Photo.move(id, album._id)
                    Photo.addTag(id, album.title)
                }
            }
        }

        ctx.body = {}
    } catch(e) {
        log.error(e)
    }
})

router.get('/search/:query', async (ctx, next) => {
    try {
        const photos = await Photo.getAllLike(ctx.params.query, 15, 0)
        ctx.body = photos
    } catch(e) {
        log.error(e)
    }
})

router.get('/:id', async (ctx, next) => {
    try {
        const photo = await Photo.findById(ctx.params.id),
              albums = await Album.getAll(9999, 0)
        
        ctx.setState('pagetitle', photo.title)
        ctx.setState('albums', albums)

        ctx.render('photo', photo)
    } catch(e) {
        log.error(e)
    }
})

module.exports = router