import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuthStore } from '../store/authStore'
import AuthNavigator from './AuthNavigator'
import AppNavigator from './AppNavigator'

export default function RootNavigator() {
  const { isLoggedIn, loadToken } = useAuthStore()

  useEffect(() => { loadToken() }, [loadToken])

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}