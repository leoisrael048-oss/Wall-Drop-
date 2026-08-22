import React, { useState } from 'react';
import { User, Globe, ArrowRight, Play, Check, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GameSettings, Language } from '../types';
import { audio } from '../utils/audio';
import { narratorService } from '../services/narratorService';
import { getLanguageFlag, getLanguageName } from '../utils/i18n';

interface OnboardingModalProps {
  settings: GameSettings;
  onComplete: (name: string, lang: Language) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  settings,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLang, setSelectedLang] = useState<Language>(settings?.language || 'pt');
  const [nameInput, setNameInput] = useState(settings?.playerName || '');

  const availableLanguages: Language[] = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh'];

  const step1Titles: Record<Language, { title: string; subtitle: string; nextBtn: string }> = {
    pt: {
      title: 'SELECIONE O IDIOMA DO JOGO',
      subtitle: 'O jogo e a voz do narrador usarão este idioma.',
      nextBtn: 'CONTINUAR',
    },
    en: {
      title: 'SELECT GAME LANGUAGE',
      subtitle: 'The game and narrator voice will use this language.',
      nextBtn: 'CONTINUE',
    },
    es: {
      title: 'SELECCIONA EL IDIOMA DEL JUEGO',
      subtitle: 'El juego y la voz del narrador usarán este idioma.',
      nextBtn: 'CONTINUAR',
    },
    fr: {
      title: 'SÉLECTIONNEZ LA LANGUE DU JEU',
      subtitle: 'Le jeu et la voix du narrateur utiliseront cette langue.',
      nextBtn: 'CONTINUER',
    },
    de: {
      title: 'WÄHLE DIE SPIELSPRACHE',
      subtitle: 'Das Spiel und die Erzählerstimme nutzen diese Sprache.',
      nextBtn: 'WEITER',
    },
    it: {
      title: 'SELEZIONA LA LINGUA DEL GIOCO',
      subtitle: 'Il gioco e la voce del narratore useranno questa lingua.',
      nextBtn: 'CONTINUA',
    },
    ja: {
      title: 'ゲームの言語を選択',
      subtitle: 'ゲームとナレーターの音声にこの言語が使用されます。',
      nextBtn: '次へ',
    },
    zh: {
      title: '选择游戏语言',
      subtitle: '游戏和解说员语音将使用此语言。',
      nextBtn: '继续',
    },
  };

  const step2Titles: Record<Language, { title: string; subtitle: string; placeholder: string; testVoiceBtn: string; confirmBtn: string }> = {
    pt: {
      title: 'COMO DEVEMOS TE CHAMAR?',
      subtitle: 'O narrador usará seu nome para interagir com você.',
      placeholder: 'Digite seu nome...',
      testVoiceBtn: 'TESTAR VOZ',
      confirmBtn: 'CONFIRMAR E COMEÇAR',
    },
    en: {
      title: 'WHAT SHOULD WE CALL YOU?',
      subtitle: 'The narrator will use your name during the game.',
      placeholder: 'Enter your name...',
      testVoiceBtn: 'TEST VOICE',
      confirmBtn: 'CONFIRM & START',
    },
    es: {
      title: '¿CÓMO DEBEMOS LLAMARTE?',
      subtitle: 'El narrador usará tu nombre durante el juego.',
      placeholder: 'Escribe tu nombre...',
      testVoiceBtn: 'PROBAR VOZ',
      confirmBtn: 'CONFIRMAR Y EMPEZAR',
    },
    fr: {
      title: 'COMMENT DEVONS-NOUS VOUS APPELER ?',
      subtitle: 'Le narrateur utilisera votre nom durant la partie.',
      placeholder: 'Entrez votre nom...',
      testVoiceBtn: 'TESTER LA VOIX',
      confirmBtn: 'CONFIRMER ET COMMENCER',
    },
    de: {
      title: 'WIE SOLLEN WIR DICH NENNEN?',
      subtitle: 'Der Erzähler wird deinen Namen verwenden.',
      placeholder: 'Gib deinen Namen ein...',
      testVoiceBtn: 'STIMME TESTEN',
      confirmBtn: 'BESTÄTIGEN & STARTEN',
    },
    it: {
      title: 'COME DOBBIAMO CHIAMARTI?',
      subtitle: 'Il narratore userà il tuo nome durante il gioco.',
      placeholder: 'Inserisci il tuo nome...',
      testVoiceBtn: 'PROVA VOCE',
      confirmBtn: 'CONFERMA E INIZIA',
    },
    ja: {
      title: 'なんとお呼びしましょうか？',
      subtitle: 'ナレーターがあなたの名前を呼びます。',
      placeholder: '名前を入力...',
      testVoiceBtn: '声をテスト',
      confirmBtn: '確認してスタート',
    },
    zh: {
      title: '我们该如何称呼您？',
      subtitle: '解说员将在游戏中呼唤您的名字。',
      placeholder: '输入名字...',
      testVoiceBtn: '测试语音',
      confirmBtn: '确认并开始',
    },
  };

  const s1Text = step1Titles[selectedLang] || step1Titles.pt;
  const s2Text = step2Titles[selectedLang] || step2Titles.pt;

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playSfx('click', settings);
    setStep(2);
  };

  const handleTestVoice = () => {
    audio.playSfx('click', settings);
    const nameToTest = nameInput.trim() || 'Léo';
    narratorService.testVoice(nameToTest, selectedLang, {
      ...settings,
      language: selectedLang,
    });
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playSfx('click', settings);
    const finalName = nameInput.trim().slice(0, 20) || 'Léo';
    onComplete(finalName, selectedLang);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Step Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 border border-cyan-500/30 rounded-full text-[11px] font-black text-cyan-400 mb-5 uppercase tracking-widest shadow-inner">
          <span>{step === 1 ? 'PASSO 1 DE 2' : 'PASSO 2 DE 2'}</span>
        </div>

        {/* STEP 1: SELECT LANGUAGE FIRST */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="w-full flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-1 text-purple-400 shadow-md">
              <Globe className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h2 className="text-base font-black text-white tracking-wider mb-1">
                {s1Text.title}
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
                {s1Text.subtitle}
              </p>
            </div>

            {/* 8-Language Grid Selection */}
            <div className="grid grid-cols-4 gap-2 w-full my-2">
              {availableLanguages.map((l) => {
                const isSelected = selectedLang === l;
                return (
                  <motion.button
                    key={l}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      audio.playSfx('click', settings);
                      setSelectedLang(l);
                    }}
                    className={`py-2.5 px-1 rounded-2xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 border transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-lg shadow-purple-500/20 scale-105'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{getLanguageFlag(l)}</span>
                    <span className="uppercase text-[9px] tracking-wider">{l}</span>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-2xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all mt-2"
            >
              <span>{s1Text.nextBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>
        )}

        {/* STEP 2: PLAYER NAME & TEST VOICE */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="w-full flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-1 text-cyan-400 shadow-md">
              <User className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h2 className="text-base font-black text-white tracking-wider mb-1">
                {s2Text.title}
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed px-2">
                {s2Text.subtitle}
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <input
                type="text"
                autoFocus
                maxLength={20}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder={s2Text.placeholder}
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-400 text-white font-bold text-sm text-center rounded-2xl py-3 px-4 outline-none shadow-inner transition-colors"
              />

              {/* TEST VOICE BUTTON */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTestVoice}
                className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-2 transition-all uppercase shadow-sm"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{s2Text.testVoiceBtn}</span>
              </motion.button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-2xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all mt-1"
            >
              <span>{s2Text.confirmBtn}</span>
              <Play className="w-4 h-4 fill-current" />
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};
