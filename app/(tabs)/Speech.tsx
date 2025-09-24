import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SpeechApp() {
  const [textToSpeak, setTextToSpeak] = useState('Hello! This is a text-to-speech demo.');
  const [transcribedText, setTranscribedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(null);
  const [speechHistory, setSpeechHistory] = useState([]);

  useEffect(() => {
    // Request audio permissions on component mount
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Audio permission is required for speech recognition.');
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const speakText = async () => {
    try {
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        return;
      }

      if (!textToSpeak.trim()) {
        Alert.alert('Error', 'Please enter some text to speak');
        return;
      }

      setIsSpeaking(true);
      
      const options = {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('Speech error:', error);
          setIsSpeaking(false);
          Alert.alert('Error', 'Failed to speak text');
        }
      };

      await Speech.speak(textToSpeak, options);
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to speak text');
    }
  };

  const startRecording = async () => {
    try {
      if (isRecording) {
        await stopRecording();
        return;
      }

      // Stop any ongoing speech
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording start error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setRecording(null);

      // In a real app, you would send this audio file to a speech-to-text service
      // For demo purposes, we'll simulate the transcription
      simulateTranscription();
      
    } catch (error) {
      console.error('Recording stop error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const simulateTranscription = () => {
    // Simulate speech-to-text conversion
    // In a real app, you would use services like:
    // - Google Cloud Speech-to-Text
    // - Amazon Transcribe
    // - Azure Speech Services
    // - OpenAI Whisper API
    
    const mockTranscriptions = [
      "Hello, this is a test recording.",
      "Speech recognition is working great!",
      "This is a simulated transcription result.",
      "Voice to text conversion complete.",
      "Recording processed successfully."
    ];
    
    const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    const timestamp = new Date().toLocaleTimeString();
    
    setTranscribedText(randomTranscription);
    setSpeechHistory(prev => [...prev, { text: randomTranscription, timestamp }]);
  };

  const clearHistory = () => {
    setSpeechHistory([]);
    setTranscribedText('');
  };

  const copyToSpeech = (text) => {
    setTextToSpeak(text);
  };

  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <View className="max-w-md mx-auto">
        {/* Header */}
        <View className="mb-8 text-center">
          <Text className="text-3xl font-bold text-gray-800 mb-2">Speech App</Text>
          <Text className="text-gray-600">Text-to-Speech & Speech-to-Text</Text>
        </View>

        {/* Text-to-Speech Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="text-xl font-semibold text-gray-800 mb-4">🗣️ Text-to-Speech</Text>
          
          <TextInput
            value={textToSpeak}
            onChangeText={setTextToSpeak}
            placeholder="Enter text to speak..."
            multiline
            numberOfLines={4}
            className="bg-gray-50 rounded-lg p-4 text-base border border-gray-200 mb-4"
            style={{ textAlignVertical: 'top' }}
          />
          
          <TouchableOpacity
            onPress={speakText}
            className={`py-4 px-6 rounded-lg ${isSpeaking ? 'bg-red-500' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isSpeaking ? '⏸️ Stop Speaking' : '🔊 Speak Text'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Speech-to-Text Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="text-xl font-semibold text-gray-800 mb-4">🎤 Speech-to-Text</Text>
          
          <TouchableOpacity
            onPress={startRecording}
            className={`py-4 px-6 rounded-lg mb-4 ${isRecording ? 'bg-red-500' : 'bg-green-500'}`}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
            </Text>
          </TouchableOpacity>

          {transcribedText ? (
            <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Text className="text-sm font-medium text-gray-600 mb-2">Latest Transcription:</Text>
              <Text className="text-base text-gray-800">{transcribedText}</Text>
              <TouchableOpacity
                onPress={() => copyToSpeech(transcribedText)}
                className="mt-3 py-2 px-4 bg-blue-100 rounded-lg self-start"
              >
                <Text className="text-blue-600 text-sm font-medium">📝 Copy to Speech</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-gray-500 text-center italic">
              No transcription yet. Try recording something!
            </Text>
          )}
        </View>

        {/* History Section */}
        {speechHistory.length > 0 && (
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-800">📝 History</Text>
              <TouchableOpacity
                onPress={clearHistory}
                className="py-2 px-4 bg-gray-100 rounded-lg"
              >
                <Text className="text-gray-600 text-sm font-medium">Clear</Text>
              </TouchableOpacity>
            </View>
            
            {speechHistory.slice().reverse().map((item, index) => (
              <View key={index} className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                <Text className="text-gray-800 text-base mb-1">{item.text}</Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 text-xs">{item.timestamp}</Text>
                  <TouchableOpacity
                    onPress={() => copyToSpeech(item.text)}
                    className="py-1 px-3 bg-blue-100 rounded"
                  >
                    <Text className="text-blue-600 text-xs font-medium">Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View className="bg-yellow-50 rounded-2xl p-6 mt-6 border border-yellow-200">
          <Text className="text-lg font-semibold text-yellow-800 mb-3">📋 Instructions</Text>
          <Text className="text-yellow-700 text-sm leading-relaxed">
            <Text className="font-medium">Text-to-Speech:</Text> Enter text and tap "Speak Text" to hear it spoken aloud.{'\n\n'}
            <Text className="font-medium">Speech-to-Text:</Text> Tap "Start Recording" and speak. The transcription is simulated for demo purposes. In production, integrate with services like Google Speech-to-Text or OpenAI Whisper.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}