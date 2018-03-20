import config from './config.js'
import watchArray from './watchArray.js'
import Seed from './seed.js' 

// 各种指令
const directives = {
    // 绑定显示文字
    text: function (value) {
        this.el.textContent = value || '' 
    },
    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },
    class: function (value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg)
    },
    on: {
        // 初始化调用
        update: function (handler) {
            const event = this.arg
            if (!this.handlers) {
                this.handlers = {}
            }
            let handlers = this.handlers
            // 如果有重复的事件先移除再绑定
            if (handlers[event]) {
                this.el.removeEventListener(event, handlers[event])
            }
            if (handler) {
                handler = handler.bind(this.seed)
                this.el.addEventListener(event, handler)
                handlers[event] = handler
            }
        },
        // 移除事件绑定 destory调用
        unbind: function () {
            const event = this.arg
            if (this.handlers) {
                this.el.removeEventListener(event, this.handlers[event])
            }
        }
    },
    each: {
        bind: function () {
            this.el['sd-block'] = true
            this.prefixRE = new RegExp(`^${this.arg}.`)
            let ctn = this.container = this.el.parentNode
            // 创建注释节点
            this.marker = document.createComment(`sd-each-${this.arg}-marker`)
            ctn.insertBefore(this.marker, this.el)
            ctn.removeChild(this.el)
            this.childSeeds = []
        },
        update: function (collection) {
            if (this.childSeeds.length) {
                this.childSeeds.forEach(child => {
                    child.destory()
                }) 
                this.childSeeds = []
            }
            watchArray(collection, this.mutate.bind(this))
            collection.forEach((item, i) => {
                this.childSeeds.push(this.buildItem(item, i, collection))
            })
        },
        mutate: function (mutation) {
            console.log(mutation)
        },
        buildItem: function (data, index, collection) {
            let node = this.el.cloneNode(true),
                spore = new Seed(node, data, {
                    eachPrefixRE: this.prefixRE,
                    parentScope: this.seed.scope
                })
            this.container.insertBefore(node, this.marker)
            collection[index] = spore.scope
            return spore
        }
    }
}

export default directives
