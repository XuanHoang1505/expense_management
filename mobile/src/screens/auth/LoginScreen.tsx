import React, { useState } from 'react'
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import Toast from 'react-native-toast-message'

import { authApi } from '../../api/authApi'
import { useAuthStore } from '../../store/authStore'
import { colors } from '../../constants/colors'

type FormData = {
  email: string
  password: string
}

export default function LoginScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const res = await authApi.login(data)
      const { accessToken, user } = res.data.data

      await setAuth(accessToken, user)

      Toast.show({
        type: "success",
        text1: "Đăng nhập thành công!"
      })

      reset()

    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: e.response?.data?.message || 'Có lỗi xảy ra'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý chi tiêu</Text>
      <Text style={styles.subtitle}>Đăng nhập</Text>

      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Vui lòng nhập email',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email không hợp lệ'
          }
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.error}>
                {errors.email.message}
              </Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Vui lòng nhập mật khẩu',
          minLength: {
            value: 6,
            message: 'Mật khẩu tối thiểu 6 ký tự'
          }
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={value}
              onChangeText={onChange}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.error}>
                {errors.password.message}
              </Text>
            )}
          </>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Đăng nhập</Text>
        }
      </TouchableOpacity>

      {/* LINK */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>
          Chưa có tài khoản? Đăng ký ngay
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center',
    padding: 24, backgroundColor: colors.background,
  },
  title: {
    fontSize: 28, fontWeight: 'bold',
    color: colors.primary, textAlign: 'center', marginBottom: 8,
  },
  subtitle: {
    fontSize: 18, color: colors.text.secondary,
    textAlign: 'center', marginBottom: 32,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
})