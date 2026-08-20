import { AD_CONFIG } from './adConfig';

export type AdErrorCode = 'unavailable' | 'not_finished' | 'timeout' | 'loading' | 'offline' | string;

class AdService {
  private gamesPlayedCount: number = 0;
  private isAdLoading: boolean = false;
  private adTimeoutTimer: NodeJS.Timeout | null = null;

  public getIsTestMode(): boolean {
    return AD_CONFIG.useTestAds;
  }

  public getAdUnitIds() {
    return {
      appId: AD_CONFIG.appId,
      rewarded: AD_CONFIG.rewardedAdUnitId,
      interstitial: AD_CONFIG.interstitialAdUnitId,
      banner: AD_CONFIG.bannerAdUnitId,
    };
  }

  // Frequency tracking for Interstitial ads (e.g. show every 3 games)
  public incrementGamesPlayed(): number {
    this.gamesPlayedCount++;
    console.log(`[ADS] Partida concluída (${this.gamesPlayedCount}/${AD_CONFIG.defaultGamesUntilInterstitial})`);
    return this.gamesPlayedCount;
  }

  public shouldShowInterstitial(): boolean {
    return (
      this.gamesPlayedCount > 0 &&
      this.gamesPlayedCount % AD_CONFIG.defaultGamesUntilInterstitial === 0
    );
  }

  public resetInterstitialCounter(): void {
    this.gamesPlayedCount = 0;
  }

  // Safety cleanup for ad loading states
  private clearAdTimeout(): void {
    if (this.adTimeoutTimer) {
      clearTimeout(this.adTimeoutTimer);
      this.adTimeoutTimer = null;
    }
  }

  // Show Rewarded Ad (Second Chance / Coin bonus)
  public async showRewardedAd(
    onRewardConfirmed: () => void, 
    onError?: (errCode: AdErrorCode) => void
  ): Promise<void> {
    console.log('[ADS] Solicitando Rewarded Ad:', AD_CONFIG.rewardedAdUnitId);

    if (this.isAdLoading) {
      console.warn('[ADS] Anúncio já está carregando ou em exibição.');
      if (onError) onError('loading');
      return;
    }

    this.isAdLoading = true;
    let hasGrantedReward = false;

    const safeRewardConfirm = () => {
      this.clearAdTimeout();
      this.isAdLoading = false;
      if (!hasGrantedReward) {
        hasGrantedReward = true;
        console.log('[ADS] Recompensa confirmada e concedida ao jogador.');
        onRewardConfirmed();
      }
    };

    const safeError = (code: AdErrorCode) => {
      this.clearAdTimeout();
      this.isAdLoading = false;
      console.warn('[ADS] Erro no Rewarded Ad (código/mensagem):', code);
      if (onError) {
        onError(code);
      }
    };

    // Failsafe timeout: if native ad bridge hangs, reset after 10 seconds
    this.adTimeoutTimer = setTimeout(() => {
      if (this.isAdLoading) {
        console.warn('[ADS] Timeout de segurança atingido para Rewarded Ad.');
        safeError('timeout');
      }
    }, 10000);

    // Fast-path for offline device
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      console.log('[ADS] Modo offline ativo: anúncio recompensado não disponível.');
      safeError('offline');
      return;
    }

    try {
      const win = typeof window !== 'undefined' ? (window as any) : {};

      // 1. Android Native Bridge (Wall Drop Android APK via WebAppInterface)
      if (win.AndroidBridge && typeof win.AndroidBridge.showRewardedAd === 'function') {
        console.log('[ADS] Chamando AndroidBridge.showRewardedAd nativo');
        const cbName = `__admob_reward_cb_${Date.now()}`;
        win[cbName] = (success: boolean) => {
          try {
            delete win[cbName];
          } catch (_) {
            win[cbName] = undefined;
          }
          if (success) {
            safeRewardConfirm();
          } else {
            safeError('not_finished');
          }
        };
        win.AndroidBridge.showRewardedAd(cbName);
        return;
      }

      // 2. Google Mobile Ads AdMob Bridge / Custom Native Handler
      if (typeof win.showGoogleAdMobRewarded === 'function') {
        console.log('[ADS] Chamando SDK Native Google Mobile Ads (Rewarded)');
        try {
          win.showGoogleAdMobRewarded(
            AD_CONFIG.rewardedAdUnitId, 
            (success: boolean, errDetails?: string) => {
              if (success !== false) {
                safeRewardConfirm();
              } else {
                console.warn('[ADS] Callback retornou insucesso:', errDetails);
                safeError(errDetails || 'not_finished');
              }
            }
          );
        } catch (callErr) {
          console.error('[ADS] Erro ao invocar win.showGoogleAdMobRewarded:', callErr);
          safeError('unavailable');
        }
        return;
      }

      // 3. Capacitor AdMob Plugin Bridge
      if (win.Capacitor?.Plugins?.AdMob) {
        const AdMobPlugin = win.Capacitor.Plugins.AdMob;
        console.log('[ADS] Chamando Capacitor AdMob Plugin');

        let rewardListener: any = null;
        let failListener: any = null;

        const cleanupListeners = () => {
          try {
            if (rewardListener?.remove) rewardListener.remove();
            if (failListener?.remove) failListener.remove();
          } catch (e) {
            console.warn('[ADS] Erro ao remover listeners do Capacitor:', e);
          }
        };

        if (typeof AdMobPlugin.addListener === 'function') {
          rewardListener = await AdMobPlugin.addListener('onRewardVideoReward', () => {
            console.log('[ADS] Evento onRewardVideoReward disparado');
            cleanupListeners();
            safeRewardConfirm();
          });

          failListener = await AdMobPlugin.addListener('onRewardVideoFailedToLoad', (err: any) => {
            console.warn('[ADS] Evento onRewardVideoFailedToLoad:', err);
            cleanupListeners();
            safeError('unavailable');
          });
        }

        if (typeof AdMobPlugin.showRewarded === 'function') {
          await AdMobPlugin.showRewarded({ adId: AD_CONFIG.rewardedAdUnitId });
          if (!rewardListener) {
            safeRewardConfirm();
          }
        } else {
          safeError('unavailable');
        }
        return;
      }

      // 4. Web Preview / Browser Fallback simulation (100% reliable reward delivery)
      console.log('[ADS] Web / Fallback mode active. Concedendo recompensa com 100% de estabilidade.');
      setTimeout(() => {
        safeRewardConfirm();
      }, 400);

    } catch (e) {
      console.error('[ADS] Exceção capturada em showRewardedAd:', e);
      safeError('unavailable');
    }
  }

  // Show Interstitial Ad (Natural game transitions, e.g. every 3 games)
  public async showInterstitialAd(onAdClosed: () => void, force: boolean = false): Promise<void> {
    if (!force && !this.shouldShowInterstitial()) {
      console.log('[ADS] Interstitial ignorado devido ao limite de frequência (Frequency Capping).');
      onAdClosed();
      return;
    }

    console.log('[ADS] Solicitando Interstitial Ad:', AD_CONFIG.interstitialAdUnitId);

    let hasClosed = false;
    const safeClose = () => {
      this.clearAdTimeout();
      this.isAdLoading = false;
      if (!hasClosed) {
        hasClosed = true;
        console.log('[ADS] Interstitial concluído / fechado.');
        onAdClosed();
      }
    };

    this.isAdLoading = true;

    // Failsafe timeout: 8s for interstitial
    this.adTimeoutTimer = setTimeout(() => {
      if (this.isAdLoading) {
        console.warn('[ADS] Timeout de segurança para Interstitial Ad.');
        safeClose();
      }
    }, 8000);

    // Fast-path for offline device
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      console.log('[ADS] Modo offline ativo: pulando interstitial instantaneamente.');
      safeClose();
      return;
    }

    try {
      const win = typeof window !== 'undefined' ? (window as any) : {};

      // 1. Android Native Bridge (Wall Drop Android APK via WebAppInterface)
      if (win.AndroidBridge && typeof win.AndroidBridge.showInterstitial === 'function') {
        console.log('[ADS] Chamando AndroidBridge.showInterstitial nativo');
        win.AndroidBridge.showInterstitial();
        safeClose();
        return;
      }

      // 2. Google Mobile Ads AdMob Bridge / Custom Native Handler
      if (typeof win.showGoogleAdMobInterstitial === 'function') {
        console.log('[ADS] Chamando SDK Native Google Mobile Ads (Interstitial)');
        try {
          win.showGoogleAdMobInterstitial(AD_CONFIG.interstitialAdUnitId, () => {
            safeClose();
          });
        } catch (err) {
          console.warn('[ADS] Erro na chamada do Interstitial Native:', err);
          safeClose();
        }
        return;
      }

      // 3. Capacitor AdMob Plugin Bridge
      if (win.Capacitor?.Plugins?.AdMob?.showInterstitial) {
        console.log('[ADS] Chamando Capacitor AdMob Plugin (Interstitial)');
        try {
          await win.Capacitor.Plugins.AdMob.showInterstitial({
            adId: AD_CONFIG.interstitialAdUnitId,
          });
        } catch (e) {
          console.warn('[ADS] Erro do plugin Capacitor Interstitial:', e);
        }
        safeClose();
        return;
      }

      // 4. Web Preview Fallback
      console.log('[ADS] Web Preview detectado. Transição sem bloqueio.');
      safeClose();

    } catch (e) {
      console.warn('[ADS] Exceção capturada no Interstitial Ad:', e);
      safeClose();
    }
  }

  // Force test execution for diagnostic / QA verification
  public forceTestAd(type: 'interstitial' | 'rewarded', onResult?: (success: boolean) => void) {
    if (type === 'rewarded') {
      this.showRewardedAd(
        () => onResult?.(true),
        () => onResult?.(false)
      );
    } else {
      this.showInterstitialAd(() => onResult?.(true), true);
    }
  }
}

export const adService = new AdService();
