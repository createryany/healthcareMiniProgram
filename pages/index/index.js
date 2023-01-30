// pages/index/index.js
import request from '../../utils/request.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hospitalList: [],
    isShowFilter: false,
    page: 1,
    limit: 5,
    total: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    wx.showLoading({
      title: '正在加载数据...',
    })
    let hospitalInfoList = await request('/api/hosp/hospital/list/1/' + this.data.limit)
    if(hospitalInfoList.code === 200) {
      this.setData({
        total: hospitalInfoList.data.totalElements,
        hospitalList: hospitalInfoList.data.content
      })
      wx.hideLoading()
    }
  },
  
  // 筛选根据医院等级和地区医院信息
  filterHospital() {
    this.setData({
      isShowFilter: !this.data.isShowFilter
    })
  },
  // 跳到搜索页面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  // 跳转到核酸检测页面
  check() {
    wx.navigateTo({
      url: '/pages/check/check'
    })
  },
  notice() {
    wx.navigateTo({
      url: '/pages/notice/notice'
    })
  },
  appointment() {
    wx.navigateTo({
      url: '/pages/help/guide/process/process'
    })
  },
  help() {
    wx.navigateTo({
      url: '/pages/help/help'
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
  async onReachBottom() {
    if ( this.data.hospitalList.length < this.data.total) {
      this.setData({
        page: this.data.page + 1
      })
      let hospitalInfoList = await request('/api/hosp/hospital/list/'+ this.data.page + '/5')
      if(hospitalInfoList.code === 200) {
        const hospResult = hospitalInfoList.data.content
        let hospitalList = this.data.hospitalList
        for (let index = 0; index < hospResult.length; index++) {
          const element = hospResult[index];
          hospitalList.push(element)
        }
        hospitalList.push()
        this.setData({
          hospitalList
        })
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    
  }
})
