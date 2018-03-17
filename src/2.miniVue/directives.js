import config from './config.js'
import watchArray from './watchArray.js'

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
        update: function (collection) {
            watchArray(collection, this.mutate.bind(this))
        },
        mutate: function (mutation) {
            console.log(mutation)
        }
    }
}

export default directives
