// pages/hospitalInfo/index.js
import request from '../../utils/request.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hospitalInfo: {}, // 医院详情信息
    departmentInfo: [], // 医院科室信息
    isSearchDept: false,
    currentIndex: 0,
    currentDeptList: [],
    searchText: '',
    searchList: [],
    searchStatus: false,
    visibleTips: true,
    actionsTips: [{
      name: '确定',
      color: '#2d8cf0',
    }],
  },
  // 关闭平台提示
  handleCloseTips() {
    this.setData({
      visibleTips: false
    })
  },
  // 搜索科室
  handleSearchDept(e) {
    this.setData({
      searchText: e.detail.value
    })
    if (this.data.searchText.length == 0) {
      this.setData({
        searchList: [],
        searchStatus: false
      })
    }
    this.searchDepartment()
  },
  async searchDepartment() {
    if (this.data.searchText) {
      let result = await request('/api/hosp/department/mpFindDeptByName/' + this.data.searchText)
      if (result.code == 200) {
        let searchList = result.data
        let searchStatus = false
        if (result.data.length == 0) {
          searchStatus = true
        }
        this.setData({
          searchList,
          searchStatus
        })
      }
    }
  },
  searchDeptTap() {
    this.setData({
      isSearchDept: true
    })
  },
  // 取消搜索
  cancelSearchDept() {
    this.setData({
      isSearchDept: false,
      searchText: '',
      searchList: [],
      searchStatus: false,
    })
  },
  // 切换大科室
  handleDeptValue(e) {
    let departmentInfo = this.data.departmentInfo
    departmentInfo[this.data.currentIndex].checked = false
    departmentInfo[e.currentTarget.dataset.index].checked = true
    let currentDeptList = departmentInfo[e.currentTarget.dataset.index].children
    this.setData({
      departmentInfo,
      currentDeptList,
      currentIndex: e.currentTarget.dataset.index
    })
  },
  // 查看医院详情
  hospitalDetail() {
    wx.navigateTo({
      url: '/pages/hospitalInfo/hospital/hospital',
    })
  },
  // 查看科室详情
  handleDeptDetail(e) {
    // 向缓存中保存选中科室数据
    if (!wx.getStorageSync('userInfo')) {
      // 去登录
      wx.reLaunch({
        url: '/pages/person/person?historyPath=' + '',
      })
    } else {
      this.cancelSearchDept()
      wx.navigateTo({
        url: '/pages/hospitalInfo/department/department?depcode=' + e.currentTarget.dataset.depcode + '&hoscode=' + this.data.hospitalInfo.hospital.hoscode,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let hospitalInfo = wx.getStorageSync('hospitalInfo')
    let departmentInfo = wx.getStorageSync('departmentInfo')
    if (!hospitalInfo) {
      // 查询医院信息
      let result = await request('/api/hosp/hospital/mpFindHospDetail/' + options.hoscode)
      if (result.code == 200) {
        wx.setStorageSync('hospitalInfo', result.data)
        hospitalInfo = result.data
      }
    }
    if (!departmentInfo) {
      // 查询科室信息
      let result = await request('/api/hosp/hospital/findDeptByHoscode/' + options.hoscode)
      if (result.code == 200) {
        wx.setStorageSync('departmentInfo', result.data)
        departmentInfo = result.data
      }
    }
    let currentDeptList = []
    if (departmentInfo[0]) {
      departmentInfo[0].checked = true
      currentDeptList = departmentInfo[0].children
    } else {

    }
    this.setData({
      hospitalInfo,
      departmentInfo,
      currentDeptList
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
    if (wx.getStorageSync('hospitalInfo')) {
      wx.removeStorageSync('hospitalInfo')
    }
    if (wx.getStorageSync('departmentInfo')) {
      wx.removeStorageSync('departmentInfo')
    }
    if (wx.getStorageSync('department')) {
      wx.removeStorageSync('department')
    }
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