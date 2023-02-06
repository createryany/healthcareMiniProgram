// pages/weixinLogin/weixinLogin.js
import request from '../../utils/request'
let currentTime = 60
let countDowmStop = true

Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyPath: '', // 标记路径跳转
    openid: '', // 绑定的微信
    phone: '', // 手机号
    code: '', // 验证码
    flag: true,
    bindtapClick: '',
    beforeBindtapClickBtn: '#f8f6fc', // 按钮背景颜色
    beforeBindtapClickBtnText: '#a6a6a6', // 按钮文字颜色
    beforeBindtapClickBtnBorder: '1rpx solid #999', // 按钮
    times: '', // 倒计时
    currentTime: currentTime,
    Length: 6, //输入框个数
    codeInputBorder: ['1rpx solid #999', '1rpx solid #1a86fb'], // 输入框边框
    isFocus: true, //聚焦 
    ispassword: false, //是否密文显示 true为密文， false为明文。 
    isAgree: false // 是否接受协议
  },
  // 是否接受协议
  agreeStatus() {
    this.setData({
      isAgree: !this.data.isAgree
    })
  },
  // 收集登录信息
  codeFocus(e) {
    let that = this;
    let inputValue = e.detail.value;
    that.setData({
      code: inputValue,
    })
    if (this.data.code.length === 6) {
      this.login()
    }
  },
  codeTap() {
    let that = this;
    that.setData({
      isFocus: true,
    })
  },
  handlePhoneInput(event) {
    this.setData({
      phone: event.detail.value,
      bindtapClick: '',
      beforeBindtapClickBtnText: '#a6a6a6',
      beforeBindtapClickBtn: '#f8f6fc',
      beforeBindtapClickBtnBorder: '1rpx solid #999'
    })
    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    if (phoneReg.test(this.data.phone)) {
      this.setData({
        bindtapClick: 'sendCode',
        beforeBindtapClickBtnText: 'white',
        beforeBindtapClickBtn: '#839bfb',
        beforeBindtapClickBtnBorder: ''
      })
    }
  },
  // 登录
  async login() {
    let phone = this.data.phone
    let code = this.data.code
    let openid = this.data.openid
    let codeReg = /^\d{6}$/
    if (!codeReg.test(code)) {
      wx.showToast({
        title: '验证码为6位数',
        icon: 'none'
      })
      return
    }
    let result = await request('/api/user/login', {
      phone,
      code,
      openid
    }, 'POST')
    if (result.code === 213) {
      wx.showToast({
        title: '手机号已使用',
        icon: 'error'
      })
      this.fixPhone()
      return
    }
    if (result.data.token) {
      let userMessageResult = await request('/api/user/auth/getUserInfo', {}, 'GET', result.data.token)
      let userMessage = userMessageResult.data
      wx.setStorageSync('userMessage', JSON.stringify(userMessage))
      this.setData({
        userMessage
      })
    }
    if (result.code === 200) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      wx.setStorageSync('userInfo', JSON.stringify(result.data))
      // 更新用户信息
      this.setData({
        userInfo: result.data,
        flag: true,
        isLogin: true
      })
      if (this.data.historyPath) {
        wx.reLaunch({
          url: this.data.historyPath,
        })
      } else {
        // 跳转到个人中心页面
        wx.reLaunch({
          url: '/pages/person/person',
        })
      }
    } else {
      wx.showToast({
        title: result.message,
        icon: 'error'
      })
    }
  },
  // 回到发送验证码界面
  fixPhone() {
    currentTime = 60
    countDowmStop = false
    this.setData({
      currentTime,
      flag: true,
      phone: '',
      code: '',
      bindtapClick: '',
      beforeBindtapClickBtn: '#f8f6fc',
      beforeBindtapClickBtnText: '#a6a6a6',
      beforeBindtapClickBtnBorder: '1rpx solid #999',
      times: ''
    })
  },
  // 发送验证码
  async sendCode() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请确认已同意《预约挂号服务协议》和《隐私协议》',
        icon: 'none'
      })
      return
    }
    countDowmStop = true
    this.countdown()
    this.setData({
      flag: false,
      bindtapClick: '',
      beforeBindtapClickBtn: '#f8f6fc',
      beforeBindtapClickBtnText: '#a6a6a6',
      times: '(' + currentTime + ')',
      beforeBindtapClickBtnBorder: '1rpx solid #999'
    })
    await request('/api/msm/sendCode/' + this.data.phone)
  },
  // 倒计时
  countdown() {
    this.setData({
      currentTime: currentTime--,
      times: '(' + currentTime + ')'
    })
    this.timer()
  },
  timer() {
    if (currentTime > 0 && countDowmStop) {
      setTimeout(this.countdown, 1000);
    } else if (countDowmStop) {
      currentTime = 60
      this.setData({
        times: '',
        bindtapClick: 'sendCode',
        beforeBindtapClickBtnText: 'white',
        beforeBindtapClickBtn: '#839bfb',
        beforeBindtapClickBtnBorder: ''
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '绑定手机号码'
    })
    let openid = options.openid
    let historyPath = ''
    if (options.historyPath) {
      historyPath = options.historyPath
    }
    this.setData({
      openid,
      historyPath
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