import config from './config.js'
import Seed from './seed.js'
import directives from './directives.js'
import filters from './filters.js'

function buildSelector () {
    config.selector = Object.keys(directives).map(directive => {
        return `[${config.prefix}-${directive}]`
    }).join()
}

Seed.config = config
buildSelector()

Seed.extend = function (opts) {
    const Spore = function () {
        Seed.apply(this, arguments)
        for (let prop in this.extensions) {
            let ext = this.extensions[prop]
            this.scope[prop] = (typeof ext === 'function')
                ? ext.bind(this)
                : ext
        }
    }
    // 拷贝原型
    Spore.prototype = Object.create(Seed.prototype)
    Spore.prototype.extensions = {}
    for (let prop in opts) {
        Spore.prototype.extensions[prop] = opts[prop]
    }
    return Spore
}

Seed.directive = function (name, fn) {
    directives[name] = fn
    buildSelector()
}

Seed.filter = function (name, fn) {
    filters[name] = fn
}

export default Sedd