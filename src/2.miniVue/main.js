// 过滤器
import Filters from './filters'
// 指令
import Directives from './directives'
// 指令前缀
const prefix = 'sd',
    // 通过指令选择元素 不能选择v-on-*的元素 先手动添加
    selector = Object.keys(Directives).map(dir => {
        if (dir === 'on') {
            return `[${prefix}-${dir}-click], [${prefix}-${dir}-mouseover]`
        }
        return `[${prefix}-${dir}]`
    }).join()

function Seed (opts) {
    const self = this,
        root = this.el = document.getElementById(opts.id),
        // 带有指令的元素
        els = root.querySelectorAll(selector)
        
    // 内部用数据
    const bindings = self._bindings = {}
    // 外部接口 defineProperty 改变时调用对应指令进行更新
    self.scope = {}

    // 遍历节点属性，将指令绑定到节点上
    const processNode = (el) => {
        cloneAttributes(el.attributes).forEach(attr => {
            const directive = parseDirective(attr)
            if (directive) {
                bindDirective(self, el, bindings, directive)
            }
        })
    }

    els.forEach(processNode)
    processNode(root)

    // 初始化
    for (let key in bindings) {
        self.scope[key] = opts.scope[key]
    }
}
// 将当当前绑定数据返回
Seed.prototype.dump = function () {
    let  data = {}
    for (let key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}
// 清除事件绑定
Seed.prototype.destory = function () {
    for (let key in this._bindings) {
        this._bindings[key].directives.forEach(directive => {
            if (directive.definition.unbind) {
                directive.definition.unbind(
                    directive.el,
                    directive.argument,
                    directive
                )
            }
        })
    }
    this.el.parentNode.removeChild(this.el)
}

// 复制元素的属性
function cloneAttributes (attributes) {
    console.log(attributes)
    return [].map.call(attributes, attr => {
        return {
            name: attr.name,
            value: attr.value
        }
    })
}

// 根据模板指令找到真实的指令
function parseDirective (attr) {
    // 没有指令
    if (attr.name.indexOf(prefix) === -1) {
        return 
    }

    // 指令名
    let noprefix = attr.name.slice(prefix.length + 1),
        // 指令参数位置
        argIndex = noprefix.indexOf('-'),
        // 真实指令名
        dirname = argIndex === -1
            ? noprefix
            : noprefix.slice(0, argIndex),
        // 真实指令
        def = Directives[dirname],
        // 指令参数
        arg = argIndex === -1
            ? null
            : noprefix.slice(argIndex + 1) 

    let exp = attr.value,
        // 管道符位置
        pipeInex = exp.indexOf('|'),
        // 指令值
        key = pipeInex === -1
            ? exp.trim()
            : exp.slice(0, pipeInex).trim(),
        // 过滤器(可以有多个)
        filters = pipeInex === -1
            ? null
            : exp.slice(pipeInex + 1).split('|').map((fitler) => {
                return fitler.trim()
            })
    
    return def 
        ? {
            attr,
            key,
            filters,
            definition: def,
            arguments: arg,
            // 对应的model改变时如何更新dom 如果为on-**的走update方法
            update: typeof def === 'function' 
                ? def
                : def.update
        }
        : null
}

// 将指令与dom元素绑定
function bindDirective (seed, el, bindings, directive) {
    // 移除dom上的自定义指令
    el.removeAttribute(directive.attr.name)
    let key = directive.key,
        binding = bindings[key]
    if (!binding) {
        bindings[key] = binding = {
            value: undefined,
            directives: []
        }
    }
    directive.el = el
    binding.directives.push(directive)
    // 如果为自定义方法与el绑定
    if (directive.bind) {
        directive.bind(el, binding.value)
    }
    if (!seed.scope.hasOwnProperty(key)) {
        bindAccessors(seed, key, binding)
    }
}

// 为scope添加get，set
function bindAccessors (seed, key, binding) {
    Object.defineProperty(seed.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.directives.forEach(directive => {
                if (value && directive.filters) {
                    // 有过滤器先过滤
                    value = applyFilters(value, directive)
                }
                directive.update(
                    directive.el,
                    value,
                    directive.argument,
                    directive,
                    seed
                )
            })
        }
    })
}

function applyFilters (value, directive) {
    if (directive.definition.customFilter) {
        return directive.definition.customFilter(value, directive.filters)
    } else {
        directive.filters.forEach(filter => {
            if (Filters[filter]) {
                value = Filters[filter](value)
            }
        })
    }
    return value
}

// export {
//     create: function (opts) {
//         return new Seed(opts)
//     },
//     filters: Filters,
//     directives: Directives
// }
function create (opts) {
    return new Seed(opts)
}

export {create, Filters, Directives}