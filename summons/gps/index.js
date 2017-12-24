const exif = require('exif-reader'),
      sharp = require('sharp')

module.exports = async (photo) => {
    const buffer = Buffer.from(photo.split('base64,')[1], 'base64'),
          meta = await sharp(buffer).metadata()

    if (!meta.exif)
        return ''
    
    const data = exif(meta.exif)
    if (!data.gps)
        return ''

    const gps = data.gps,
          geo = gps.GPSLatitudeRef + ':' +
                gps.GPSLatitude[0] + 'D' +
                gps.GPSLatitude[1] + 'M' +
                gps.GPSLatitude[2] + 'S|' +
                gps.GPSLongitudeRef + ':' +
                gps.GPSLongitude[0] + 'D' +
                gps.GPSLongitude[1] + 'M' +
                gps.GPSLongitude[2] + 'S'
    return geo
}