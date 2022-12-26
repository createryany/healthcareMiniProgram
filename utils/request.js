// 发送ajax请求
import config from "./config";

export default (url , data = {}, method = 'GET', token = '') => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.host + url,
            data,
            method,
            header: {
              token
            },
            success: (res) => {
                resolve(res.data)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
