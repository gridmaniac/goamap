const winston = require('winston')

module.exports = (module) => {
    const tsFormat = () => (new Date()).toLocaleTimeString(),
          path = module.filename.split('\\').slice(-2).join('\\')
          
    return new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                    filename: 'log/crashes.log',
                    level: 'error',
                    json: false,
                    timestamp: tsFormat,
                    label: path
                })
        ]
    })
}
