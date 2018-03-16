const proto = Array.prototype,
    slice = proto.slice,
    // 重写的改变array的方法
    mutatorMethods = [
        'pop',
        'push',
        'reverse',
        'shift',
        'unshift',
        'splice',
        'sort'
    ]

export default function (arr, callback) {
    mutatorMethods.forEach(method => {
        // 重写array的各种突变函数
        arr[method] = function () {
            proto[method].apply(this, arguments)
            callback({
                event: method,
                args: slice.call(arguments),
                array: arr
            })
        }
    })
}