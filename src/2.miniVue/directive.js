// 指令类
import Directives from './directives.js'
import Filters from './filters.js'
import config from './config.js'

    // 匹配|前的字符
const KEY_RE = /^[^\|]+/,
    // 匹配以|开头的部分
    FILTERS_RE = /\|[^\|]+/g,
    // 匹配不带空白符和引号的部分或在引号内的部分
    FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g,
    QUOTE_RE = /'/g

// 指令对象
function Directive (def, attr, arg, key) {

    if (typeof def === 'function') {
        this._update = def
    } else {// v-on-***
        // 为指令添加属性
        for (let prop in def) {
            if (prop === 'update') {
                this._update = def.update
                continue
            }
            this[prop] = def[prop]
        }
    }

    this.attr = attr
    this.arg = arg
    this.key = key

    // 绑定过滤器
    const filters = attr.value.match(FILTERS_RE)
    if (filters) {
        this.filters = filters.map(function (filter) {
            // 获取过滤器名
            const tokens = filter.slice(1) // 去掉 |
                .match(FILTER_TOKEN_RE) // 匹配过滤器名与参数
                .map(token => token.replace(QUOTE_RE, '').trim()) // 去掉引号 

            return {
                name: tokens[0],
                apply: Filters[tokens[0]],
                args: tokens.length > 1 ? tokens.slice(1) : null
            }
        })
    }
}
// 指令更新值
Directive.prototype.update = function (value) {
    if (this.filters) {
        value = this.applyFilters(value)
    }
    this._update(value)
}
// 过滤
Directive.prototype.applyFilters = function (value) {
    let filtered = value
    this.filters.forEach((fitler) => {
        if (!fitler.apply) throw new Error(`Unknown filter: ${filter.name}`) 
        filtered = fitler.apply(filtered, fitler.args)
    })
    return filtered
}

// 解析模板
function parse (attr) {
    const prefix = config.prefix
    if (attr.name.indexOf(prefix) === -1) {
        return null
    }

    const noprefix = attr.name.slice(prefix.length + 1),
        argIndex = noprefix.indexOf('-'),
        arg = argIndex === -1
            ? null
            : noprefix.slice(argIndex + 1),
        name = arg
            ? noprefix.slice(0, argIndex)
            : noprefix,
        def = Directives[name],
        key = attr.value.match(KEY_RE)
    
    return def && key
        ? new Directive(def, attr, arg, key[0].trim())
        : null
}



export default {
    parse
}