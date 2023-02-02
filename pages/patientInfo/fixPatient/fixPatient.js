// pages/patientInfo/fixPatient/fixPatient.js
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
    nationArray: [],
    patientBtnText: '添加就诊人',
    patientBtn: 'addPatient',
    nameSpecial: false, // 添加名字特殊字符
    contactsNameSpecial: false, // 添加联系人名字特殊字符
    isFocus: false, // 姓名框聚焦
    isContactsFocus: false, // 联系人姓名框聚焦
    mask: false,
    certificatesTypeList: [], // 证件类型集合
    manStatus: false,
    womanStatus: false,
    marryStatus: false,
    noMarryStatus: false,
    nowDate: '', // 当前日期
    region: ['河南省', '郑州市', '中原区'],
    certificatesTypeName: '', // 证件类型
    contactsCertificatesTypeName: '', // 联系人证件类型
    currentAddress: '', // 当前住址
    nation: '', // 民族
    tipList: [false, false, false, false, false, false, false, false, false, false],
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
    handleSelection: '',
    userToken: '', // 用户token
  },
  // 添加名字特殊字符
  addSpecial() {
    this.setData({
      isFocus: true
    })
    let patient = this.data.patient
    let name = patient.name
    if (name && name.charAt(name.length - 1) !== '·') {
      patient.name = name + '·'
      this.setData({
        patient
      })
    }
  },
  showSpecial() {
    this.closeContactsSpecial()
    this.setData({
      nameSpecial: true,
      mask: true
    })
  },
  closeSpecial() {
    this.setData({
      nameSpecial: false,
      mask: false
    })
  },
  // 添加联系人名字特殊字符
  addContactsSpecial() {
    this.setData({
      isContactsFocus: true
    })
    let patient = this.data.patient
    let contactsName = patient.contactsName
    if (contactsName && contactsName.charAt(contactsName.length - 1) !== '·') {
      patient.contactsName = contactsName + '·'
      this.setData({
        patient
      })
    }
  },
  showContactsSpecial() {
    this.closeSpecial()
    this.setData({
      contactsNameSpecial: true,
      mask: true
    })
  },
  closeContactsSpecial() {
    this.setData({
      contactsNameSpecial: false,
      mask: false
    })
  },
  maskClose() {
    this.closeSpecial()
    this.closeContactsSpecial()
  },
  // 姓名
  handleNameInput(e) {
    let patient = this.data.patient
    patient.name = e.detail.value
    this.setData({
      patient
    })
    this.nameBlur()
  },
  nameBlur() {
    if (!this.data.patient.name) {
      let tipList = this.data.tipList
      tipList[0] = true
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[0] = false
      this.setData({
        tipList
      })
    }
  },
  // 选择证件类型
  handleCertificatesType() {
    this.closeSpecial()
    let typeList = []
    let certificatesTypeList = this.data.certificatesTypeList
    for (let index = 0; index < certificatesTypeList.length; index++) {
      const element = certificatesTypeList[index];
      typeList.push(element.name)
    }
    wx.showActionSheet({
      itemList: typeList,
      success: (res) => {
        let patient = this.data.patient
        let tipList = this.data.tipList
        tipList[1] = false
        patient.certificatesType = certificatesTypeList[res.tapIndex].value
        this.setData({
          patient,
          tipList,
          certificatesTypeName: certificatesTypeList[res.tapIndex].name
        })
      },
      cancel: () => {
        this.certificatesTypeBlur()
      }
    })
  },
  certificatesTypeBlur() {
    if (this.data.certificatesTypeName) {
      let tipList = this.data.tipList
      tipList[1] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[1] = true
      this.setData({
        tipList
      })
    }
  },
  // 证件号码
  handleCertificatesNo(e) {
    let patient = this.data.patient
    patient.certificatesNo = e.detail.value
    this.setData({
      patient
    })
    this.certificatesNoBlur()
  },
  certificatesNoBlur() {
    if (!this.data.patient.certificatesNo) {
      let tipList = this.data.tipList
      tipList[2] = true
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[2] = false
      this.setData({
        tipList
      })
    }
  },
  // 性别
  changeMan() {
    this.closeSpecial()
    let patient = this.data.patient
    patient.sex = 1
    this.setData({
      manStatus: true,
      womanStatus: false,
      patient
    })
    this.sexTips()
  },
  changeWoman() {
    this.closeSpecial()
    let patient = this.data.patient
    patient.sex = 0
    this.setData({
      womanStatus: true,
      manStatus: false,
      patient
    })
    this.sexTips()
  },
  sexTips() {
    if (this.data.patient.sex == 0 || this.data.patient.sex == 1) {
      let tipList = this.data.tipList
      tipList[3] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[3] = true
      this.setData({
        tipList
      })
    }
  },
  // 出生日期
  handleBirth(e) {
    this.birthdateBlur()
    let patient = this.data.patient
    patient.birthdate = e.detail.value
    if (e.detail.value) {
      this.setData({
        patient
      })
    }
    this.birthdateBlur()
  },
  birthdateBlur() {
    if (this.data.patient.birthdate) {
      let tipList = this.data.tipList
      tipList[4] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[4] = true
      this.setData({
        tipList
      })
    }
  },
  bindClickBirth() {
    this.maskClose()
    this.birthdateBlur()
  },
  // 手机号码
  handlePhone(e) {
    let patient = this.data.patient
    patient.phone = e.detail.value
    this.setData({
      patient
    })
    this.phoneBlur()
  },
  phoneBlur() {
    if (this.data.patient.phone) {
      let tipList = this.data.tipList
      tipList[5] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[5] = true
      this.setData({
        tipList
      })
    }
  },
  // 当前住址
  handleCurrentAddress(e) {
    let currentAddress = e.detail.value
    let patient = this.data.patient
    patient.provinceCode = e.detail.code[0]
    patient.cityCode = e.detail.code[1]
    patient.districtCode = e.detail.code[2]
    this.setData({
      currentAddress,
      patient
    })
    this.currentAddressBlur()
  },
  currentAddressBlur() {
    if (this.data.currentAddress) {
      let tipList = this.data.tipList
      tipList[6] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[6] = true
      this.setData({
        tipList
      })
    }
  },
  bindCurrentAddressClick() {
    this.maskClose()
    this.currentAddressBlur()
  },
  // 详细住址
  handleAddress(e) {
    let patient = this.data.patient
    patient.address = e.detail.value
    this.setData({
      patient
    })
    this.addressBlur()
  },
  addressBlur() {
    if (this.data.patient.address) {
      let tipList = this.data.tipList
      tipList[7] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[7] = true
      this.setData({
        tipList
      })
    }
  },
  // 获取当前日期
  nowDate() {
    const now = new Date();
    const year = now.getFullYear(); //得到年份
    let month = now.getMonth(); //得到月份
    let date = now.getDate(); //得到日期
    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    const time = year + "-" + month + "-" + date; //（格式化"yyyy-MM-dd"）
    this.setData({
      nowDate: time
    })
  },
  // 是否结婚
  marry() {
    this.maskClose()
    let patient = this.data.patient
    patient.isMarry = 1
    this.setData({
      marryStatus: true,
      noMarryStatus: false,
      patient
    })
    this.marrayTips()
  },
  noMarry() {
    this.maskClose()
    let patient = this.data.patient
    patient.isMarry = 0
    this.setData({
      marryStatus: false,
      noMarryStatus: true,
      patient
    })
    this.marrayTips()
  },
  marrayTips() {
    if (this.data.patient.isMarry == 0 || this.data.patient.isMarry == 1) {
      let tipList = this.data.tipList
      tipList[8] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[8] = true
      this.setData({
        tipList
      })
    }
  },
  // 民族
  handleNation(e) {
    let nationInfo = this.data.nationArray[e.detail.value]
    let nation = nationInfo.name
    let patient = this.data.patient
    patient.nation = nationInfo.value
    this.setData({
      nation,
      patient
    })
    this.nationBlur()
  },
  nationBlur() {
    if (this.data.patient.nation) {
      let tipList = this.data.tipList
      tipList[9] = false
      this.setData({
        tipList
      })
    } else {
      let tipList = this.data.tipList
      tipList[9] = true
      this.setData({
        tipList
      })
    }
  },
  bindNationClick() {
    this.maskClose()
    this.nationBlur()
  },
  // 联系人证件类型
  handleContactsCertificatesType() {
    this.maskClose()
    let typeList = []
    let certificatesTypeList = this.data.certificatesTypeList
    for (let index = 0; index < certificatesTypeList.length; index++) {
      const element = certificatesTypeList[index];
      typeList.push(element.name)
    }
    wx.showActionSheet({
      itemList: typeList,
      success: (res) => {
        let patient = this.data.patient
        patient.contactsCertificatesType = certificatesTypeList[res.tapIndex].value
        this.setData({
          patient,
          contactsCertificatesTypeName: certificatesTypeList[res.tapIndex].name
        })
      }
    })
  },
  // 联系人姓名
  handleContactsName(e) {
    let patient = this.data.patient
    patient.contactsName = e.detail.value
    this.setData({
      patient
    })
  },
  // 联系人证件号码
  handleContactsCertificatesNo(e) {
    let patient = this.data.patient
    patient.contactsCertificatesNo = e.detail.value
    this.setData({
      patient
    })
  },
  // 联系人手机号码
  handleContactsPhone(e) {
    let patient = this.data.patient
    patient.contactsPhone = e.detail.value
    this.setData({
      patient
    })
  },
  // 数据校验
  patientData() {
    this.nameBlur()
    this.certificatesTypeBlur()
    this.certificatesNoBlur()
    this.sexTips()
    this.birthdateBlur()
    this.phoneBlur()
    this.currentAddressBlur()
    this.addressBlur()
    this.marrayTips()
    this.nationBlur()

    let flag = true
    for (let index = 0; index < this.data.tipList.length; index++) {
      const element = this.data.tipList[index];
      if (element) {
        flag = false
      }
    }
    if (!flag) return false

    if (this.data.patient.certificatesType == '10') {
      if (this.data.patient.certificatesNo.length != 18) {
        wx.showToast({
          title: '就诊人证件号码格式不正确',
          icon: 'none'
        })
        return false
      }
    }

    let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
    if (!phoneReg.test(this.data.patient.phone)) {
      wx.showToast({
        title: '就诊人手机号码格式不正确',
        icon: 'none'
      })
      return false
    }
    if (this.data.patient.contactsPhone) {
      if (!phoneReg.test(this.data.patient.contactsPhone)) {
        wx.showToast({
          title: '联系人手机号码格式不正确',
          icon: 'none'
        })
        return false
      }
      if (this.data.patient.contactsPhone == this.data.patient.phone) {
        wx.showToast({
          title: '联系人手机号码不能与就诊人手机号码相同',
          icon: 'none'
        })
        return false
      }
    }

    if (this.data.patient.contactsCertificatesType) {
      if (this.data.patient.contactsCertificatesType == '10') {
        if (this.data.patient.contactsCertificatesNo.length != 18) {
          wx.showToast({
            title: '联系人证件号码格式不正确',
            icon: 'none'
          })
          return false
        }
      }
      if (this.data.patient.contactsCertificatesNo == this.data.patient.certificatesNo) {
        wx.showToast({
          title: '联系人证件号码不能与就诊人证件号码相同',
          icon: 'none'
        })
        return false
      }
    }
    return flag
  },
  // 添加就诊人
  addPatient() {
    let patientResult = this.patientData()
    if (patientResult) {
      this.setData({
        visible: true,
        handleSelection: 'handleAddPatient'
      })
    }
  },
  handleAddPatient({
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
        let patient = this.data.patient
        let result = await request('/api/user/patient/auth/save', patient, 'POST', this.data.userToken)
        action[1].loading = false;
        this.setData({
          visible: false,
          actions: action
        });
        if (result.code == 200) {
          $Toast({
            content: '添加就诊人成功',
            type: 'success'
          });
          // 初始化数据
          this.setData({
            patient: {},
            nation: '',
            currentAddress: '',
            contactsCertificatesTypeName: '',
            certificatesTypeName: '',
            noMarryStatus: false,
            marryStatus: false,
            womanStatus: false,
            manStatus: false,
          })
          wx.navigateBack()
        } else if (result.code == 213) {
          $Toast({
            content: '就诊人手机号码已被使用',
            type: 'error'
          });
        } else if (result.code == 2150) {
          $Toast({
            content: '就诊人证件号码已被使用',
            type: 'error'
          });
        } else {
          $Toast({
            content: result.message,
            type: 'error'
          });
        }
      }, 100);
    }
  },
  // 修改就诊人信息
  editPatient() {
    let patientResult = this.patientData()
    if (patientResult) {
      this.setData({
        visible: true,
        handleSelection: 'handleEditPatient'
      })
    }
  },
  handleEditPatient({detail}) {
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
        let patient = this.data.patient
        let result = await request('/api/user/patient/auth/update', patient, 'POST', this.data.userToken)
        action[1].loading = false;
        this.setData({
          visible: false,
          actions: action
        });
        if (result.code == 200) {
          $Toast({
            content: '修改就诊人成功',
            type: 'success'
          });
          // 初始化数据
          this.setData({
            patient: {},
            nation: '',
            currentAddress: '',
            contactsCertificatesTypeName: '',
            certificatesTypeName: '',
            noMarryStatus: false,
            marryStatus: false,
            womanStatus: false,
            manStatus: false,
          })
          wx.switchTab({ url: '/pages/patientInfo/patientInfo' })
        } else if (result.code == 213) {
          $Toast({
            content: '就诊人手机号码已被使用',
            type: 'error'
          });
        } else if (result.code == 2150) {
          $Toast({
            content: '就诊人证件号码已被使用',
            type: 'error'
          });
        } else {
          $Toast({
            content: result.message,
            type: 'error'
          });
        }
      }, 100);
    }
  },
  // 查询证件类型信息
  async searchCertificatesTypeList() {
    let certificatesTypeResult = await request('/admin/cmn/dict/findByDictCode/CertificatesType')
    if (certificatesTypeResult.code === 200) {
      let certificatesTypeList = certificatesTypeResult.data
      this.setData({
        certificatesTypeList
      })
    }
  },
  // 查询民族信息
  async searchNationList() {
    let nationArray = []
    let nationResult = await request('/admin/cmn/dict/findChildData/99100')
    if (nationResult.code === 200) {
      nationArray = nationResult.data
      this.setData({
        nationArray
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.nowDate()
    let title = '添加就诊人'
    if (options.currentPatientIndex) {
      title = '修改就诊人信息'
      this.setData({
        patientBtnText: '修改就诊人信息',
        patientBtn: 'editPatient'
      })
      let currentPatientIndex = options.currentPatientIndex
      let patient = JSON.parse(wx.getStorageSync('patientList').trim())[currentPatientIndex]
      this.setData({
        patient,
        certificatesTypeName: patient.param.certificatesTypeString,
        contactsCertificatesTypeName: patient.param.contactsCertificatesTypeString,
        currentAddress: patient.param.provinceString + ',' + patient.param.cityString + ',' + patient.param.districtString,
        nation: patient.param.nationString,
      })
      if (patient.sex == 1) {
        this.changeMan()
      } else {
        this.changeWoman()
      }
      if (patient.isMarry == 0) {
        this.noMarry()
      } else {
        this.marry()
      }
      if (patient.contactsCertificatesTypeName) {
        this.setData({
          contactsCertificatesTypeName: patient.contactsCertificatesTypeName,
        })
      }
    }
    wx.setNavigationBarTitle({
      title: title,
    })
    this.setData({
      userToken: JSON.parse(wx.getStorageSync('userInfo').trim()).token
    })
    this.searchCertificatesTypeList()
    this.searchNationList()
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