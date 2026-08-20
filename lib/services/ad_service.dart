import 'package:flutter/foundation.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'ad_config.dart';

class AdService {
  static final AdService instance = AdService._internal();
  AdService._internal();

  RewardedAd? _rewardedAd;
  InterstitialAd? _interstitialAd;

  bool _isInitialized = false;
  bool _isRewardedAdLoading = false;
  bool _isInterstitialAdLoading = false;

  int _gamesPlayedCounter = 0;

  /// Call once at app startup
  static Future<void> initialize() async {
    if (kIsWeb) {
      debugPrint('[ADS] Dispositivo Web Preview detectado. Para testar anúncios reais ou do SDK Google Mobile Ads (AdMob), execute o app no APK Android real.');
      return;
    }

    debugPrint('[ADS] Inicializando AdMob...');
    try {
      await MobileAds.instance.initialize();
      instance._isInitialized = true;
      debugPrint('[ADS] AdMob inicializado com sucesso.');
      instance.preloadRewardedAd();
      instance.preloadInterstitialAd();
    } catch (e) {
      debugPrint('[ADS] Erro ao inicializar AdMob: $e');
    }
  }

  // --- REWARDED AD ---
  void preloadRewardedAd() {
    if (kIsWeb) return;
    if (_rewardedAd != null || _isRewardedAdLoading) return;
    _isRewardedAdLoading = true;

    debugPrint('[ADS] Carregando Rewarded (${AdConfig.rewardedAdUnitId})');

    RewardedAd.load(
      adUnitId: AdConfig.rewardedAdUnitId,
      request: const AdRequest(),
      rewardedAdLoadCallback: RewardedAdLoadCallback(
        onAdLoaded: (ad) {
          _rewardedAd = ad;
          _isRewardedAdLoading = false;
          debugPrint('[ADS] Rewarded carregado com sucesso!');
        },
        onAdFailedToLoad: (error) {
          _rewardedAd = null;
          _isRewardedAdLoading = false;
          debugPrint('[ADS] Rewarded falhou ao carregar: ${error.message} (Código: ${error.code}, Domínio: ${error.domain})');
        },
      ),
    );
  }

  void showRewardedAd({
    required VoidCallback onRewardGranted,
    Function(String message)? onAdUnavailable,
  }) {
    if (kIsWeb) {
      debugPrint('[ADS] Web Preview - Simulando rewarded ad ou liberando recompensa de dev');
      onRewardGranted();
      return;
    }

    if (!_isInitialized) {
      debugPrint('[ADS] Tentativa de exibir Rewarded antes de inicializar. Inicializando agora...');
      initialize();
      onAdUnavailable?.call('Anúncio ainda não disponível. Tente novamente.');
      return;
    }

    if (_rewardedAd == null) {
      debugPrint('[ADS] Rewarded não está pronto.');
      onAdUnavailable?.call('Anúncio ainda não disponível. Tente novamente.');
      preloadRewardedAd();
      return;
    }

    debugPrint('[ADS] Tentando mostrar Rewarded');

    bool rewardEarned = false;

    _rewardedAd!.fullScreenContentCallback = FullScreenContentCallback(
      onAdShowedFullScreenContent: (ad) {
        debugPrint('[ADS] Rewarded exibido');
      },
      onAdDismissedFullScreenContent: (ad) {
        debugPrint('[ADS] Rewarded fechado');
        ad.dispose();
        _rewardedAd = null;
        preloadRewardedAd();
        if (rewardEarned) {
          onRewardGranted();
        }
      },
      onAdFailedToShowFullScreenContent: (ad, error) {
        debugPrint('[ADS] Rewarded falhou ao exibir: ${error.message}');
        ad.dispose();
        _rewardedAd = null;
        onAdUnavailable?.call('Erro ao exibir anúncio.');
        preloadRewardedAd();
      },
    );

    _rewardedAd!.show(
      onUserEarnedReward: (AdWithoutView ad, RewardItem reward) {
        debugPrint('[ADS] Usuário recebeu recompensa: ${reward.amount} ${reward.type}');
        rewardEarned = true;
      },
    );
  }

  // --- INTERSTITIAL AD ---
  void preloadInterstitialAd() {
    if (kIsWeb) return;
    if (_interstitialAd != null || _isInterstitialAdLoading) return;
    _isInterstitialAdLoading = true;

    debugPrint('[ADS] Carregando Interstitial (${AdConfig.interstitialAdUnitId})');

    InterstitialAd.load(
      adUnitId: AdConfig.interstitialAdUnitId,
      request: const AdRequest(),
      interstitialAdLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) {
          _interstitialAd = ad;
          _isInterstitialAdLoading = false;
          debugPrint('[ADS] Interstitial carregado com sucesso!');
        },
        onAdFailedToLoad: (error) {
          _interstitialAd = null;
          _isInterstitialAdLoading = false;
          debugPrint('[ADS] Interstitial falhou ao carregar: ${error.message} (Código: ${error.code}, Domínio: ${error.domain})');
        },
      ),
    );
  }

  void onGameCompleted({
    required VoidCallback onAdCompleted,
  }) {
    if (kIsWeb) {
      onAdCompleted();
      return;
    }

    _gamesPlayedCounter++;
    debugPrint('[ADS] Partida concluída ($_gamesPlayedCounter/${AdConfig.gamesUntilInterstitial})');

    if (_gamesPlayedCounter >= AdConfig.gamesUntilInterstitial) {
      _gamesPlayedCounter = 0;
      if (_interstitialAd != null) {
        debugPrint('[ADS] Tentando mostrar Interstitial');
        _interstitialAd!.fullScreenContentCallback = FullScreenContentCallback(
          onAdShowedFullScreenContent: (ad) {
            debugPrint('[ADS] Interstitial exibido');
          },
          onAdDismissedFullScreenContent: (ad) {
            debugPrint('[ADS] Interstitial fechado');
            ad.dispose();
            _interstitialAd = null;
            preloadInterstitialAd();
            onAdCompleted();
          },
          onAdFailedToShowFullScreenContent: (ad, error) {
            debugPrint('[ADS] Interstitial falhou ao exibir: ${error.message}');
            ad.dispose();
            _interstitialAd = null;
            preloadInterstitialAd();
            onAdCompleted();
          },
        );
        _interstitialAd!.show();
        return;
      } else {
        debugPrint('[ADS] Interstitial não pronto ainda. Pré-carregando...');
        preloadInterstitialAd();
      }
    }

    onAdCompleted();
  }
}

