// pages/hospitalInfo/department/department.js
import request from '../../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hoscode: '',
    visibleCanlender: false,
    depcode: '',
    department: {},
    morDeptInfo: [],
    aftDeptInfo: [],
    spinShow: false,
    moreDetailSpin: false,
    currentDateIndex: 0,
    scrollItemId: 's0',
    releaseSoonStaus: false,
    releaseDays: '00',
    releaseHours: '00',
    releaseMinutes: '00',
    releaseSeconds: '00',
    morOrAft: '',
    timer: '',
    total: '',
    showMoreDetail: true,
    deptInfoIndex: -1,
    calendarNext: false,
    calendarPrev: false,
    speciallist: [],
  },
  // 倒计时
  countDown() {
    // 计算倒计时时长
    let releaseTime = new Date(this.getCurDate() + ' ' + this.data.department.baseMap.releaseTime).getTime()
    let nowTime = new Date().getTime()
    let morOrAft = ''
    let secondes = 0;
    if (releaseTime > nowTime) {
      morOrAft = '今天'
      //当前时间到放号时间的时长
      secondes = Math.floor((releaseTime - nowTime) / 1000);
    } else {
      morOrAft = '明天'
      //计算明天放号时间
      let releaseDate = new Date(releaseTime)
      releaseTime = new Date(releaseDate.setDate(releaseDate.getDate() + 1)).getTime()
      //当前时间到明天放号时间的时长
      secondes = Math.floor((releaseTime - nowTime) / 1000);
    }
    this.setData({
      morOrAft
    })

    //定时任务
    this.data.timer = setInterval(() => {
      secondes = secondes - 1
      if (secondes <= 0) {
        setTimeout(() => {
          if (this.data.currentDateIndex + 1 == this.data.total) {
            if (this.data.morDeptInfo.length == 0 && this.data.aftDeptInfo.length == 0) {
              let workDate = this.data.department.bookingScheduleList[this.data.total - 1].workDate
              this.getDeptSchedule(workDate)
            } else {
              this.setData({
                releaseSoonStaus: false
              })
            }
          }
        }, 3000)
        this.setData({
          releaseDays: '00',
          releaseHours: '00',
          releaseMinutes: '00',
          releaseSeconds: '00',
        })
        clearInterval(this.data.timer)
      }
      // 计算天数
      let releaseDays = Math.floor(secondes / (60 * 60 * 24));
      // 小时
      let releaseHours = Math.floor((secondes - (releaseDays * 60 * 60 * 24)) / (60 * 60));
      // 分钟
      let releaseMinutes = Math.floor((secondes - (releaseDays * 60 * 60 * 24) - (releaseHours * 60 * 60)) / 60);
      // 秒
      let releaseSeconds = secondes - (releaseDays * 60 * 60 * 24) - (releaseHours * 60 * 60) - (releaseMinutes * 60);
      if (releaseDays > 0) {
        this.setData({
          releaseDays
        })
      }
      this.setData({
        releaseHours,
        releaseMinutes,
        releaseSeconds,
      })
    }, 1000);
  },
  getCurDate() {
    let datetime = new Date()
    let year = datetime.getFullYear()
    let month = datetime.getMonth() + 1 < 10 ? '0' + (datetime.getMonth() + 1) : datetime.getMonth() + 1
    let date = datetime.getDate() < 10 ? '0' + datetime.getDate() : datetime.getDate()
    return year + '-' + month + '-' + date
  },
  // 点击日期切换
  handleChangeDate(e) {
    if (e.currentTarget.dataset.index == this.data.currentDateIndex) {
      return
    }
    let releaseSoonStaus = false
    let department = this.data.department
    let currentDateIndex = this.data.currentDateIndex
    department.bookingScheduleList[currentDateIndex].checked = false
    department.bookingScheduleList[e.currentTarget.dataset.index].checked = true
    if (department.bookingScheduleList[e.currentTarget.dataset.index].status == 1) {
      releaseSoonStaus = true
    }
    currentDateIndex = e.currentTarget.dataset.index
    this.setData({
      department,
      currentDateIndex,
      releaseSoonStaus,
      morDeptInfo: [],
      aftDeptInfo: [],
      showMoreDetail: true,
      scrollItemId: 's' + currentDateIndex,
      spinShow: true
    })
    // 更新数据
    let workDate = department.bookingScheduleList[currentDateIndex].workDate
    this.getDeptSchedule(workDate)
  },
  // 更新数据
  async getDeptSchedule(workDate) {
    let morDeptInfo = []
    let aftDeptInfo = []
    let scheduleInfoResult = await request('/api/hosp/hospital/auth/findScheduleList/' + this.data.hoscode + '/' + this.data.depcode + '/' + workDate)
    if (scheduleInfoResult.code == 200) {
      let currentScheduleInfo = scheduleInfoResult.data
      for (let i = 0; i < currentScheduleInfo.length; i++) {
        const element = currentScheduleInfo[i];
        if (element.workTime == 0) {
          morDeptInfo.push(element)
        }
        if (element.workTime == 1) {
          aftDeptInfo.push(element)
        }
      }
    }
    this.setData({
      morDeptInfo,
      aftDeptInfo,
    })
    setTimeout(() => {
      this.setData({
        spinShow: false
      })
    }, 500)
  },
  // 查看更多
  handleMoreDetail() {
    this.setData({
      moreDetailSpin: true,
    })
    setTimeout(() => {
      this.setData({
        showMoreDetail: false,
        moreDetailSpin: false,
      })
    }, 500)
  },
  // 查看日期
  handleDate() {
    this.setData({
      visibleCanlender: !this.data.visibleCanlender
    })
  },
  /**
   * 点击日期时候触发的事件
   */
  dayClick(e) {
    let targetDeptScheduleIndex = -1
    let department = this.data.department
    for (let i = 0; i < department.bookingScheduleList.length; i++) {
      const element = department.bookingScheduleList[i];
      if (element.workDate == e.detail.date) {
        targetDeptScheduleIndex = i
      }
    }
    if (targetDeptScheduleIndex == -1) {
      return
    }
    let releaseSoonStaus = false
    department.bookingScheduleList[this.data.currentDateIndex].checked = false
    department.bookingScheduleList[targetDeptScheduleIndex].checked = true

    if (department.bookingScheduleList[targetDeptScheduleIndex].status == 1) {
      releaseSoonStaus = true
    }
    let currentDateIndex = targetDeptScheduleIndex
    this.setData({
      department,
      currentDateIndex,
      releaseSoonStaus,
      morDeptInfo: [],
      aftDeptInfo: [],
      showMoreDetail: true,
      spinShow: true,
      scrollItemId: 's' + targetDeptScheduleIndex,
    })
    // 更新数据
    let workDate = department.bookingScheduleList[currentDateIndex].workDate
    this.handleDate()
    this.getDeptSchedule(workDate)
  },
  // 挂号确认
  handleDeptIndex(e) {
    this.setData({
      deptInfoIndex: e.currentTarget.dataset.index
    })
  },
  handleRegister(e) {
    setTimeout(() => {
      let deptInfo = {}
      if (e.currentTarget.dataset.day == 0) {
        deptInfo = this.data.morDeptInfo[this.data.deptInfoIndex]
      }
      if (e.currentTarget.dataset.day == 1) {
        deptInfo = this.data.aftDeptInfo[this.data.deptInfoIndex]
      }
      if (deptInfo) {
        wx.setStorageSync('deptInfo', deptInfo)
        wx.navigateTo({
          url: '/pages/hospitalInfo/booking/booking',
        })
      }
    }, 100)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let morDeptInfo = []
    let aftDeptInfo = []
    let hoscode = options.hoscode
    let depcode = options.depcode
    let result = await request('/api/hosp/hospital/auth/mpGetBookingScheduleRule/' + hoscode + '/' + depcode)
    if (result.code == 200) {
      let department = result.data
      department.bookingScheduleList[0].checked = true
      this.setData({
        department,
        total: department.total
      })
      let scheduleInfoResult = await request('/api/hosp/hospital/auth/findScheduleList/' + hoscode + '/' + depcode + '/' + department.bookingScheduleList[0].workDate)
      if (scheduleInfoResult.code == 200) {
        let currentScheduleInfo = scheduleInfoResult.data
        for (let i = 0; i < currentScheduleInfo.length; i++) {
          const element = currentScheduleInfo[i];
          if (element.workTime == 0) {
            morDeptInfo.push(element)
          }
          if (element.workTime == 1) {
            aftDeptInfo.push(element)
          }
        }
      }
    }
    this.countDown()
    this.setData({
      hoscode,
      depcode,
      morDeptInfo,
      aftDeptInfo,
    })

    // 处理日历选择器
    let nowMonth = new Date().getMonth() + 1
    let speciallist = []
    for (let i = 0; i < this.data.department.bookingScheduleList.length; i++) {
      const element = this.data.department.bookingScheduleList[i];
      const workDateMonth = parseInt(element.workDate.split('-')[1])
      // 上一月和下一月的显示
      if (workDateMonth > nowMonth) {
        this.setData({
          calendarNext: true
        })
      }
      if (workDateMonth < nowMonth) {
        this.setData({
          calendarPrev: true
        })
      }
      // 备注信息
      let remark = {}
      remark.date = element.workDate
      remark.background = '#dddddd'
      remark.textBgcolor = '#dddddd'
      if (element.availableNumber > 0) {
        remark.background = '#4d80fd'
        remark.textBgcolor = '#4d80fd'
        remark.text = '有号'
      } else if (element.availableNumber == 0) {
        remark.text = '约满'
      } else {
        remark.text = '无号'
      }
      if (element.status == 1) {
        remark.background = '#4d80fd'
        remark.textBgcolor = '#4d80fd'
        remark.text = '即将放号'
      } else if (element.status == -1) {
        remark.text = '停止挂号'
      }
      remark.color = '#fff'
      speciallist[i] = remark
    }
    this.setData({
      speciallist
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
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清除倒计时
    clearInterval(this.data.timer)
    wx.removeStorageSync('deptInfo')
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