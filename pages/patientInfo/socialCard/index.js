// pages/patientInfo/socialCard/index.js
import request from '../../../utils/request'
const {
  $Toast
} = require('../../../dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    patient: {},
    userToken: '',
    insureNum: '',
    visible: false,
    actions: [{
        name: '再想想',
        color: '#999'
      },
      {
        name: '确定',
        color: '#2d8cf0',
        loading: false
      }
    ],
    inputInfo: false,
  },
  handleInput(e) {
    this.setData({
      insureNum: e.detail.value
    })
    this.handleBlur()
  },
  handleBlur() {
    if (this.data.insureNum.length == 0) {
      this.setData({
        inputInfo: true
      })
    } else {
      this.setData({
        inputInfo: false
      })
    }
  },
  // 绑定社保卡号
  bindInsureNum() {
    if (this.data.insureNum.length == 0) {
      $Toast({
        content: '请输入12位社保卡号',
        type: 'none'
      });
      this.setData({
        inputInfo: true
      })
      return
    }
    if (this.data.insureNum.length != 12) {
      $Toast({
        content: '您填写的社保卡号格式不正确，请您重新填写',
        type: 'none'
      });
      return
    }
    this.setData({
      visible: true
    })
  },
  handlebindInsureNum({ detail }) {
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
        let patient = {}
        patient.id = this.data.patient.id
        patient.insureNum = this.data.insureNum
        patient.isInsure = 1
        let result = await request('/api/user/patient/auth/bindPatientInsure', patient, 'POST', this.data.userToken)
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let userToken = JSON.parse(wx.getStorageSync('userInfo').trim()).token
    let patient = JSON.parse(wx.getStorageSync('patientList').trim())[options.currentPatientIndex]
    this.setData({
      patient,
      userToken
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