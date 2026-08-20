// Centralized Narrator Service for Wall Drop (Flutter)
import 'dart:math';

import 'narrator_config.dart';

enum NarratorCategory {
  welcome,
  start,
  scoreMilestone,
  highStreak,
  highScore,
  defeat,
  unlock,
  nearMiss,
  coinMilestone,
  combo3,
  combo5,
  combo10,
  evolution,
}

class NarratorService {
  static final NarratorService _instance = NarratorService._internal();
  factory NarratorService() => _instance;
  NarratorService._internal();

  String _lastSpokenPhrase = '';
  final Set<String> _recentPhrases = {};
  int _currentPriority = 0;

  static const Map<String, Map<NarratorCategory, List<String>>> phrases = {
    'pt': {
      NarratorCategory.welcome: [
        'Bem-vindo ao WALL DROP, {name}. Vamos ver até onde consegues chegar.',
      ],
      NarratorCategory.start: [
        'Vamos!',
        'Preparado?',
        'Começou!',
        'Mostra o que sabes!',
        'Vamos nessa, {name}!',
        'Foco total, {name}!',
      ],
      NarratorCategory.scoreMilestone: [
        'Boa!',
        'Isso!',
        'Continua!',
        'Excelente!',
        'Não para!',
      ],
      NarratorCategory.highStreak: [
        'Está rápido!',
        'Impressionante!',
        'Continua!',
        'Isso está insano!',
      ],
      NarratorCategory.highScore: [
        'NOVO RECORDE!',
        'Que pontuação!',
        'Impressionante, {name}!',
        'Conseguiste!',
      ],
      NarratorCategory.defeat: [
        'Quase!',
        'Foi por pouco!',
        'Mais uma?',
        'Não desiste agora, {name}!',
      ],
      NarratorCategory.unlock: [
        'Desbloqueado!',
        'Novo personagem!',
        'Agora ficou interessante!',
      ],
      NarratorCategory.nearMiss: ['Quase!'],
      NarratorCategory.coinMilestone: ['Rico de moedas!'],
      NarratorCategory.combo3: ['Boa!'],
      NarratorCategory.combo5: ['Insano!'],
      NarratorCategory.combo10: ['MONSTRO!'],
      NarratorCategory.evolution: ['Aumentando velocidade!'],
    },
  };

  int getPriority(NarratorCategory category) {
    switch (category) {
      case NarratorCategory.highScore:
        return 5;
      case NarratorCategory.unlock:
        return 4;
      case NarratorCategory.defeat:
        return 3;
      case NarratorCategory.welcome:
      case NarratorCategory.start:
        return 2;
      default:
        return 1;
    }
  }

  String getPhrase(NarratorCategory category, String lang, String playerName) {
    final langBank = phrases[lang] ?? phrases['pt']!;
    final categoryList = langBank[category] ?? langBank[NarratorCategory.defeat]!;

    List<String> candidates = categoryList.where((p) => p != _lastSpokenPhrase).toList();
    if (candidates.isEmpty) {
      candidates = List.from(categoryList);
    }

    final nonRecent = candidates.where((p) => !_recentPhrases.contains(p)).toList();
    if (nonRecent.isNotEmpty) {
      candidates = nonRecent;
    }

    final random = Random();
    final selected = candidates[random.nextInt(candidates.length)];

    _lastSpokenPhrase = selected;
    _recentPhrases.add(selected);
    if (_recentPhrases.length > 6) {
      _recentPhrases.remove(_recentPhrases.first);
    }

    final name = playerName.trim().isNotEmpty ? playerName.trim() : 'Jogador';
    return selected.replaceAll('{name}', name);
  }

  void resetMatchHistory() {
    _recentPhrases.clear();
    _lastSpokenPhrase = '';
    _currentPriority = 0;
  }
}
