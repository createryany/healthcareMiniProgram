// pages/userFeedback/userFeedback.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    token: '',
    feedbackContent: '',
    isFocus: true
  },
  // 收集数据
  handleFeedbackInput(e) {
    if (this.data.feedbackContent.length === 199) {
      wx.showToast({
        title: '反馈字数不能超过200',
        icon: 'none'
      })
    }
    this.setData({
      feedbackContent: e.detail.value
    })
  },
  // 提交
  async handleSubmit() {
    wx.showLoading({
      title: '正在提交...',
    })
    if(!this.data.feedbackContent) {
      wx.hideLoading()
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }
    let userFeedback = {
      feedbackContent: this.data.feedbackContent
    }
    let result = await request('/api/user/feedback', userFeedback, 'POST', this.data.token)
    wx.hideLoading()
    this.setData({
      feedbackContent: ''
    })
    if (result.code === 200) {
      wx.showToast({
        title: '感谢您的反馈',
      })
    } else {
      wx.showToast({
        title: '反馈失败',
        icon: 'error'
      })
    }
  },
  // 重置
  reset() {
    if (this.data.feedbackContent !== '') {
      wx.showModal({
        title: '提示',
        content: '是否清空反馈内容？',
        complete: (res) => {  
          if (res.confirm) {
            this.setData({
              feedbackContent: '',
              isFocus: true
            })
          }
        }
      })
    }
    return
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '意见反馈'
    })
    this.setData({
      token: JSON.parse(wx.getStorageSync('userInfo').trim()).token
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