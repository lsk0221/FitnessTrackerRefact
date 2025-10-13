/**
 * i18next 配置文件
 * i18next Configuration File
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 導入語言資源
import en from './locales/en.json';
import zh from './locales/zh.json';

// 語言資源配置
const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

// 獲取設備語言
const getDeviceLanguage = () => {
  try {
    const locale = Localization.locale;
    
    // 檢查 locale 是否存在且為字符串
    if (!locale || typeof locale !== 'string') {
      console.log('Locale not available, using default language');
      return 'zh'; // 預設使用中文
    }
    
    const languageCode = locale.split('-')[0];
    
    // 支援的語言列表
    const supportedLanguages = ['en', 'zh'];
    
    // 如果設備語言在支援列表中，使用設備語言
    if (supportedLanguages.includes(languageCode)) {
      console.log(`Using device language: ${languageCode}`);
      return languageCode;
    }
    
    // 否則使用中文作為預設
    console.log(`Device language ${languageCode} not supported, using default: zh`);
    return 'zh';
  } catch (error) {
    console.error('Error getting device language:', error);
    return 'zh'; // 預設使用中文
  }
};

// 初始化 i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(), // 使用設備語言作為預設
    fallbackLng: 'zh', // 回退語言設為中文
    debug: __DEV__, // 開發模式下啟用調試
    
    interpolation: {
      escapeValue: false, // React Native 不需要轉義
    },
    
    // 語言檢測配置
    detection: {
      // 自定義語言檢測邏輯
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

// 語言切換函數
export const changeLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('language', languageCode);
    console.log(`Language changed to: ${languageCode}`);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

// 載入保存的語言偏好
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    if (savedLanguage && resources[savedLanguage]) {
      await i18n.changeLanguage(savedLanguage);
      console.log(`Loaded saved language: ${savedLanguage}`);
    } else {
      console.log('No saved language found, using device language');
    }
  } catch (error) {
    console.error('Failed to load saved language:', error);
  }
};

// 獲取當前語言
export const getCurrentLanguage = () => {
  return i18n.language;
};

// 獲取支援的語言列表
export const getSupportedLanguages = () => {
  return Object.keys(resources).map(code => ({
    code,
    name: resources[code].translation.languages[code] || code,
  }));
};

export default i18n;
