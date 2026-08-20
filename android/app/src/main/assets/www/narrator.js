/**
 * WALL DROP - Narrator Engine (narrator.js)
 * Personality: Intense Soccer Commentator with an Eerie / Sinister Obsession
 * Web Speech API with Custom Pitch/Rate modulation & Dynamic Gender Selection
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'walldrop_narrator_settings';

  const defaultSettings = {
    gender: 'male', // 'male' | 'female'
    enabled: true,
    volume: 1.0
  };

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultSettings, ...saved };
    } catch (e) {
      return { ...defaultSettings };
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  const Narrator = {
    settings: loadSettings(),
    voices: [],
    lastDeathIndex: -1,
    lastIncentiveIndex: -1,
    bubbleTimer: null,

    phrases: {
      start: [
        'Autoriza o árbitro do caos! VALEEENDO!',
        'Lá vai ela... descendo para a escuridão!',
        'Começa a descida mais tensa da sua vida!',
        'Rola a gota! Os muros estão famintos hoje...'
      ],
      nearMiss: [
        'Ela... ela vai passar? ELA VAI PASSAAAR!',
        'OLHA O ESPAÇO... RASPOU! QUE TENSÃO MACABRA!',
        'POR UM TRIZ! MEU CORAÇÃO QUASE PAROU!',
        'DE RASPÃO! QUE FRIO NA ESPINHA!',
        'Tocou na alma da parede! QUE DESVIO SOBRENATURAL!',
        'INACREDITÁVEL! Um milímetro separando do fim!'
      ],
      death: [
        'E... ACABOOOU. Mais uma queda. Mais uma... alma perdida na parede.',
        'QUE FINAL TRÁGICO! A gota explodiu... e o silêncio ecoa.',
        'INACREDITÁVEL! Um choque devastador na parede!',
        'FOI DE RASPÃO... DIRETO PRO TÚMULO! QUE CENA!',
        'ACABOU O SONHO! Mais um sacrifício aceito pelos muros.',
        'O muro nem se mexeu... e colheu mais uma vítima!',
        'EXPLODIU EM MIL PEDAÇOS! Um espetáculo de puro horror!',
        'Trágico... absolutamente trágico. Mas eu... eu adorei ver isso.'
      ],
      incentive: [
        'Vai... vai de novo. Eu sei que você quer. Eu SEMPRE sei.',
        'Só mais uma tentativa... Os muros ainda estão com fome!',
        'Não me deixe aqui sozinho no escuro... Aperte o botão!',
        'Você não vai aceitar essa humilhação... RECOMECE AGORA!',
        'Mais uma rodada... Dessa vez a parede não escapa de você!',
        'Eu sinto que a próxima descida vai ser mágica... ou fatal.'
      ],
      record: [
        'MEU DEUS DO CÉU! ISSO NUNCA... NUNCA aconteceu antes!',
        'É HISTÓRICO! É SOBRENATURAL! UM NOVO RECORDE!',
        'EU NÃO ACREDITO NO QUE ESTOU VENDO! QUE MERGULHO LENDÁRIO!',
        'OS DEUSES DA QUEDA LIVRE SE CURVAM DIANTE DE VOCÊ!'
      ],
      combo3: [
        'COMBO TRIPLO! A GOTA ESTÁ POSSUÍDA PELO RITMO!',
        'TRÊS SEGUIDAS! QUE SINCRONIA MACABRA!',
        'FLUINDO NO LIMIAR DA LOUCURA!'
      ],
      combo5: [
        'IMPARÁVEL! ELE TRANSCENDEU A VELOCIDADE DA LUZ!',
        'CINCO SEGUIDAS! QUE ABSURDO! QUE LOUCURA TOTAL!',
        'UMA OBRA-PRIMA DO DESESPERO! INACREDITÁVEL!'
      ]
    },

    init() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        this.updateVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = () => this.updateVoices();
        }
      }
    },

    updateVoices() {
      if (!window.speechSynthesis) return;
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch (e) {
        this.voices = [];
      }
    },

    setVoiceGender(gender) {
      if (gender !== 'male' && gender !== 'female') return;
      this.settings.gender = gender;
      saveSettings(this.settings);
    },

    toggleMute(enabled) {
      this.settings.enabled = typeof enabled === 'boolean' ? enabled : !this.settings.enabled;
      saveSettings(this.settings);
      if (!this.settings.enabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return this.settings.enabled;
    },

    getSettings() {
      return { ...this.settings };
    },

    getBestVoice(gender) {
      if (!this.voices || this.voices.length === 0) {
        this.updateVoices();
      }
      if (!this.voices || this.voices.length === 0) return null;

      // Prefer Portuguese (pt-BR / pt)
      const ptVoices = this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('pt'));
      const pool = ptVoices.length > 0 ? ptVoices : this.voices;

      const isMale = gender === 'male';
      const maleKeywords = ['male', 'homem', 'ricardo', 'felipe', 'lucas', 'daniel', 'hector', 'jorge', 'david', 'pt-br-x-yif', 'pt-br-x-yid'];
      const femaleKeywords = ['female', 'mulher', 'luciana', 'vitória', 'vitoria', 'francisca', 'fernanda', 'leticia', 'maria', 'helena', 'zira', 'pt-br-x-yic'];

      const targetKeywords = isMale ? maleKeywords : femaleKeywords;

      for (const v of pool) {
        const vName = (v.name || '').toLowerCase();
        if (targetKeywords.some(k => vName.includes(k))) {
          return v;
        }
      }

      // Return first language match if keyword search fails
      return pool[0] || null;
    },

    speak(category) {
      const list = this.phrases[category] || this.phrases.start;
      let text = '';

      if (category === 'death') {
        let newIdx;
        do {
          newIdx = Math.floor(Math.random() * list.length);
        } while (list.length > 1 && newIdx === this.lastDeathIndex);
        this.lastDeathIndex = newIdx;
        text = list[newIdx];
      } else if (category === 'incentive') {
        let newIdx;
        do {
          newIdx = Math.floor(Math.random() * list.length);
        } while (list.length > 1 && newIdx === this.lastIncentiveIndex);
        this.lastIncentiveIndex = newIdx;
        text = list[newIdx];
      } else {
        text = list[Math.floor(Math.random() * list.length)];
      }

      // Display floating comic speech bubble in DOM
      this.displayBubble(text);

      // Speak using Web Speech API with sinister soccer commentator modulation
      this.synthesizeVoice(text);

      return text;
    },

    displayBubble(text) {
      const bubble = document.getElementById('narrator-bubble');
      const textEl = document.getElementById('narrator-bubble-text');
      if (bubble && textEl) {
        textEl.textContent = text;
        bubble.classList.add('show');
        clearTimeout(this.bubbleTimer);
        this.bubbleTimer = setTimeout(() => {
          bubble.classList.remove('show');
        }, 2600);
      }
    },

    synthesizeVoice(text) {
      if (!this.settings.enabled || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel(); // Cancel previous utterance immediately

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'pt-BR';

        const voice = this.getBestVoice(this.settings.gender);
        if (voice) {
          utter.voice = voice;
        }

        // Modulation specs:
        // ±10% random jitter for organic tension
        const jitter = (Math.random() - 0.5) * 0.12;

        if (this.settings.gender === 'male') {
          // Male: pitch 0.65 - 0.8, rate 0.85 (deep, sinister, brooding soccer voice)
          utter.pitch = Math.max(0.55, Math.min(0.85, 0.72 + jitter));
          utter.rate = Math.max(0.78, Math.min(0.95, 0.86 + jitter * 0.5));
        } else {
          // Female: pitch 1.15 - 1.3, rate 0.85 (high, eerie, suspenseful soccer voice)
          utter.pitch = Math.max(1.08, Math.min(1.35, 1.22 + jitter));
          utter.rate = Math.max(0.78, Math.min(0.95, 0.86 + jitter * 0.5));
        }

        utter.volume = Math.max(0.1, Math.min(1.0, this.settings.volume || 1.0));

        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    },

    testVoice() {
      const sample = this.phrases.incentive[0]; // "Vai... vai de novo. Eu sei que você quer. Eu SEMPRE sei."
      this.displayBubble(sample);
      this.synthesizeVoice(sample);
    }
  };

  // Auto initialize on load
  Narrator.init();

  // Export to window global
  window.Narrator = Narrator;
  window.setNarratorVoice = (gender) => Narrator.setVoiceGender(gender);
  window.toggleNarratorMute = (enabled) => Narrator.toggleMute(enabled);
})();
