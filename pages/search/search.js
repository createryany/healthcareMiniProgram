// pages/search/search.js
import request from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchContent: '', // 搜索内容
    searchList: [], // 搜索结果
    isSearchResult: false,
    historyList: [],
    isFocus: true,
    historyItem: ''
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
            historyList: [],
            searchContent: '',
            searchList: [],
            isSearchResult: false
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
  },

  // 点击搜索发送请求
  async getSearchList() {
    if(!this.data.searchContent) {
      this.setData({
        searchList: [],
        isSearchResult: false
      })
      return
    }
    wx.showLoading({
      title: '正在搜索...',
    })
    let historyList = this.data.historyList
    let searchContent = this.data.searchContent
    let searchResult = await request('/api/hosp/hospital/findByHosName/' + searchContent)
    if(searchResult.code === 200) {
      this.setData({
        searchList: searchResult.data
      })
      // 将搜索历史记录保存
      if(this.data.historyList.indexOf(searchContent) !== -1) {
        this.data.historyList.splice(this.data.historyList.indexOf(searchContent), 1)
      }
      if (historyList) {
        historyList.unshift(searchContent)
      } else {
        historyList = [searchContent]
      }
      this.setData({
        historyList
      })
      wx.setStorageSync('searchHistory', historyList)
      
      if(searchResult.data.length === 0) {
        this.setData({
          isSearchResult: true
        }) 
      }
      wx.hideLoading()
    }
  },
  async historySearch(e) {
    this.setData({
      isSearchResult: false
    }) 
    wx.showLoading({
      title: '正在搜索...',
    })
    let historyList = this.data.historyList
    let searchContent = e.target.dataset.historyitem
    this.setData({
      searchContent
    })
    let searchResult = await request('/api/hosp/hospital/findByHosName/' + searchContent)
    if(searchResult.code === 200) {
      this.setData({
        searchList: searchResult.data
      })
      // 将原来的记录删除
      for (let index = 0; index < historyList.length; index++) {
        const element = historyList[index];
        if (element === searchContent) {
          historyList.splice(index, 1)
          break
        }
      }
      // 将搜索历史记录保存
      if(this.data.historyList.indexOf(searchContent) !== -1) {
        this.data.historyList.splice(this.data.historyList.indexOf(searchContent), 1)
      }
      if (historyList) {
        historyList.unshift(searchContent)
      } else {
        historyList = [searchContent]
      }
      this.setData({
        historyList
      })
      wx.setStorageSync('searchHistory', historyList)
      if(searchResult.data.length === 0) {
        this.setData({
          isSearchResult: true
        }) 
      }
      wx.hideLoading()
    }
  },
  // 取消
  toIndex() {
    wx.navigateBack()
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