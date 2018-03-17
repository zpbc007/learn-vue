// 指令对象
import Directive from './directive.js'
import config from './config.js'

function Seed (el, data) {

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el = el
    // 内部用数据 
    this._bindings = {}
    // 外部接口 defineProperty 改变时调用对应指令进行更新
    this.scope = {}

    // 带有指令的元素
    let els = el.querySelectorAll(config.selector)
    ;[].forEach.call(els, this._compileNode.bind(this))
    this._compileNode(el)

    // 初始化
    for (let key in this._bindings) {
        this.scope[key] = data[key]
    }
}
// 遍历节点属性 找到真实指令 与节点绑定
Seed.prototype._compileNode = function (node) {
    cloneAttributes(node.attributes).forEach((attr) => {
        const directive = Directive.parse(attr)
        if (directive) {
            this._bind(node, directive)
        }
    })
}
// 将指令与节点绑定
Seed.prototype._bind = function (node, directive) {
    directive.el = node
    // 移除dom上的自定义指令
    node.removeAttribute(directive.attr.name)
    
    let key = directive.key,
        binding = this._bindings[key] || this._createBinding(key)
    
        binding.directives.push(directive)
    // 如果为自定义方法与el绑定
    if (directive.bind) {
        directive.bind(node, binding.value)
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
    }
    this.el.parentNode.removeChild(this.el)
}

// 复制元素的属性
function cloneAttributes (attributes) {
    return [].map.call(attributes, attr => {
        return {
            name: attr.name,
            value: attr.value
        }
    })
}

export default Seed