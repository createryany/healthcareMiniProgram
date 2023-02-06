// pages/patientInfo/patient/patient.js
import request from '../../../utils/request'
const {
  $Toast
} = require('../../../dist/base/index')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    patient: {},
    visible: false,
    actions: [{
        name: '再想想'
      },
      {
        name: '确定',
        color: '#2d8cf0',
        loading: false
      }
    ],
    currentPatientIndex: -1,
  },
  // 加载数据
  getPatientInfo() {
    let patient = JSON.parse(wx.getStorageSync('patientList').trim())[this.data.currentPatientIndex]
    this.setData({
      patient,
    })
  },
  // 删除就诊人信息
  isDelete() {
    this.setData({
      visible: true
    })
  },
  deletePatient({
    detail
  }) {
    if (detail.index === 0) {
      this.setData({
        visible: false
      });
    } else {
      const action = [...this.data.actions];
      action[1].loading = true;

      this.setData({
        actions: action
      });

      setTimeout(async () => {
        let result = await request('/api/user/patient/auth/remove/' + this.data.patient.id, {}, 'DELETE')
        action[1].loading = false;
        this.setData({
          visible: false,
          actions: action
        });
        if (result.code == 200) {
          wx.navigateBack()
        } else {
          $Toast({
            content: result.message,
            type: 'error'
          });
        }
      }, 100);
    }
  },
  // 编辑就诊人信息
  editPatient() {
    wx.navigateTo({
      url: '/pages/patientInfo/fixPatient/fixPatient?currentPatientIndex=' + this.data.currentPatientIndex,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '就诊人详情'
    })
    let currentPatientIndex = options.currentPatientIndex
    this.setData({
      currentPatientIndex
    })
    this.getPatientInfo()
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
    this.getPatientInfo()
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