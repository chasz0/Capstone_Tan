import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Southeast Asian languages
const SOUTHEAST_ASIAN_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', speechCode: 'ms-MY' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', speechCode: 'fil-PH' },
  { code: 'my', name: 'Myanmar', flag: '🇲🇲', speechCode: 'my-MM' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭', speechCode: 'km-KH' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦', speechCode: 'lo-LA' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', speechCode: 'bn-BD' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ta', name: 'Tamil', flag: '🇱🇰', speechCode: 'ta-IN' },
];

export default function TextToSpeechScreen() {
  const [textToSpeak, setTextToSpeak] = useState('Hello! This is a text-to-speech demo.');
  const [translatedText, setTranslatedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState(SOUTHEAST_ASIAN_LANGUAGES[0]); // English
  const [targetLanguage, setTargetLanguage] = useState(SOUTHEAST_ASIAN_LANGUAGES[1]); // Indonesian
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [pickerType, setPickerType] = useState(''); // 'source' or 'target'
  const [pulseAnim] = useState(new Animated.Value(1));
  const [translationHistory, setTranslationHistory] = useState([]);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (isSpeaking) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  const translateWithGemini = async (text, fromLang, toLang) => {
    try {
      setIsTranslating(true);
      
      const promptToApi = async (prompt) => {
        try {
          // Import GoogleGenerativeAI at the top of your file
          // import { GoogleGenerativeAI } from '@google/generative-ai';
          
          const genAI = new GoogleGenerativeAI("AIzaSyCvq6MlCjP0VGA6-ZTbgCQISGvSs95EvaU");
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
          const res = await model.generateContent(prompt);
          return res.response.text();
        } catch (err) {
          console.error('Gemini API Error:', err);
          throw new Error('Could not get response from Gemini API');
        }
      };
      
      const prompt = `Translate the following text from ${fromLang.name} to ${toLang.name}. Only output the translation, nothing else: "${text}"`;
      
      // Call the Gemini API
      const translation = await promptToApi(prompt);
      
      return translation.trim(); // Return the cleaned translation
      
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to mock translations if API fails
      const mockTranslations = {
        'en-id': {
          'Hello! This is a text-to-speech demo.': 'Halo! Ini adalah demo text-to-speech.',
          'Good morning': 'Selamat pagi',
          'Thank you': 'Terima kasih',
          'How are you?': 'Apa kabar?',
          'Hello': 'Halo',
          'Nice to meet you': 'Senang berkenalan denganmu',
          'Goodbye': 'Selamat tinggal',
        },
        'en-ms': {
          'Hello! This is a text-to-speech demo.': 'Helo! Ini adalah demo teks-ke-suara.',
          'Good morning': 'Selamat pagi',
          'Thank you': 'Terima kasih',
          'How are you?': 'Apa khabar?',
          'Hello': 'Helo',
          'Nice to meet you': 'Seronok berkenalan dengan awak',
          'Goodbye': 'Selamat tinggal',
        },
        'en-th': {
          'Hello! This is a text-to-speech demo.': 'สวัสดี! นี่คือการสาธิตแปลงข้อความเป็นเสียง',
          'Good morning': 'สวัสดีตอนเช้า',
          'Thank you': 'ขอบคุณ',
          'How are you?': 'คุณเป็นอย่างไรบ้าง?',
          'Hello': 'สวัสดี',
          'Nice to meet you': 'ยินดีที่ได้รู้จัก',
          'Goodbye': 'ลาก่อน',
        },
        'en-vi': {
          'Hello! This is a text-to-speech demo.': 'Xin chào! Đây là bản demo chuyển văn bản thành giọng nói.',
          'Good morning': 'Chào buổi sáng',
          'Thank you': 'Cảm ơn bạn',
          'How are you?': 'Bạn có khỏe không?',
          'Hello': 'Xin chào',
          'Nice to meet you': 'Rất vui được gặp bạn',
          'Goodbye': 'Tạm biệt',
        },
        'en-tl': {
          'Hello! This is a text-to-speech demo.': 'Kumusta! Ito ay isang demo ng text-to-speech.',
          'Good morning': 'Magandang umaga',
          'Thank you': 'Salamat',
          'How are you?': 'Kumusta ka?',
          'Hello': 'Kumusta',
          'Nice to meet you': 'Natutuwa akong makilala ka',
          'Goodbye': 'Paalam',
        },
      };
      
      const translationKey = `${fromLang.code}-${toLang.code}`;
      const translations = mockTranslations[translationKey] || {};
      const fallbackTranslation = translations[text] || `[Translation to ${toLang.name}]: ${text}`;
      
      return fallbackTranslation;
      
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslate = async () => {
    if (!textToSpeak.trim()) {
      Alert.alert('Error', 'Please enter some text to translate');
      return;
    }

    try {
      const translation = await translateWithGemini(textToSpeak, selectedLanguage, targetLanguage);
      setTranslatedText(translation);
      
      // Add to history
      const historyItem = {
        original: textToSpeak,
        translated: translation,
        fromLang: selectedLanguage,
        toLang: targetLanguage,
        timestamp: new Date().toLocaleString(),
      };
      
      setTranslationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      Alert.alert('Translation Error', error.message);
    }
  };

  const speakText = async (text, language) => {
    try {
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        return;
      }

      if (!text.trim()) {
        Alert.alert('Error', 'Please enter some text to speak');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSpeaking(true);
      
      const options = {
        language: language.speechCode,
        pitch: speechPitch,
        rate: speechRate,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          Alert.alert('Error', 'Failed to speak text');
        }
      };

      await Speech.speak(text, options);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to speak text');
    }
  };

  const openLanguagePicker = (type) => {
    setPickerType(type);
    setShowLanguagePicker(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectLanguage = (language) => {
    if (pickerType === 'source') {
      setSelectedLanguage(language);
    } else {
      setTargetLanguage(language);
    }
    setShowLanguagePicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const swapLanguages = () => {
    const temp = selectedLanguage;
    setSelectedLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Also swap the texts
    if (translatedText) {
      const tempText = textToSpeak;
      setTextToSpeak(translatedText);
      setTranslatedText(tempText);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const useTranslation = () => {
    if (translatedText) {
      setTextToSpeak(translatedText);
      setTranslatedText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const quickTexts = [
    'Hello',
    'Good morning',
    'Thank you',
    'How are you?',
    'Nice to meet you',
    'Goodbye',
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#000000' : '#f8fafc',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 30,
      paddingTop: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.tabIconDefault,
      textAlign: 'center',
      opacity: 0.8,
    },
    languageSection: {
      marginBottom: 20,
    },
    languageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    languageButton: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 4,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    swapButton: {
      backgroundColor: colors.tint,
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 8,
    },
    languageFlag: {
      fontSize: 24,
      marginBottom: 4,
    },
    languageName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    card: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    textInput: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f1f5f9',
      borderRadius: 16,
      padding: 20,
      fontSize: 16,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e2e8f0',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    primaryButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 6,
    },
    translationCard: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8fafc',
      borderRadius: 16,
      padding: 20,
      marginTop: 16,
      borderWidth: 2,
      borderColor: colors.tint + '40',
    },
    translatedText: {
      fontSize: 16,
      color: colors.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    translationActions: {
      flexDirection: 'row',
      gap: 8,
    },
    secondaryButton: {
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#e2e8f0',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    quickTextsContainer: {
      marginTop: 16,
    },
    quickTextsTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    quickTextsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    quickTextButton: {
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f1f5f9',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#333333' : '#e2e8f0',
    },
    quickTextButtonText: {
      color: colors.text,
      fontSize: 13,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRadius: 20,
      padding: 24,
      width: width * 0.9,
      maxHeight: height * 0.7,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8fafc',
    },
    languageOptionFlag: {
      fontSize: 24,
      marginRight: 12,
    },
    languageOptionText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    closeButton: {
      backgroundColor: colors.tint,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    closeButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? ['#000000', '#1a1a2e', '#16213e'] 
          : ['#667eea', '#764ba2', '#f093fb']
        }
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <IconSymbol 
                name="globe.asia.australia.fill" 
                size={48} 
                color={colors.tint} 
              />
            </Animated.View>
            <Text style={styles.title}>Translate & Speak</Text>
            <Text style={styles.subtitle}>Southeast Asian Languages</Text>
          </View>

          {/* Language Selection */}
          <View style={styles.languageSection}>
            <View style={styles.languageRow}>
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => openLanguagePicker('source')}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{selectedLanguage.flag}</Text>
                <Text style={styles.languageName}>{selectedLanguage.name}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.swapButton}
                onPress={swapLanguages}
                activeOpacity={0.7}
              >
                <IconSymbol name="arrow.left.arrow.right" size={20} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.languageButton}
                onPress={() => openLanguagePicker('target')}
                activeOpacity={0.7}
              >
                <Text style={styles.languageFlag}>{targetLanguage.flag}</Text>
                <Text style={styles.languageName}>{targetLanguage.name}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.card}>
            <TextInput
              style={styles.textInput}
              value={textToSpeak}
              onChangeText={setTextToSpeak}
              placeholder={`Type in ${selectedLanguage.name}...`}
              placeholderTextColor={colors.tabIconDefault}
              multiline
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={() => speakText(textToSpeak, selectedLanguage)}
                disabled={!textToSpeak.trim() || isSpeaking}
                activeOpacity={0.8}
              >
                <IconSymbol 
                  name={isSpeaking ? 'stop.fill' : 'play.fill'} 
                  size={16} 
                  color="#ffffff" 
                />
                <Text style={styles.buttonText}>
                  {isSpeaking ? 'Stop' : 'Speak'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#10b981' }]}
                onPress={handleTranslate}
                disabled={!textToSpeak.trim() || isTranslating}
                activeOpacity={0.8}
              >
                {isTranslating ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.loadingText}>Translating...</Text>
                  </View>
                ) : (
                  <>
                    <IconSymbol name="globe" size={16} color="#ffffff" />
                    <Text style={styles.buttonText}>Translate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Texts */}
            <View style={styles.quickTextsContainer}>
              <Text style={styles.quickTextsTitle}>Quick Texts</Text>
              <View style={styles.quickTextsGrid}>
                {quickTexts.map((text, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickTextButton}
                    onPress={() => setTextToSpeak(text)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickTextButtonText}>{text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Translation Result */}
          {translatedText && (
            <View style={styles.card}>
              <Text style={[styles.quickTextsTitle, { marginBottom: 16 }]}>
                Translation ({targetLanguage.name})
              </Text>
              
              <View style={styles.translationCard}>
                <Text style={styles.translatedText}>{translatedText}</Text>
                
                <View style={styles.translationActions}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => speakText(translatedText, targetLanguage)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="speaker.2" size={14} color={colors.text} />
                    <Text style={styles.secondaryButtonText}>Speak</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={useTranslation}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name="arrow.up" size={14} color={colors.text} />
                    <Text style={styles.secondaryButtonText}>Use</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Translation History */}
          {translationHistory.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.quickTextsTitle}>Recent Translations</Text>
              {translationHistory.slice(0, 3).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.translationCard, { marginTop: 12 }]}
                  onPress={() => {
                    setTextToSpeak(item.original);
                    setTranslatedText(item.translated);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.translatedText, { fontSize: 14, marginBottom: 8 }]}>
                    {item.fromLang.flag} {item.original}
                  </Text>
                  <Text style={[styles.translatedText, { fontSize: 14, marginBottom: 0, opacity: 0.8 }]}>
                    {item.toLang.flag} {item.translated}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </ScrollView>

        {/* Language Picker Modal */}
        <Modal
          visible={showLanguagePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLanguagePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Select {pickerType === 'source' ? 'Source' : 'Target'} Language
              </Text>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                {SOUTHEAST_ASIAN_LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={styles.languageOption}
                    onPress={() => selectLanguage(language)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.languageOptionFlag}>{language.flag}</Text>
                    <Text style={styles.languageOptionText}>{language.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLanguagePicker(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}