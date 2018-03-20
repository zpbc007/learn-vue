// 指令对象
import Directive from './directive.js'
import config from './config.js'

const map = Array.prototype.map,
    each = Array.prototype.forEach

function Seed (el, data, options) {

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el = el
    // 内部用数据 
    this._bindings = {}
    // 外部接口 defineProperty 改变时调用对应指令进行更新
    this.scope = {}
    this._options = options || {}

    this._compileNode(el)

    // 初始化
    for (let key in this._bindings) {
        this.scope[key] = data[key]
    }
}
// 遍历节点属性 找到真实指令 与节点绑定
Seed.prototype._compileNode = function (node) {

    if (node.nodeType === 3) {
        // text节点
        this._compileTextNode(node)
    } else if (node.attributes && node.attributes.length) {
        // 复制一份attr防止绑定后再改变
        const attrs = map.call(node.attributes, attr => {
            return {
                name: attr.name,
                value: attr.value
            }
        })
        attrs.forEach(attr => {
            const directive = Directive.parse(attr)
            if (directive) {
                this._bind(node, directive)
            }
        })
    }

    // 如果不是sd-each生成的节点且有子节点，遍历子节点
    if (!node['sd-block'] && node.childNodes.length) {
        each.call(node.childNodes, child => {
            this._compileNode(child)
        })
    }
}

Seed.prototype._compileTextNode = function (node) {

}

// 将指令与节点绑定
Seed.prototype._bind = function (node, directive) {
    directive.seed = this
    directive.el = node
    // 移除dom上的自定义指令
    node.removeAttribute(directive.attr.name)
    
    let key = directive.key,
        epr = this._options.eachPrefixRE
    if (epr) {
        key = key.replace(epr, '')
    }

    let binding = this._bindings[key] || this._createBinding(key)
    
    binding.directives.push(directive)
    // 如果为自定义方法或each指令
    if (directive.bind) {
        directive.bind.call(directive, binding.value)
    }
}
Seed.prototype._createBinding = function (key) {
    const binding = {
        value: undefined,
        directives: []
    }
    this._bindings[key] = binding

    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            // 绑定值更新时执行所有绑定指令的更新方法
            binding.directives.forEach(directive => {
                directive.update(value)
            })
        }
    })

    return binding
}
// 将当前绑定数据返回
Seed.prototype.dump = function () {
    let  data = {}
    for (let key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}
// 清除事件绑定
Seed.prototype.destory = function () {
    function unbind (directive) {
        if (directive.unbind) {
            directive.unbind()
        }
    }
    for (let key in this._bindings) {
        this._bindings[key].directives.forEach(unbind)
        delete this._bindings[key]
    }
    this.el.parentNode.removeChild(this.el)
}

export default Seed