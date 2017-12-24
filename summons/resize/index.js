const sharp = require('sharp')

const Setting = model('setting')

module.exports = async (photo) => {
    const settings = await Setting.getAll(),
          buffer = Buffer.from(photo.split('base64,')[1], 'base64')
          meta = await sharp(buffer).metadata()

    if (meta.width <= settings.maxPhotoWidth)
        return photo

    const type = photo.split('base64,')[0] + 'base64,'

    const ratio = meta.height / meta.width,
          newHeight = settings.maxPhotoWidth * ratio

    const newPhoto = await sharp(buffer)
        .resize(settings.maxPhotoWidth, newHeight)
        .toBuffer()

    const base64 = await newPhoto.toString('base64')
    return type + base64
}