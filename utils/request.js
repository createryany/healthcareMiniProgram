// 发送ajax请求
import config from "./config";

export default (url, data = {}, method = 'GET', token = '') => {
  if (wx.getStorageSync('userInfo')) {
    token = JSON.parse(wx.getStorageSync('userInfo')).token
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        token
      },
      success: (res) => {
        if (res.data.code == 23005) {
          wx.clearStorageSync()
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/person/person',
            })
          }, 100)
        } else {
          resolve(res.data)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}