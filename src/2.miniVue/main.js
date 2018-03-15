// 指令方法（只用来匹配模板dom）
import Directives from './directives.js'
// 指令对象
import Directive from './directive.js'
// 指令前缀
const prefix = 'sd',
    // 通过指令选择元素 不能选择v-on-*的元素 先手动添加
    selector = Object.keys(Directives).map(dir => {
        return `[${prefix}-${dir}]`
    }).join()

function Seed (opts) {
    const root = this.el = document.getElementById(opts.id),
        // 带有指令的元素
        els = root.querySelectorAll(selector)
        
    // 内部用数据 
    this.bindings = {}
    // 外部接口 defineProperty 改变时调用对应指令进行更新
    this.scope = {}

    ;[].forEach.call(els, this.compileNode.bind(this))
    this.compileNode(root)

    // 初始化
    for (let key in this.bindings) {
        this.scope[key] = opts.scope[key]
    }
}
// 遍历节点属性 找到真实指令 与节点绑定
Seed.prototype.compileNode = function (node) {
    cloneAttributes(node.attributes).forEach((attr) => {
        const directive = Directive.parse(attr, prefix)
        if (directive) {
            this.bind(node, directive)
        }
    })
}
// 将指令与节点绑定
Seed.prototype.bind = function (node, directive) {
    directive.el = node
    // 移除dom上的自定义指令
    node.removeAttribute(directive.attr.name)
    
    let key = directive.key,
        binding = this.bindings[key] || this.createBinding(key)
    
        binding.directives.push(directive)
    // 如果为自定义方法与el绑定
    if (directive.bind) {
        directive.bind(node, binding.value)
    }
}
Seed.prototype.createBinding = function (key) {
    const binding = {
        value: undefined,
        directives: []
    }
    this.bindings[key] = binding

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
// 实例化方法
function create (opts) {
    return new Seed(opts)
}

export {create}