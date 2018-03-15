// 指令类
import Directives from './directives.js'
import Filters from './filters.js'

    // 匹配|前的字符
const KEY_RE = /^[^\|]+/,
    // 匹配以|开头 |后面的字符 
    FILTERS_RE = /\|[^\|]+/g

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
        this.filters = filters.map(function (fitler) {
            // 获取过滤器名
            const tokens = fitler.replace('|', '').trim().split(/\s+/)
            return {
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
        filtered = fitler.apply(filtered, fitler.args)
    })
    return filtered
}

// 解析模板
function parse (attr, prefix) {
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