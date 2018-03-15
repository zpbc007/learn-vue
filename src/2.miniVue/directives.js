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
                handler = handler.bind(this.el)
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
            augmentArray(collection, this)
        },
        mutate: function (mutation) {
            console.log(mutation)
        }
    }
}

const push = [].push,
    slice = [].slice

function augmentArray (collection, directive) {
    collection.push = function (element) {
        push.call(this, arguments)
        directive.mutate({
            event: 'push',
            elements: slice.call(arguments),
            collection: collection
        })
    }
}

export default directives
