// pages/search/search.js
import request from '../../utils/request'
let isSend = false // 函数节流
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchContent: '', // 搜索内容
    searchList: [], // 搜索结果
    isSearchResult: false,
    historyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取搜索历史记录
    this.getHistorySearch()
  },

  // 获取搜素历史记录
  getHistorySearch() {
    let historyList = wx.getStorageSync('searchHistory')
    this.setData({
      historyList
    })
  },
  // 清除搜索历史
  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: [],
      isSearchResult: false
    })
  },
  // 清空搜索历史记录
  deleteSearchHistory() {
    wx.showModal({
      title: '提示',
      content: '确认删除历史记录?',
      complete: (res) => {    
        if (res.confirm) {
          this.setData({
            historyList: []
          })
          wx.removeStorageSync('searchHistory')
        }
      }
    })
  },
  // 用户搜索
  handleInputChange(event) {
    this.setData({
      searchContent: event.detail.value.trim()
    })
    if(isSend) return
    isSend = true
    this.getSearchList()
    // 函数节流
    setTimeout(() => {
      isSend = false
    }, 300)
  },

  // 发送请求
  async getSearchList() {
    if(!this.data.searchContent) {
      this.setData({
        searchList: [],
        isSearchResult: false
      })
      return
    }
    let {searchContent, historyList} = this.data
    let searchResult = await request('/api/hosp/hospital/findByHosName/' + searchContent)
    if(searchResult.code === 200) {
      this.setData({
        searchList: searchResult.data
      })
      // 将搜索历史记录保存
      if(historyList.indexOf(searchContent) !== -1) {
        historyList.splice(historyList.indexOf(searchContent), 1)
      }
      historyList.unshift(searchContent)
      this.setData({
        historyList
      })
      wx.setStorageSync('searchHistory', historyList)
    }
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