// pages/patientInfo/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {}, // 显示的订单
    patient: {}, // 订单的就诊人信息
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({title: '订单详情'})
    let orderList = JSON.parse(wx.getStorageSync('orderList').trim())
    let order = orderList[options.currentOrderIndex]
    this.setData({
      order
    })
    // 查询就诊人信息
    let patientId = order.patientId
    let patientList = JSON.parse(wx.getStorageSync('patientList').trim())
    for (let index = 0; index < patientList.length; index++) {
      const patient = patientList[index];
      if (patient.id == patientId) {
        this.setData({
          patient
        })
      }
    }
  },
  // 显示就诊人信息
  showPatient() {
    this.setData({
      isShow: !this.data.isShow
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