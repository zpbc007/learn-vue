import config from './config.js'
import Seed from './seed.js'
import directives from './directives.js'
import filters from './filters.js'

var seeds = {}

function buildSelector () {
    config.selector = Object.keys(module.exports).forEach(function (directive) {

    })
}

export default {
    seeds: seeds,
    sedd: function (id, opts) {
        seeds[id] = opts
    },
    directive: function (name, fn) {
        directives[name] = fn
    },
    filter: function (name, fn) {
        filters[name] = fn
    },
    config: function (opts) {
        for (let prop in opts) {
            if (prop !== 'selector') {
                config[prop] = opts[prop]
            }
        }
    },
    plant: function () {
        for (let id in seeds) {
            seeds[id] = new Seed(id, seeds[id])
        }
    }
}