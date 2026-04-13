// src/screens/app/HomeScreen.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
export default function HomeScreen() {
  return <View style={styles.c}><Text>Home Screen</Text></View>
}
const styles = StyleSheet.create({ c: { flex: 1, alignItems: 'center', justifyContent: 'center' } })