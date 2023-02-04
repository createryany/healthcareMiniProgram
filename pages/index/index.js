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
    isOnReachBottom: true,
    noData: false,
    spinFilterShow: false,
    selectionLevelTags: [],
    selectionCityTags: [],
    levelList: [],
    cityList: [],
    animation: '',
    count: 1,
    animationData: '',
    hospitalQueryVo: {},
    fixedFilter: '',
  },
  // 跳转到医院详情页面
  toHospitalInfo(e) {
    wx.navigateTo({
      url: '/pages/hospitalInfo/index?hoscode=' + e.currentTarget.dataset.hoscode,
    })
  },
  // 初始化数据，搜索医院数据
  async searchHospList() {
    let hospitalInfoList = await request('/api/hosp/hospital/list/1/' + this.data.limit, this.data.hospitalQueryVo)
    if (hospitalInfoList.code === 200) {
      let currentPage = this.data.page - 1
      this.setData({
        total: hospitalInfoList.data.totalElements,
        ['hospitalList[' + currentPage + ']']: hospitalInfoList.data.content
      })
    }
    setTimeout(() => {
      this.setData({
        spinFilterShow: false
      })
    }, 100)
    let total = 0
    for (let i = 0; i < this.data.hospitalList.length; i++) {
      const element = this.data.hospitalList[i]
      if (!element) break
      for (let j = 0; j < this.data.hospitalList[i].length; j++) {
        total++
      }
    }
    if (this.data.total == total) {
      this.setData({
        spinShow: false,
        noData: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.searchHospList()
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
  // 医院等级信息
  async getHospLevelList() {
    // 所有等级信息 
    let levelListResult = await request('/admin/cmn/dict/findChildData/10000')
    if (levelListResult.code == 200) {
      let levelList = []
      let level = {}
      levelList = levelListResult.data
      level.id = '0'
      level.name = '全部等级'
      level.checked = true
      levelList.unshift(level)
      wx.setStorageSync('levelList', levelList)
      this.setData({
        levelList
      })
    }
  },
  // 城市信息
  async getCityList() {
    // 所有城市信息 
    let cityListResult = await request('/admin/cmn/dict/findChildData/410000')
    if (cityListResult.code == 200) {
      let cityList = []
      let city = {}
      city.id = 0
      city.name = '全部城市'
      city.checked = true
      cityList = cityListResult.data
      cityList.unshift(city)
      wx.setStorageSync('cityList', cityList)
      this.setData({
        cityList
      })
    }
  },
  // 筛选
  levelTagChange(event) {
    // 重置医院列表数据
    this.setData({
      hospitalList: [],
      page: 1,
      spinFilterShow: true,
      selectionLevelTags: []
    })
    let hospitalQueryVo = this.data.hospitalQueryVo
    let levelList = this.data.levelList
    if (this.data.levelList[event.detail.name].value) {
      hospitalQueryVo.hostype = this.data.levelList[event.detail.name].value
    } else {
      hospitalQueryVo.hostype = ''
    }
    for (let index = 0; index < levelList.length; index++) {
      const element = levelList[index]
      element.checked = false
    }
    let levelTag = {}
    let selectionLevelTags = this.data.selectionLevelTags
    if (event.detail.name != 0) {
      levelTag.name = levelList[event.detail.name].name
      selectionLevelTags.push(levelTag)
    }
    this.setData({
      hospitalQueryVo,
      levelList,
      ['levelList[' + event.detail.name + '].checked']: true,
      selectionLevelTags
    })
    this.searchHospList()
    this.filterHospital()
  },
  cityTagChange(event) {
    // 重置医院列表数据
    this.setData({
      hospitalList: [],
      page: 1,
      spinFilterShow: true,
      selectionCityTags: []
    })
    let hospitalQueryVo = this.data.hospitalQueryVo
    let cityList = this.data.cityList
    if (this.data.cityList[event.detail.name].value) {
      hospitalQueryVo.cityCode = this.data.cityList[event.detail.name].value
    } else {
      hospitalQueryVo.cityCode = ''
    }
    for (let index = 0; index < cityList.length; index++) {
      const element = cityList[index]
      element.checked = false
    }
    let cityTag = {}
    let selectionCityTags = this.data.selectionCityTags
    if (event.detail.name != 0) {
      cityTag.name = cityList[event.detail.name].name
      selectionCityTags.push(cityTag)
    }
    this.setData({
      hospitalQueryVo,
      cityList,
      ['cityList[' + event.detail.name + '].checked']: true,
      selectionCityTags
    })
    this.searchHospList()
    this.filterHospital()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},
  // 标签旋转
  iconfontRotate() {
    this.animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
      delay: 0,
    })
    this.animation.rotate(180 * this.data.count).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  // 筛选页面抽出
  filterTraslate() {
    let Y = 0
    if (this.data.count == 0) Y = 350
    this.animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'ease',
      delay: 0,
    })
    this.animation.translateY(Y).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  // 筛选根据医院等级和地区医院信息
  filterHospital() {
    this.iconfontRotate()
    this.filterTraslate()
    this.setData({
      isShowFilter: !this.data.isShowFilter,
      count: this.data.count == 1 ? 0 : 1
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let levelListStorage = wx.getStorageSync('levelList')
    let cityListStorage = wx.getStorageSync('cityList')
    if (!levelListStorage) this.getHospLevelList()
    if (!cityListStorage) this.getCityList()
    this.setData({
      levelList: levelListStorage,
      cityList: cityListStorage
    })
  },
  // 监听滚动
  onPageScroll(e) {
    if (e.scrollTop > 228) {
      this.setData({
        fixedFilter: 'fixedFilter'
      })
    } else {
      this.setData({
        fixedFilter: ''
      })
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
  async onReachBottom() {
    if (!this.data.isShowFilter && this.data.isOnReachBottom) {
      this.setData({
        spinShow: true,
        isOnReachBottom: false
      })
      let count = 0
      for (let i = 0; i < this.data.hospitalList.length; i++) {
        if (!this.data.hospitalList[i]) break
        for (let j = 0; j < this.data.hospitalList[i].length; j++) {
          if (!this.data.hospitalList[i][j]) break
          count++
        }
      }
      if (count == this.data.total) {
        this.setData({
          spinShow: false,
          noData: true,
          isOnReachBottom: true
        })
      }
      if (count < this.data.total) {
        this.setData({
          page: this.data.page + 1
        })
        let hospitalInfoList = await request('/api/hosp/hospital/list/' + this.data.page + '/5')
        if (hospitalInfoList.code === 200) {
          let currentPage = this.data.page - 1
          this.setData({
            ['hospitalList[' + currentPage + ']']: hospitalInfoList.data.content,
            isOnReachBottom: true
          })
        }
      }
    }
    this.setData({
      spinShow: false
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})