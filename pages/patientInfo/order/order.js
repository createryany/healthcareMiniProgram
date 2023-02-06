// pages/patientInfo/order/order.js
import request from '../../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {}, // 显示的订单
    patient: {}, // 订单的就诊人信息
    isShow: false,
    visible: false,
    currentOrderIndex: -1,
    actions: [{
      name: '确定',
      color: '#2d8cf0',
    }],
    actionsCancle: [{
        name: '再想想'
      },
      {
        name: '确定',
        color: '#2d8cf0',
      }
    ],
    visiblePay: false,
    spinShow: false,
    timer: null,
    qrCode: '',
    visibleCancle: false,
  },
  // 关闭支付提示
  closeTips() {
    this.setData({
      visible: false
    })
  },
  // 支付宝支付
  async alipayFacePay() {
    clearInterval(this.data.timer)
    this.setData({
      spinShow: true,
      timer: null
    })
    let result = await request('/api/order/alipay/getPayERCode/' + this.data.order.id)
    if (result.data != '') {
      this.setData({
        qrCode: result.data,
        spinShow: false,
      })
      this.alipayVisible()
      this.data.timer = setInterval(() => {
        this.getOrderStatus()
      }, 3000)
    } else {
      wx.showToast({
        title: '获取支付二维码错误，请稍后重试！',
        icon: 'none'
      })
    }
  },
  alipayVisible() {
    this.setData({
      visiblePay: true
    })
  },
  closePay() {
    this.setData({
      visiblePay: false
    })
  },
  // 查看订单状态
  async getOrderStatus() {
    let result = await request('/api/order/alipay/queryPayStatus/' + this.data.order.id)
    if (result.message != '支付中') {
      this.setData({
        qrCode: ''
      })
      this.closePay()
      clearInterval(this.data.timer)
      // 更新订单数据
      this.updateOrder()
    }
  },
  // 更新订单数据
  async updateOrder() {
    let orderResult = await request('/api/order/orderInfo/auth/getOrders/' + this.data.order.id)
    if (orderResult.code == 200) {
      let order = orderResult.data
      let orderList = JSON.parse(wx.getStorageSync('orderList'))
      orderList[this.data.currentOrderIndex] = order
      wx.setStorageSync('orderList', JSON.stringify(orderList))
      this.setData({
        order,
        timer: null
      })
    } else {
      wx.showToast({
        title: orderResult.message,
        icon: 'none'
      })
    }
  },
  // 取消预约
  async cancelOrderVisible({
    detail
  }) {
    const index = detail.index
    if (index == 1) {
      this.setData({
        spinShow: true,
        visibleCancle: false
      })
      let result = await request('/api/order/orderInfo/auth/cancelOrder/' + this.data.order.id, {}, 'POST')
      if (result.data) {
        this.updateOrder()
        this.setData({
          spinShow: false
        })
      } else {
        wx.showToast({
          title: '取消失败，请稍后重试！',
          icon: 'none'
        })
      }
    }
    this.setData({
      visibleCancle: false
    })
  },
  cancelOrder() {
    this.setData({
      visibleCancle: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
    let orderList = JSON.parse(wx.getStorageSync('orderList').trim())
    let order = orderList[options.currentOrderIndex]
    this.setData({
      order,
      currentOrderIndex: options.currentOrderIndex
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
    // 支付提醒
    if (order.param.orderStatusString == '预约成功，待支付') {
      this.setData({
        visible: true
      })
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
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(this.data.timer)
    this.setData({
      order: {}, // 显示的订单
      patient: {}, // 订单的就诊人信息
      isShow: false,
    })
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