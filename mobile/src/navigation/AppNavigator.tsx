import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, View } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import HomeScreen            from '../screens/app/HomeScreen'
import TransactionListScreen from '../screens/app/TransactionListScreen'
import AddTransactionScreen  from '../screens/app/AddTransactionScreen'
import StatsScreen           from '../screens/app/StatsScreen'
import ProfileScreen         from '../screens/app/ProfileScreen'
import { colors } from '../constants/colors'

const Tab = createBottomTabNavigator()

function AddButton() {
  return (
    <View style={styles.addButton}>
      <MaterialCommunityIcons name="plus" size={28} color="#fff" />
    </View>
  )
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        headerShown:  false,
        tabBarStyle:  styles.tabBar,
        tabBarLabelStyle: styles.label,
      }}>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Transactions"
        component={TransactionListScreen}
        options={{
          title: 'Giao dịch',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />

      {/* Nút Add nổi ở giữa */}
      <Tab.Screen
        name="Add"
        component={AddTransactionScreen}
        options={{
          title: '',
          tabBarIcon: () => <AddButton />,
          tabBarLabel: () => null,
        }}
      />

      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Thống kê',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-pie" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
})