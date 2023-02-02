// pages/person/fixUserInfo/fixUserInfo.js
import request from '../../../utils/request'
let currentTime = 60
let countDowmStop = true

Page({

  /**
   * 页面的初始数据
   */
  data: {
    authStatus: '', // 用户实名认证标识
    token: '', // 用户唯一标识
    currentUserId: '', // 当前登录用户id
    currentPhone: '', // 当前手机号码
    isPhoneWarning: false, // 是否提示输入为空
    isCodeWarning: false, // 是否提示输入为空
    phone: '', // 新的手机号
    code: '', // 手机验证码
    isSendCode: false, // 是否已经发送验证码
    isCodeFocus: false,
    sendCodeText: '获取验证码',
    currentTime: currentTime, // 倒计时开始时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '账号信息'
    })
  },

  // 接收输入值
  phoneInput(e) {
    let phone = e.detail.value
    this.setData({
      phone,
      isPhoneWarning: false
    })
    if(phone.length == 0) {
      this.setData({
        isPhoneWarning: true
      })
    }
  },
  codeInput(e) {
    let code = e.detail.value
    this.setData({
      code,
      isCodeWarning: false
    })
    if(code.length == 0) {
      this.setData({
        isCodeWarning: true
      })
    }
  },

  // 判断是否为空
  isPhoneEmptyBlur() {
    if (this.data.phone.length === 0) {
      this.setData({
        isPhoneWarning: true
      })
      return false
    }
    return true
  },
  isCodeEmptyBlur() {
    if (this.data.code.length === 0) {
      this.setData({
        isCodeWarning: true
      })
      return false
    }
    return true
  },
  // 获取验证码
  async sendCode() {
    if (!this.isPhoneEmptyBlur()) {
      wx.showToast({
        title: '请输入新的手机号码',
        icon: 'none'
      })
      return
    }
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    if (!phoneReg.test(this.data.phone)) {
      wx.showToast({
        title: '您输入的手机号码格式有误',
        icon: 'none'
      })
      return
    }
    countDowmStop = true
    currentTime = 60
    this.countdown()
    this.setData({
      isSendCode: true,
      isCodeFocus: true
    })
    await request('/api/msm/sendCode/' + this.data.phone)
  },
  // 倒计时
  countdown() {
    this.setData({
      currentTime: --currentTime
    })
    this.timer()
  },
  timer() {
    if (currentTime > 0 && countDowmStop) {
      setTimeout(this.countdown, 1000);
    } else if (countDowmStop) {
      currentTime = 60
      this.setData({
        sendCodeText: '重新获取',
        isSendCode: false
      })
    }
  },
  // 确认修改
  async fixPhone() {
    let flag = 0
    if (!this.isPhoneEmptyBlur()) flag++
    if (!this.isCodeEmptyBlur()) flag++
    if (flag == 0) {
      wx.showLoading({
        title: '正在修改...',
      })
      let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
      if (!phoneReg.test(this.data.phone)) {
        wx.hideLoading()
        wx.showToast({
          title: '您输入的手机号码格式有误',
          icon: 'none'
        })
        return
      }
      if (!this.data.isSendCode) {
        wx.hideLoading()
        wx.showToast({
          title: '验证码错误，请重新获取',
          icon: 'none'
        })
        return
      }
      const id = this.data.currentUserId
      const phone = this.data.phone
      const code = this.data.code

      // 验证通过，去提交
      let result = await request('/api/user/auth/fixUserInfo', {
        id,
        phone,
        code
      }, 'POST', this.data.token)
      
      if (result.code == 200) {
        setTimeout(async () => {
          let userMessageResult = await request('/api/user/auth/getUserInfo', {}, 'GET', this.data.token)
          if (userMessageResult.code === 200) {
            let userMessage = userMessageResult.data
            // 更新storage的用户名
            let userInfo = {}
            userInfo.authStatus = this.data.authStatus
            userInfo.name = userMessage.nickName
            userInfo.token = this.data.token
            wx.setStorageSync('userInfo', JSON.stringify(userInfo))
            wx.setStorageSync('userMessage', JSON.stringify(userMessage))
            wx.hideLoading()
            countDowmStop = false
            this.setData({
              currentPhone: userMessage.phone,
              phone: '',
              code: ''
            })
            wx.showToast({
              title: '修改成功'
            })
          }
        }, 500)
      } else {
        wx.hideLoading()
        wx.showToast({
          title: result.message,
          icon: 'error'
        })
      }
    }
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
    let userMessage = JSON.parse(wx.getStorageSync('userMessage').trim())
    let userInfo = JSON.parse(wx.getStorageSync('userInfo').trim())
    this.setData({
      authStatus: userInfo.authStatus,
      token: userInfo.token,
      currentUserId: userMessage.id,
      currentPhone: userMessage.phone
    })
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