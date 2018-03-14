// 各种指令
const directives = {
    // 绑定显示文字
    text: function (el, value) {
        el.textContent = value || '' 
    },
    show: function (el, value) {
        el.style.display = value ? '' : 'none'
    },
    class: function (el, value, classname) {
        el.classList[value ? 'add' : 'remove'](classname)
    },
    on: {
        // 初始化调用
        update: function (el, handler, event, directive) {
            if (!directive.handlers) {
                directive.handlers = {}
            }
            let handlers = directive.handlers
            // 如果有重复的事件先移除再绑定
            if (handlers[event]) {
                el.removeEventListener(event, handlers[event])
            }
            if (handler) {
                handler = handler.bind(el)
                el.addEventListener(event, handler)
                handlers[event] = handler
            }
        },
        // 移除事件绑定 destory调用
        unbind: function (el, event, directive) {
            if (directive.handlers) {
                el.removeEventListener(event, directive.handlers[event])
            }
        },
        // 内部满足条件的dom会触发（没太懂）
        customFilter: function (handler, selectors) {
            return function (e) {
                let match = selectors.every(selector => {
                    return e.target.webkitMatchesSelector(selector)
                })
                if (match) handler.apply(this, arguments)
            }
        }
    }
}

export default directives
