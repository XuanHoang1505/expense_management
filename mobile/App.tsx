import React from 'react'
import { StatusBar } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <PaperProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <RootNavigator />
    </PaperProvider>
  )
}