// pages/weixinBind/weixinBind.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMessage: {}
  },
  // 绑定微信号
  handleBindWechat() {
    wx.getUserProfile({
      desc: '是否授权healthcare平台微信登录',
      success: res => {
        wx.showLoading({
          title: '正在绑定',
        })
        let avatarUrl =  res.userInfo.avatarUrl
        let userName =  res.userInfo.nickName
        let userInfo = {avatarUrl, userName}
        wx.login({
          success: async (res) => {
            if (res.code) {
              //发起网络请求
              let token = JSON.parse(wx.getStorageSync('userInfo').trim()).token
              let result = await request('/api/ucenter/wx/bindWechat/' + res.code + '/123', userInfo, 'POST', token)
              if(result.code === 200) {
                let userMessage = result.data
                wx.removeStorageSync('userMessage')
                wx.setStorageSync('userMessage', userMessage)
                this.setData({
                  userMessage
                })
                wx.hideLoading()
                wx.showToast({
                  title: '绑定成功'
                })
              } else if (result.code === 2130) {
                wx.showToast({
                  title: '微信已被绑定',
                  icon: 'error'
                })
              } else {
                wx.showToast({
                  title: '服务异常',
                  icon: 'error'
                })
              }
            }
          }
        })
      }
    })
  },
  // 解除绑定微信号
  handleNoBindWechat() {
    wx.showModal({
      title: '提示',
      content: '是否要解除绑定',
      complete: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在解除绑定',
          })
          wx.login({
            success: async (res) => {
              if (res.code) {
                //发起网络请求
                let token = JSON.parse(wx.getStorageSync('userInfo').trim()).token
                let result = await request('/api/ucenter/wx/unBindWechat/' + res.code + '/unBindWechat', {}, 'POST', token)
                if(result.code === 200) {
                  let userMessage = result.data
                  wx.removeStorageSync('userMessage')
                  wx.setStorageSync('userMessage', userMessage)
                  this.setData({
                    userMessage
                  })
                  wx.hideLoading()
                  wx.showToast({
                    title: '已解除绑定'
                  })
                } else {
                  wx.showToast({
                    title: '服务异常',
                    icon: 'error'
                  })
                }
              }
            }
          })
        }
      }
    })
  },
  // 回到用户中心
  backPerson() {
    wx.reLaunch({
      url: '/pages/person/person',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '绑定微信'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 获取头像信息
    let userMessage = wx.getStorageSync('userMessage')
    if (userMessage) {
      this.setData({
        userMessage: JSON.parse(userMessage)
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})