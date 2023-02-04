// pages/hospitalInfo/hospital/hospital.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hospital: {},
    visibleTips: false,
    actionsTips: [{
      name: '确定',
      color: '#2d8cf0',
    }],
    visibleIntro: false,
  },
  // 关闭平台提示
  handleCloseTips() {
    this.setData({
      visibleTips: false
    })
  },
  // 介绍弹窗
  closeVisibleIntro() {
    this.setData({
      visibleIntro: !this.data.visibleIntro
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let hospital = wx.getStorageSync('hospitalInfo')
    this.setData({
      hospital
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