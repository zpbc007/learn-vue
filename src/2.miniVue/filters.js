// 各种过滤器
const filters = {
    // 首字母大写
    capitalize: function (value) {
        value = value.toString()
        return value.charAt(0).toUpperCase() + value.slice(1)
    },
    // 全大写
    uppercase: function (value) {
        return value.toUpperCase()
    }
}

export default filters