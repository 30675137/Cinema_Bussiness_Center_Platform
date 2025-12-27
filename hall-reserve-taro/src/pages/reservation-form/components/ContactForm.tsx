/**
 * 联系人表单组件
 * 收集姓名和手机号
 */
import { View, Text, Input } from '@tarojs/components'
import { useState, useEffect } from 'react'
import { useReservationStore } from '@/stores/reservationStore'

export default function ContactForm() {
  const { contactInfo, setContactInfo } = useReservationStore()
  
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  // 手机号验证正则
  const phoneRegex = /^1[3-9]\d{9}$/

  // 验证姓名
  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('请输入联系人姓名')
      return false
    }
    if (name.length > 20) {
      setNameError('姓名不能超过20个字符')
      return false
    }
    setNameError('')
    return true
  }

  // 验证手机号
  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      setPhoneError('请输入联系人手机号')
      return false
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError('请输入正确的11位手机号')
      return false
    }
    setPhoneError('')
    return true
  }

  const handleNameChange = (e: any) => {
    const value = e.detail.value
    setContactInfo({ name: value })
    // 实时验证
    if (value) {
      validateName(value)
    } else {
      setNameError('')
    }
  }

  const handlePhoneChange = (e: any) => {
    const value = e.detail.value
    setContactInfo({ phone: value })
    // 实时验证
    if (value) {
      validatePhone(value)
    } else {
      setPhoneError('')
    }
  }

  const handleNameBlur = () => {
    validateName(contactInfo.name)
  }

  const handlePhoneBlur = () => {
    validatePhone(contactInfo.phone)
  }

  return (
    <View className="contact-form">
      {/* 姓名 */}
      <View className="form-item">
        <Text className="form-label">
          联系人姓名 <Text className="required">*</Text>
        </Text>
        <Input
          className={`form-input ${nameError ? 'error' : ''}`}
          type="text"
          placeholder="请输入联系人姓名"
          value={contactInfo.name}
          onInput={handleNameChange}
          onBlur={handleNameBlur}
          maxlength={20}
        />
        {nameError && <Text className="error-msg">{nameError}</Text>}
      </View>

      {/* 手机号 */}
      <View className="form-item">
        <Text className="form-label">
          联系人手机 <Text className="required">*</Text>
        </Text>
        <Input
          className={`form-input ${phoneError ? 'error' : ''}`}
          type="number"
          placeholder="请输入11位手机号"
          value={contactInfo.phone}
          onInput={handlePhoneChange}
          onBlur={handlePhoneBlur}
          maxlength={11}
        />
        {phoneError && <Text className="error-msg">{phoneError}</Text>}
      </View>
    </View>
  )
}
