// pages/patientInfo/patientInfo.js
import request from '../../utils/request'
const {
  $Toast
} = require('../../dist/base/index')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    visibleBindPatient: false, // 绑定就诊信息提示
    visibleBindText: '', // 绑定就诊信息提示文本
    actionsBindPatient: [{
        name: '再想想'
      },
      {
        name: '确定',
        color: '#2d8cf0',
      }
    ],
    handleSelection: '', // 绑定事件名
    spinShow: true, // 是否在加载数据
    isOrder: true, // 选项卡
    noLogin: true, // 判断是否登录
    userId: '', // 用户id
    userToken: '', // 用户登录唯一标识
    page: 1, // 当前页
    limit: 5, // 每页记录数
    total: 0, // 总记录数
    pages: 0, // 总页数
    orderList: [], // 订单列表
    patientList: [], // 就诊人列表
    currentOrderIndex: -1, // 选择的订单索引值
    currentPatientIndex: -1, // 选择的就诊人索引值
    currentPatientName: '全部',
  },
  // 查看用户是否登录
  isLogin() {
    // 查看用户数据
    const userMessage = wx.getStorageSync('userMessage').trim()
    const userInfo = wx.getStorageSync('userInfo')
    if (userMessage || userInfo) {
      this.setData({
        noLogin: false,
        userId: JSON.parse(userMessage).id,
        userToken: JSON.parse(userInfo).token
      })
    } else {
      this.setData({
        noLogin: true,
        spinShow: false
      })
    }
  },
  // 切换选项卡
  order() {
    wx.setNavigationBarTitle({
      title: '挂号订单'
    })
    this.setData({
      spinShow: true,
      isOrder: true,
    })
    this.isLogin()
    setTimeout(() => {
      this.setData({
        spinShow: false
      })
    }, 500)
  },
  visitor() {
    wx.setNavigationBarTitle({
      title: '就诊人'
    })
    this.setData({
      spinShow: true,
      isOrder: false,
    })
    this.isLogin()
    setTimeout(() => {
      this.setData({
        spinShow: false
      })
    }, 500)
  },
  // 获取挂号订单
  async getOrderList(patientId) {
    this.setData({
      spinShow: true
    })
    let searchObj = {}
    if (patientId) searchObj.patientId = patientId
    let result = await request('/api/order/orderInfo/auth/' + this.data.page + '/' + this.data.limit, searchObj, 'GET', this.data.userToken)
    if (result.code == 200) {
      let orderList = result.data.records
      wx.setStorageSync('orderList', JSON.stringify(orderList))
      this.setData({
        orderList,
        total: result.data.total,
        pages: result.data.pages
      })
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      })
    }
    setTimeout(() => {
      this.setData({
        spinShow: false
      })
    }, 500)
  },
  // 获取就诊人信息
  async getPatientList() {
    this.setData({
      spinShow: true
    })
    let result = await request('/api/user/patient/auth/findAll', {}, 'GET', this.data.userToken)
    if (result.code == 200) {
      let patientList = result.data
      wx.setStorageSync('patientList', JSON.stringify(patientList))
      this.setData({
        patientList
      })
    } else {
      wx.showToast({
        title: result.message,
        icon: 'none'
      })
    }
    setTimeout(() => {
      this.setData({
        spinShow: false
      })
    }, 500)
  },
  // 去登录
  toLogin() {
    wx.reLaunch({
      url: '/pages/person/person',
    })
  },
  // 解绑卡
  unBindSocialCard() {
    this.setData({
      visibleBindPatient: true,
      visibleBindText: '解绑该社保卡',
      handleSelection: 'unBindSocialCardClick'
    })
  },
  unBindPatientCard() {
    this.setData({
      visibleBindPatient: true,
      visibleBindText: '解绑该就诊卡',
      handleSelection: 'handleBindOwnExpense'
    })
  },
  unBindSocialCardClick({
    detail
  }) {
    const index = detail.index;
    if (index == 1) {
      this.setData({
        spinShow: true,
      })
      setTimeout(async () => {
        let patient = {}
        patient.id = this.data.patientList[this.data.currentPatientIndex].id
        patient.isInsure = 0
        patient.insureNum = ''
        let result = await request('/api/user/patient/auth/bindPatientInsure', patient, 'POST', this.data.userToken)
        if (result.code == 200) {
          this.getPatientList()
        } else {
          $Toast({
            content: result.message,
            type: 'error'
          });
        }
        this.setData({
          spinShow: false,
        })
      }, 100)
    }
    this.setData({
      visibleBindPatient: false,
      visibleBindText: '',
      handleSelection: ''
    })
  },
  // 添加就诊人
  toAddPatient() {
    wx.navigateTo({
      url: '/pages/patientInfo/fixPatient/fixPatient',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '挂号订单'
    })
    this.setData({
      spinShow: true
    })
  },
  handleChange({
    detail
  }) {
    this.setData({
      spinShow: true,
      orderList: []
    })
    const type = detail.type;
    if (type === 'next') {
      this.setData({
        page: this.data.page + 1
      });
    } else if (type === 'prev') {
      this.setData({
        page: this.data.page - 1
      });
    }
    this.getOrderList()
  },
  // 选择的订单索引
  selected(e) {
    this.setData({
      currentOrderIndex: e.currentTarget.dataset.index
    })
  },
  // 选择就诊人索引
  selection(e) {
    this.setData({
      currentPatientIndex: e.currentTarget.dataset.index
    })
  },
  // 查看订单详情
  toDetail() {
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/patientInfo/order/order?currentOrderIndex=' + this.data.currentOrderIndex,
      })
    }, 100)
  },
  // 查看就诊人详情
  toPatientDetail() {
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/patientInfo/patient/patient?currentPatientIndex=' + this.data.currentPatientIndex,
      })
    }, 100)
  },
  // 绑定就诊信息
  ownExpense() {
    this.setData({
      visibleBindPatient: true,
      visibleBindText: '绑定就诊卡(自费就诊)',
      handleSelection: 'handleBindOwnExpense'
    })
  },
  // 绑定或解绑就诊卡
  handleBindOwnExpense({
    detail
  }) {
    const index = detail.index;
    if (index === 1) {
      this.setData({
        spinShow: true,
      })
      setTimeout(async () => {
        let patient = {}
        let currentPatient = this.data.patientList[this.data.currentPatientIndex]
        patient.id = currentPatient.id
        patient.status = currentPatient.status == 0 ? 1 : 0
        patient.isInsure = currentPatient.isInsure
        patient.insureNum = currentPatient.insureNum
        let result = await request('/api/user/patient/auth/bindPatientStatus', patient, 'POST', this.data.userToken)
        if (result.code == 200) {
          this.getPatientList()
        } else {
          $Toast({
            content: result.message,
            type: 'error'
          });
        }
        this.setData({
          spinShow: false,
        })
      }, 100)
    }
    this.setData({
      visibleBindPatient: false,
      visibleBindText: '',
      handleSelection: '',
    });
  },
  bindInsure() {
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/patientInfo/socialCard/index?currentPatientIndex=' + this.data.currentPatientIndex,
      })
    }, 100)
  },
  // 条件搜索订单
  searchOrderByPatient() {
    let patientList = []
    patientList.push('全部订单')
    for (let index = 0; index < this.data.patientList.length; index++) {
      const element = this.data.patientList[index];
      let patient = element.name + '  ' + element.certificatesNo
      patientList.push(patient)
    }
    wx.showActionSheet({
      itemList: patientList,
      success: async (res) => {
        let patientId = 0
        let currentPatientName = '全部'
        if (patientId != res.tapIndex) {
          patientId = this.data.patientList[res.tapIndex - 1].id
          currentPatientName = this.data.patientList[res.tapIndex - 1].name
        }
        this.setData({
          currentPatientName
        })
        this.getOrderList(patientId)
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.isLogin()
    if (!this.data.noLogin) {
      this.getOrderList()
      this.getPatientList()
    }
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