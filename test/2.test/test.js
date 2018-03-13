import * as vue from '../../src/2.miniVue/main'
var scope = {
    msg: '123',
    text: 'test',
    show: false
}
window.onload = function () {
    // 将实例暴露在window中
    window.app = vue.create({
        id: 'app',
        scope
    })
}