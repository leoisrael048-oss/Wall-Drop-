// lib/services/storage_service.dart
// Shared storage interface for Flutter Wall Drop builds

class StorageService {
  static final StorageService instance = StorageService._internal();
  StorageService._internal();

  String playerName = 'Léo';
  String language = 'pt';
  bool narratorEnabled = true;
  double narratorVolume = 1.0;
  double narratorSpeed = 1.25;
  int coins = 0;
  int highScore = 0;
  String selectedCharacter = 'nox';
  List<String> unlockedCharacters = ['nox'];

  Future<void> init() async {
    // Load local shared preferences
  }

  Future<void> savePlayerName(String name) async {
    playerName = name;
  }

  Future<void> saveLanguage(String lang) async {
    language = lang;
  }

  Future<void> saveCoins(int amount) async {
    coins = amount;
  }

  Future<void> saveHighScore(int score) async {
    highScore = score;
  }
}
