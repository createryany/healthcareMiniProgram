// pages/hospitalInfo/booking/booking.js
import request from '../../../utils/request.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    patientList: [],
    deptInfo: {},
    patientInfo: {},
    insureUsed: -1, // 0 自费就诊，1 医保就诊
    visibleTips: false,
    actionsTips: [{
      name: '确定',
      color: '#2d8cf0',
    }],
    orderActions: [{
        name: '再想想'
      },
      {
        name: '确定',
        color: '#2d8cf0',
      }
    ],
    orderSpinShow: false,
    visibleOrder: false,
  },
  // 选择就诊人
  handleChosePatient() {
    let patientList = []
    for (let index = 0; index < this.data.patientList.length; index++) {
      const element = this.data.patientList[index];
      let patient = element.name + '  ' + element.certificatesNo
      patientList.push(patient)
    }
    patientList.push('+ 添加就诊人')
    wx.showActionSheet({
      itemList: patientList,
      success: (res) => {
        if (res.tapIndex != this.data.patientList.length) {
          let patientInfo = this.data.patientList[res.tapIndex]
          this.setData({
            patientInfo
          })
          if (patientInfo.status == 0 && patientInfo.isInsure == 0) {
            this.setData({
              visibleTips: true
            })
            return
          }
          this.bindPatientInfo()
        } else {
          wx.navigateTo({
            url: '/pages/patientInfo/fixPatient/fixPatient',
          })
        }
      },
      cancel: () => {
        if (!this.data.patientInfo.id) {
          wx.showToast({
            title: '请选择就诊人或添加就诊人',
            icon: 'none'
          })
        }
      }
    })
  },
  // 去绑定
  handleBinding(e) {
    wx.reLaunch({
      url: '/pages/patientInfo/patientInfo',
    })
  },
  // 绑定就诊卡
  bindPatientInfo() {
    this.setData({
      insureUsed: -1
    })
    let patientInfo = this.data.patientInfo
    let patientInfoList = ['+ 绑定医保卡', '+ 绑定自费就诊']
    if (patientInfo.isInsure == 1) {
      patientInfoList[0] = patientInfo.name + ' 医保  ' + patientInfo.insureNum
    }
    if (patientInfo.status == 1) {
      patientInfoList[1] = patientInfo.name + ' 自费  ' + patientInfo.certificatesNo
    }
    // 选择就诊卡
    wx.showActionSheet({
      itemList: patientInfoList,
      success: (res) => {
        if (patientInfoList[res.tapIndex] == patientInfo.name + ' 自费  ' + patientInfo.certificatesNo) {
          this.setData({
            insureUsed: 0
          })
        }
        if (patientInfoList[res.tapIndex] == patientInfo.name + ' 医保  ' + patientInfo.insureNum) {
          this.setData({
            insureUsed: 1
          })
        }
        if (patientInfoList[res.tapIndex] == '+ 绑定医保卡' || patientInfoList[res.tapIndex] == '+ 绑定自费就诊') {
          wx.reLaunch({
            url: '/pages/patientInfo/patientInfo',
          })
        }
      },

      cancel: () => {
        wx.showToast({
          title: '请选择就诊卡，否则无法挂号',
          icon: 'none'
        })
      }
    })
  },
  // 挂号
  handleSubmit() {
    if (!this.data.patientInfo.id) {
      wx.showToast({
        title: '请选择就诊人或添加就诊人',
        icon: 'none'
      })
      return
    }
    if (this.data.insureUsed == -1) {
      wx.showToast({
        title: '请选择就诊卡，否则无法挂号',
        icon: 'none'
      })
      return
    }
    // 下单挂号
    this.setData({
      visibleOrder: true
    })
  },
  // 创建订单
  handleOrder({
    detail
  }) {
    const index = detail.index
    if (index === 1) {
      this.setData({
        orderSpinShow: true,
      })
      setTimeout(async () => {
        // 创建订单
        let result = await request('/api/order/orderInfo/auth/submitOrder/' + this.data.deptInfo.id + '/' + this.data.deptInfo.hosScheduleId + '/' + this.data.patientInfo.id + '/' + this.data.insureUsed + '', {}, 'POST')
        if (result.code == 200) {
          // 订单号
          let orderResult = await request('/api/order/orderInfo/auth/getOrders/' + result.data)
          if (orderResult.code == 200) {
            let orderList = []
            if (wx.getStorageSync('orderList')) {
              orderList = JSON.parse(wx.getStorageSync('orderList'))
            }
            orderList.push(orderResult.data)
            wx.setStorageSync('orderList', JSON.stringify(orderList))
            let currentOrderIndex = orderList.length - 1
            this.setData({
              orderSpinShow: false
            })
            wx.reLaunch({
              url: '/pages/patientInfo/order/order?currentOrderIndex=' + currentOrderIndex,
            })
          } else {
            this.setData({
              orderSpinShow: false
            })
            wx.showToast({
              title: result.message,
              icon: 'none'
            })
          }
        } else {
          this.setData({
            orderSpinShow: false
          })
          wx.showToast({
            title: result.message,
            icon: 'none'
          })
        }
      }, 100)
    }
    this.setData({
      visibleOrder: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.setNavigationBarTitle({title: '预约详情'})
    let patientList = []
    if (wx.getStorageSync('patientList').length != 0) {
      patientList = JSON.parse(wx.getStorageSync('patientList'))
    } else {
      let result = await request('/api/user/patient/auth/findAll', {})
      if (result.code == 200) {
        patientList = result.data
      } else {
        wx.showToast({
          title: result.message,
          icon: 'none'
        })
      }
    }
    let deptInfo = wx.getStorageSync('deptInfo')
    let workDateList = deptInfo.workDate.split('-')
    deptInfo.workDateFormat = workDateList[0] + '年' + workDateList[1] + '月' + workDateList[2] + '日'
    this.setData({
      deptInfo,
      patientList
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