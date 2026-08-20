// Centralized Narrator Configuration for Wall Drop (Flutter)
// Never hardcode secret Google Cloud API keys directly in client source code.

class GoogleTTSVoiceConfig {
  final String languageCode;
  final String name;
  final String ssmlGender;

  const GoogleTTSVoiceConfig({
    required this.languageCode,
    required this.name,
    required this.ssmlGender,
  });
}

class NarratorConfig {
  static const String apiEndpoint = '/api/tts';
  static const String apiKey = ''; // Injected securely via backend proxy or env at build time
  static const double speakingRate = 1.20; // 1.15x - 1.25x fast energetic pace
  static const double pitch = -1.2; // Deep masculine tone
  static const bool useGoogleCloudApi = false; // Fallbacks to Flutter TTS locally
  static const bool cacheEnabled = true;

  static const Map<String, GoogleTTSVoiceConfig> maleVoices = {
    'pt': GoogleTTSVoiceConfig(
      languageCode: 'pt-BR',
      name: 'pt-BR-Neural2-B',
      ssmlGender: 'MALE',
    ),
    'en': GoogleTTSVoiceConfig(
      languageCode: 'en-US',
      name: 'en-US-Neural2-D',
      ssmlGender: 'MALE',
    ),
    'es': GoogleTTSVoiceConfig(
      languageCode: 'es-ES',
      name: 'es-ES-Neural2-B',
      ssmlGender: 'MALE',
    ),
    'fr': GoogleTTSVoiceConfig(
      languageCode: 'fr-FR',
      name: 'fr-FR-Neural2-B',
      ssmlGender: 'MALE',
    ),
    'de': GoogleTTSVoiceConfig(
      languageCode: 'de-DE',
      name: 'de-DE-Neural2-B',
      ssmlGender: 'MALE',
    ),
    'it': GoogleTTSVoiceConfig(
      languageCode: 'it-IT',
      name: 'it-IT-Neural2-C',
      ssmlGender: 'MALE',
    ),
    'ja': GoogleTTSVoiceConfig(
      languageCode: 'ja-JP',
      name: 'ja-JP-Neural2-C',
      ssmlGender: 'MALE',
    ),
    'zh': GoogleTTSVoiceConfig(
      languageCode: 'zh-CN',
      name: 'zh-CN-Neural2-B',
      ssmlGender: 'MALE',
    ),
  };

  static GoogleTTSVoiceConfig getVoiceForLanguage(String lang) {
    return maleVoices[lang] ?? maleVoices['pt']!;
  }
}
