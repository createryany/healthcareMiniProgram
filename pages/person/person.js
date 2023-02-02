// pages/person/person.js
import request from '../../utils/request'
const {
  $Message
} = require('../../dist/base/index');
let startY = 0;
let moveY = 0;
let moveDistance = 0;
let currentTime = 60
let countDowmStop = true

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, // 用户信息
    userMessage: {}, // 用户实名信息
    phone: '', // 手机号
    code: '', // 验证码
    coverTransform: 'translateY(0)',
    coverTransition: '',
    flag: true, // 标记登录
    isLogin: false, // 标记是否登录
    visibleAuth: false,
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
    isAgree: true // 是否接受协议
  },
  // 是否接受协议
  agreeStatus() {
    this.setData({
      isAgree: !this.data.isAgree
    })
  },
  // 账号信息
  fixUserInfo() {
    wx.navigateTo({
      url: '/pages/person/fixUserInfo/fixUserInfo',
    })
  },
  // 更多
  more() {
    wx.navigateTo({
      url: '/pages/more/more',
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
      wx.showLoading({
        title: '正在登录...',
      })
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
    currentTime = 60
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
    this.codeTap()
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
    } else {
      this.setData({
        times: ''
      })
    }
  },
  // 登录
  async login() {
    let phone = this.data.phone
    let code = this.data.code
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
      code
    }, 'POST')
    setTimeout(async () => {
      if (result.code === 200) {
        let userMessageResult = await request('/api/user/auth/getUserInfo', {}, 'GET', result.data.token)
        if (userMessageResult.code === 200) {
          let userMessage = userMessageResult.data
          wx.setStorageSync('userMessage', JSON.stringify(userMessage))
          this.setData({
            userMessage
          })
          wx.setStorageSync('userInfo', JSON.stringify(result.data))
          // 更新用户信息
          this.setData({
            userInfo: result.data,
            flag: true,
            isLogin: true
          })
          wx.setNavigationBarTitle({
            title: '个人中心'
          })
          wx.hideLoading()
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '登录失败',
            icon: 'error'
          })
          countDowmStop = false
          this.setData({
            bindtapClick: 'sendCode',
            beforeBindtapClickBtnText: 'white',
            beforeBindtapClickBtn: '#839bfb',
            beforeBindtapClickBtnBorder: '',
            times: ''
          })
        }

      } else if (result.code === 210) {
        wx.hideLoading()
        wx.showToast({
          title: '验证码不正确',
          icon: 'error'
        })
      } else if (result.code === 23005) {
        wx.hideLoading()
        $Message({
          content: '账号已在其它地方登录',
          type: 'warning'
        })
      } else {
        wx.hideLoading()
        $Message({
          content: result.message,
          type: 'warning'
        })
      }
    }, 500)
  },
  // 绑定微信号
  handleBindWechat() {
    wx.navigateTo({
      url: '/pages/weixinBind/weixinBind',
    })
  },
  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录?',
      complete: async (res) => {
        if (res.confirm) {
          currentTime = 60
          countDowmStop = false
          this.setData({
            times: '',
            currentTime
          })
          let userInfo = JSON.parse(wx.getStorageSync('userInfo').trim())
          wx.setNavigationBarTitle({
            title: '登录'
          })
          wx.clearStorageSync()
          wx.reLaunch({
            url: '/pages/index/index',
          })
          await request('/api/user/logout', {}, 'POST', userInfo.token)
        }
      }
    })
  },
  // 显示认证信息
  handleAuthStatus() {
    this.setData({
      visibleAuth: !this.data.visibleAuth
    })
  },
  // 微信登录
  weixinLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请确认已同意《预约挂号服务协议》和《隐私协议》',
        icon: 'none'
      })
      return
    }
    wx.getUserProfile({
      desc: '是否授权healthcare平台微信登录',
      success: res => {
        wx.showLoading({
          title: '正在登录...',
        })
        let avatarUrl = res.userInfo.avatarUrl
        let userName = res.userInfo.nickName
        let wxInfo = {
          avatarUrl,
          userName
        }
        wx.login({
          success: async (res) => {
            let wxLoginResult = await request('/api/ucenter/wx/callback/' + res.code + '/' + Date.parse(new Date()), wxInfo, 'POST')
            let openid = wxLoginResult.data.openid
              if (wxLoginResult.data.phone) {
                setTimeout(async () => {
                  if (wxLoginResult.code === 200) {
                    if (wxLoginResult.data.token) {
                      let userMessageResult = await request('/api/user/auth/getUserInfo', {}, 'GET', wxLoginResult.data.token)
                      if (userMessageResult.code == 200) {
                        let userMessage = userMessageResult.data
                        wx.setStorageSync('userMessage', JSON.stringify(userMessage))
                        this.setData({
                          userMessage
                        })
                        wx.showToast({
                          title: '登录成功',
                          icon: 'success'
                        })
                        wx.setStorageSync('userInfo', JSON.stringify(wxLoginResult.data))
                        // 更新用户信息
                        this.setData({
                          userInfo: wxLoginResult.data,
                          flag: true,
                          isLogin: true
                        })
                        wx.hideLoading()
                        wx.setNavigationBarTitle({
                          title: '个人中心'
                        })
                      } else {
                        wx.showToast({
                          title: userMessageResult.message,
                          icon: 'error'
                        })
                      }
                    }
                  } else {
                    wx.showToast({
                      title: wxLoginResult.message,
                      icon: 'error'
                    })
                  }
                }, 500)
              } else {
                wx.reLaunch({
                  url: `/pages/weixinLogin/weixinLogin?openid=${openid}`,
                })
              }
          },
        })
      }
    })

  },
  // 未实名认证
  handleNoAuthStatus() {
    wx.navigateTo({
      url: '/pages/userAuthentication/userAuthentication'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},
  handleTouchStart(event) {
    this.setData({
      coverTransition: ''
    })
    // 获取初始手指坐标
    startY = event.touches[0].clientY;
  },
  handleTouchMove(event) {
    moveY = event.touches[0].clientY;
    moveDistance = moveY - startY;
    if (moveDistance < 0) return;
    if (moveDistance > 50) moveDistance = 50
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd() {
    this.setData({
      coverTransform: 'translateY(0)',
      coverTransition: '0.5s linear'
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
    // 从storage中拿用户信息
    let userInfo = wx.getStorageSync('userInfo')
    let userMessage = wx.getStorageSync('userMessage')
    if (userInfo && userMessage) {
      wx.setNavigationBarTitle({
        title: '个人中心'
      })
      // 更新用户信息
      this.setData({
        userInfo: JSON.parse(userInfo.trim()),
        userMessage: JSON.parse(userMessage),
        flag: true,
        isLogin: true
      })
    }
  },
  // 查看协议
  userAgree() {
    wx.navigateTo({
      url: '/pages/agreement/user/user',
    })
  },
  privacyAgree() {
    wx.navigateTo({
      url: '/pages/agreement/privacy/privacy',
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