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
    total: 0,
    spinShow: true,
    scrollTop: 0,
  },
  onChange(event){
      console.log(event.detail,'click right menu callback data')
  },
  //页面滚动执行方式
  onPageScroll(event){
      this.setData({
          scrollTop : event.scrollTop
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    let hospitalInfoList = await request('/api/hosp/hospital/list/1/' + this.data.limit)
    if(hospitalInfoList.code === 200) {
      let currentPage = this.data.page - 1
      this.setData({
        total: hospitalInfoList.data.totalElements,
        ['hospitalList[' + currentPage + ']']: hospitalInfoList.data.content
      })
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
    // let count = 0
    // for (let i = 0; i < this.data.hospitalList.length; i++) {
    //   for (let j = 0; j < this.data.hospitalList[i].length; j++) {
    //     count++
    //   }
    // }
    // if (count == this.data.total) {
    //   this.setData({
    //     // spinShow: false
    //   })
    // }
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
    let count = 0
    for (let i = 0; i < this.data.hospitalList.length; i++) {
      for (let j = 0; j < this.data.hospitalList[i].length; j++) {
        count++
      }
    }
    if (count == this.data.total) {
      this.setData({
        spinShow: false
      })
    }
    if ( count < this.data.total) {
      this.setData({
        page: this.data.page + 1
      })
      let hospitalInfoList = await request('/api/hosp/hospital/list/'+ this.data.page + '/5')
      if(hospitalInfoList.code === 200) {
        let currentPage = this.data.page - 1
        this.setData({
          ['hospitalList[' + currentPage + ']']: hospitalInfoList.data.content
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
