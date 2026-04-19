import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'auth_token'

export const tokenStorage = {
  get:    ()            => AsyncStorage.getItem(KEY),
  set:    (accessToken: string) => AsyncStorage.setItem(KEY, accessToken),
  remove: ()            => AsyncStorage.removeItem(KEY),
}