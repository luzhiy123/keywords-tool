let config = require('./../config.json');
let _ = require('lodash')


module.exports = function getDefaultPlats(generatorid) {
    return config.defaultplats.map((plat, index) => {
        
        let options 
        if (_.isArray(plat.options)) {
            options = _.chain(plat.options).uniq().compact().value()
        } else {
            options = {};
            for (key in plat.options) {
                options[key] = _.chain(plat.options[key]).uniq().compact().value()
            }
        }
        return {
            name: plat.name,
            index: index,
            options:  options,
            generatorid: generatorid
        }
    })
}