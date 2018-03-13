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
        update: function (el, handler, event, directive) {
            if (!directive.handlers) {
                directive.handlers = {}
            }
            let handlers = directive.handlers
            if (handlers[event]) {
                el.removeEventListener(event, handlers[event])
            }
            if (handler) {
                handler = handler.bind(el)
                el.addEventListener(event, handler)
                handlers[event] = handler
            }
        }
    }
}

export default directives
