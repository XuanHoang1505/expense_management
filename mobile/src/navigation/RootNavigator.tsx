import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuthStore } from '../store/authStore'
import AuthNavigator from './AuthNavigator'
import AppNavigator from './AppNavigator'
import AddCategoryScreen from '../screens/app/AddCategoryScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SearchTransactionScreen from '../screens/app/SearchTransactionScreen'
import DetailTransactionScreen from '../screens/app/DetailTransactionScreen'

const Root = createNativeStackNavigator()

export default function RootNavigator() {
  const { isLoggedIn, loadToken } = useAuthStore()

  useEffect(() => { loadToken() }, [loadToken])

  return (
    <NavigationContainer>
     <Root.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Root.Screen name="Main"        component={AppNavigator} />
            <Root.Screen
              name="AddCategory"
              component={AddCategoryScreen}
              options={{ presentation: 'modal' }} 
            />
            <Root.Screen
              name="SearchTransaction"
              component={SearchTransactionScreen}
              options={{ presentation: 'modal' }} 
            />
            <Root.Screen 
              name="DetailTransaction"
              component={DetailTransactionScreen}
              options={{presentation: 'modal'}}
            />
          </>
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  )
}