import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mic, Volume2, Sparkles, Flame, Radio, Zap, Cpu, Globe, Lock, Unlock, Coins, CheckCircle2 } from 'lucide-react';
import { GameSettings, Language } from '../types';
import { audio } from '../utils/audio';
import { getLanguageFlag, getLanguageName } from '../utils/i18n';

interface NarratorVicianteModalProps {
  settings: GameSettings;
  coins: number;
  isUnlocked: boolean;
  onUnlock: () => boolean;
  onBack: () => void;
}

interface NarratorCategoryData {
  id: string;
  emoji: string;
  color: string;
  glowColor: string;
  labels: Record<Language, string>;
  phrases: Record<Language, string[]>;
}

const SUPPORTED_LANGS: Language[] = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh'];

const NARRATOR_DATA: NarratorCategoryData[] = [
  {
    id: 'start',
    emoji: '🚀',
    color: '#FF6B6B',
    glowColor: 'rgba(255, 107, 107, 0.6)',
    labels: {
      pt: 'INICIAR QUEDA',
      en: 'START DROP',
      es: 'INICIAR CAÍDA',
      fr: 'LANCER LA DESCENTE',
      de: 'STURZ STARTEN',
      it: 'INIZIA LA CADUTA',
      ja: '落下開始',
      zh: '开始下落',
    },
    phrases: {
      pt: [
        'O ABISMO SE ABRE PARA VOCÊ! SINTA O PODER!',
        'AS PAREDES TREMEM! ELAS SABEM QUE VOCÊ CHEGOU!',
        'A QUEDA NUNCA VIU ALGO ASSIM! VOCÊ É ÚNICO!',
      ],
      en: [
        'THE ABYSS OPENS FOR YOU! FEEL THE POWER!',
        'THE WALLS ARE SHAKING! THEY KNOW YOU HAVE ARRIVED!',
        'THE DROP HAS NEVER SEEN THIS! YOU ARE ONE OF A KIND!',
      ],
      es: [
        '¡EL ABISMO SE ABRE ANTE TI! ¡SIENTE EL PODER!',
        '¡LAS PAREDES TIEMBLAN! ¡SABEN QUE HAS LLEGADO!',
        '¡LA CAÍDA NUNCA VIO ALGO IGUAL! ¡ERES ÚNICO!',
      ],
      fr: [
        "L'ABÎME S'OUVRE POUR VOUS ! RESSENTEZ LA PUISSANCE !",
        'LES MURS TREMBLENT ! ILS SAVENT QUE VOUS ÊTES LÀ !',
        "LA CHUTE N'A JAMAIS VU ÇA ! VOUS ÊTES UNIQUE !",
      ],
      de: [
        'DER ABGRUND ÖFFNET SICH FÜR DICH! SPÜRE DIE MACHT!',
        'DIE WÄNDE ZITTERN! SIE WISSEN, DASS DU DA BIST!',
        'DER STURZ HAT SO ETWAS NOCH NIE GESEHEN! DU BIST EINZIGARTIG!',
      ],
      it: [
        "L'ABISSO SI APRE PER TE! SENTI IL POTERE!",
        'LE PARETI TREMANO! SANNO CHE SEI ARRIVATO!',
        'LA CADUTA NON HA MAI VISTO QUESTO! SEI UNICO!',
      ],
      ja: [
        '奈落が君のために開く！その力を感じろ！',
        '壁が震えている！お前の降臨を知っているのだ！',
        'この落下は前代未聞だ！お前は唯一無二だ！',
      ],
      zh: [
        '深渊为你敞开！感受这无尽的力量！',
        '墙壁在颤抖！它们知道你已经降临！',
        '前所未有的极限下落！你是独一无二的！',
      ],
    },
  },
  {
    id: 'combo10',
    emoji: '💥',
    color: '#FFD93D',
    glowColor: 'rgba(255, 217, 61, 0.6)',
    labels: {
      pt: 'COMBO 10',
      en: 'COMBO 10',
      es: 'COMBO 10',
      fr: 'COMBO 10',
      de: 'COMBO 10',
      it: 'COMBO 10',
      ja: 'コンボ10',
      zh: '10连击',
    },
    phrases: {
      pt: [
        'RECORDE HISTÓRICO! VOCÊ ESCREVEU SEU NOME NAS ESTRELAS!',
        '10 SEGUIDAS! MODO DEMÔNIO!',
        'VOCÊ QUEBROU BARREIRAS! VOCÊ QUEBROU RECORDES!',
      ],
      en: [
        'HISTORIC RECORD! YOU WROTE YOUR NAME IN THE STARS!',
        '10 IN A ROW! BEAST MODE UNLOCKED!',
        'YOU BROKE BARRIERS! YOU SHATTERED ALL RECORDS!',
      ],
      es: [
        '¡RÉCORD HISTÓRICO! ¡ESCRIBISTE TU NOMBRE EN LAS ESTRELLAS!',
        '¡10 SEGUIDAS! ¡MODO DEMONIO ACTIVADO!',
        '¡ROMPISTE BARRERAS! ¡DESTROZASTE TODOS LOS RÉCORDS!',
      ],
      fr: [
        'RECORD HISTORIQUE ! GRAVÉ DANS LES ÉTOILES !',
        '10 D’AFFILÉE ! MODE DÉMON DÉVERROUILLÉ !',
        'VOUS AVEZ BRISÉ TOUTES LES LIMITES ET RECORDS !',
      ],
      de: [
        'HISTORISCHER REKORD! DEIN NAME STEHT IN DEN STERNEN!',
        '10 IN FOLGE! DÄMONEN-MODUS AKTIVIERT!',
        'DU HAST ALLE GRENZEN UND REKORDE GEBROCHEN!',
      ],
      it: [
        'RECORD STORICO! HAI SCRITTO IL TUO NOME NELLE STELLE!',
        '10 DI FILA! MODALITÀ DEMONE!',
        'HAI INFRANTO OGNI LIMITE E RECORD!',
      ],
      ja: [
        '歴史的記録！星々にお前の名を刻んだ！',
        '10連続突破！鬼神モード突入！',
        'すべての限界と記録を粉砕した！',
      ],
      zh: [
        '历史纪录诞生！你的名字已被刻在星空之上！',
        '连续10次通过！恶魔狂暴模式启动！',
        '你粉碎了一切障碍，打破了所有纪录！',
      ],
    },
  },
  {
    id: 'nearMiss',
    emoji: '🥶',
    color: '#6BCB77',
    glowColor: 'rgba(107, 203, 119, 0.6)',
    labels: {
      pt: 'QUASE MORREU',
      en: 'NEAR MISS',
      es: 'CASI MUERTO',
      fr: 'FRÔLÉ LA MORT',
      de: 'KNAPP ENTKOMMEN',
      it: 'QUASI MORTO',
      ja: '危機一髪',
      zh: '极限逃生',
    },
    phrases: {
      pt: [
        'A PAREDE SENTIU O IMPACTO DA SUA ALMA!',
        'VOCÊ ENCONTROU O ABISMO... E O ABISMO RECUOU!',
        'POR UM MILÍMETRO VOCÊ ESCAPOU DA MORTE!',
      ],
      en: [
        'THE WALL FELT THE IMPACT OF YOUR SOUL!',
        'YOU MET THE ABYSS... AND THE ABYSS BACKED DOWN!',
        'BY A FRACTION OF A MILLIMETER, YOU ESCAPED DEATH!',
      ],
      es: [
        '¡LA PARED SINTIÓ EL IMPACTO DE TU ALMA!',
        '¡MIRASTE AL ABISMO... Y EL ABISMO RETROCEDIÓ!',
        '¡POR UN MILÍMETRO ESCAPASTE DE LA MUERTE!',
      ],
      fr: [
        "LE MUR A SENTI L'IMPACT DE VOTRE ÂME !",
        "VOUS AVEZ DÉFIÉ L'ABÎME... ET L'ABÎME A RECULÉ !",
        "À UN MILLIMÈTRE PRÈS, VOUS ÉCHAPPEZ À LA MORT !",
      ],
      de: [
        'DIE WAND HAT DEINE SEELE GESPÜRT!',
        'DU TRATST DEM ABGRUND GEGENÜBER... UND ER WEICHT ZURÜCK!',
        'UM EINEN MILLIMETER DEM TOD ENTKOMMEN!',
      ],
      it: [
        "LA PARETE HA SENTITO L'IMPATTO DELLA TUA ANIMA!",
        "HAI AFFRONTATO L'ABISSO... E L'ABISSO È ARRETRATO!",
        'PER UN MILLIMETRO SEI SFUGGITO ALLA MORTE!',
      ],
      ja: [
        '壁がお前の魂の衝撃を感じた！',
        '奈落と対峙し…奈落が後退した！',
        'わずか1ミリで死神を振り切った！',
      ],
      zh: [
        '墙壁感受到了你灵魂的震撼！',
        '你直视深渊……深渊退缩了！',
        '毫厘之间，你与死神擦肩而过！',
      ],
    },
  },
  {
    id: 'defeat',
    emoji: '💀',
    color: '#4D96FF',
    glowColor: 'rgba(77, 150, 255, 0.6)',
    labels: {
      pt: 'DERROTA',
      en: 'DEFEAT',
      es: 'DERROTA',
      fr: 'DÉFAITE',
      de: 'NIEDERLAGE',
      it: 'SCONFITTA',
      ja: '敗北',
      zh: '战败重生',
    },
    phrases: {
      pt: [
        'VOCÊ CAIU, MAS LEVANTOU MAIS FORTE QUE NUNCA!',
        'A PAREDE PENSOU QUE TE TINHA... MAS VOCÊ É INDESTRUTÍVEL!',
        'RESSURREIÇÃO ÉPICA! O ABISMO NUNCA VIU ALGO ASSIM!',
      ],
      en: [
        'YOU FELL, BUT YOU RISE STRONGER THAN EVER!',
        "THE WALL THOUGHT IT HAD YOU... BUT YOU'RE UNBREAKABLE!",
        'EPIC RESURRECTION! THE ABYSS HAS NEVER WITNESSED THIS!',
      ],
      es: [
        '¡CAÍSTE, PERO TE LEVANTAS MÁS FUERTE QUE NUNCA!',
        '¡LA PARED CREYÓ QUE TE TENÍA... PERO ERES INDESTRUCTIBLE!',
        '¡RESURRECCIÓN ÉPICA! ¡EL ABISMO NUNCA VIO ALGO ASÍ!',
      ],
      fr: [
        'VOUS ÊTES TOMBÉ, MAIS VOUS VOUS RELEVEZ PLUS FORT !',
        'LE MUR PENSAIT VOUS TENIR... VOUS ÊTES INDESTRUCTIBLE !',
        "RÉSURRECTION ÉPIQUE ! DU JAMAIS VU DANS L'ABÎME !",
      ],
      de: [
        'DU BIST GEFALLEN, ABER DU STEHST STÄRKER AUF!',
        'DIE WAND DACHTE SIE HAT DICH... ABER DU BIST UNZERSTÖRBAR!',
        'EPISCHE WIEDERAUFERSTEHUNG IM ABGRUND!',
      ],
      it: [
        'SEI CADUTO, MA TI RIALZI PIÙ FORTE CHE MAI!',
        'LA PARETE CREDEVA DI AVERTI... MA SEI INDISTRUTTIBILE!',
        "RESURREZIONE EPICA! L'ABISSO NON HA MAI VISTO QUESTO!",
      ],
      ja: [
        '倒れても、前より強く立ち上がる！',
        '壁はお前を捕らえたと思ったが…お前は不滅だ！',
        '奇跡の復活！奈落も見たことがない！',
      ],
      zh: [
        '即使跌倒，你也必将比以往更强大地站起！',
        '墙壁以为战胜了你……但你是不可摧毁的！',
        '史诗级重生！深渊从未见过如此强者！',
      ],
    },
  },
  {
    id: 'ad',
    emoji: '📺',
    color: '#FF6BD6',
    glowColor: 'rgba(255, 107, 214, 0.6)',
    labels: {
      pt: 'ASSISTIR ANÚNCIO',
      en: 'WATCH AD',
      es: 'VER ANUNCIO',
      fr: 'REGARDER PUB',
      de: 'WERBUNG ANSEHEN',
      it: 'GUARDA SPOT',
      ja: '広告視聴',
      zh: '观看广告',
    },
    phrases: {
      pt: [
        'VOCÊ ASSISTIU 1 ANÚNCIO! O ABISMO ESTÁ ORGULHOSO!',
        'CADA ANÚNCIO TE DEIXA MAIS FORTE! QUER CONTINUAR?',
        'VOCÊ É INCANSÁVEL! O NEON TE RECOMPENSA!',
      ],
      en: [
        'YOU WATCHED 1 AD! THE ABYSS IS PROUD OF YOU!',
        'EVERY AD MAKES YOU STRONGER! READY FOR MORE?',
        'YOU ARE RELENTLESS! THE NEON LIGHT REWARDS YOU!',
      ],
      es: [
        '¡VISTE 1 ANUNCIO! ¡EL ABISMO ESTÁ ORGULLOSO!',
        '¡CADA ANUNCIO TE HACE MÁS FUERTE! ¿QUIERES SEGUIR?',
        '¡ERES INCANSABLE! ¡EL NEÓN TE RECOMPENSA!',
      ],
      fr: [
        "PUB REGARDÉE ! L'ABÎME EST FIER DE VOUS !",
        'CHAQUE PUB VOUS REND PLUS FORT ! ON CONTINUE ?',
        'VOUS ÊTES INCASSABLE ! LE NÉON VOUS RÉCOMPENSE !',
      ],
      de: [
        '1 WERBUNG GESEHEN! DER ABGRUND IST STOLZ!',
        'JEDE WERBUNG MACHT DICH STÄRKER! WEITERMACHEN?',
        'DU BIST UNERMÜDLICH! DAS NEON BELOHNT DICH!',
      ],
      it: [
        "HAI VISTO 1 SPOT! L'ABISSO È ORGOGLIOSO!",
        'OGNI PUBBLICITÀ TI RENDE PIÙ FORTE! CONTINUIAMO?',
        'SEI INSTANCABILE! IL NEON TI RICOMPENSA!',
      ],
      ja: [
        '広告視聴完了！奈落はお前を讃える！',
        '広告を見るたび強くなる！まだ行くか？',
        '不屈の闘志！ネオンの光がお前に応える！',
      ],
      zh: [
        '观看广告完成！深渊为你感到自豪！',
        '每次观看都让你更强大！要继续吗？',
        '永不放弃！霓虹之光将奖赏你的坚韧！',
      ],
    },
  },
  {
    id: 'record',
    emoji: '🏆',
    color: '#FFB347',
    glowColor: 'rgba(255, 179, 71, 0.6)',
    labels: {
      pt: 'RECORDE MUNDIAL',
      en: 'WORLD RECORD',
      es: 'RÉCORD MUNDIAL',
      fr: 'RECORD MONDIAL',
      de: 'WELTREKORD',
      it: 'RECORD MONDIALE',
      ja: '世界記録',
      zh: '世界纪录',
    },
    phrases: {
      pt: [
        'NOVO RECORDE ABSOLUTO! VOCÊ É LENDÁRIO!',
        'O MUNDO É SEU! QUE BRILHO ESPETACULAR!',
        'NOME GRAVADO NA ETERNIDADE COM BRILHO NEON!',
      ],
      en: [
        'NEW ABSOLUTE RECORD! YOU ARE A LIVING LEGEND!',
        'THE WORLD IS YOURS! WHAT A SPECTACULAR SHINE!',
        'NAME ENGRAVED IN ETERNITY WITH NEON GLOW!',
      ],
      es: [
        '¡NUEVO RÉCORD ABSOLUTO! ¡ERES UNA LEYENDA!',
        '¡EL MUNDO ES TUYO! ¡QUÉ BRILLO TAN ESPECTACULAR!',
        '¡NOMBRE GRABADO EN LA ETERNIDAD CON BRILLO NEÓN!',
      ],
      fr: [
        'NOUVEAU RECORD MONDIAL ! VOUS ÊTES LÉGENDAIRE !',
        'LE MONDE EST À VOUS ! QUEL ÉCLAT SPECTACULAIRE !',
        "NOM GRAVÉ DANS L'ÉTERNITÉ DE NÉON !",
      ],
      de: [
        'NEUER WELTREKORD! DU BIST EINE LEGENDE!',
        'DIE WELT GEHÖRT DIR! WAS FÜR EIN GLANZ!',
        'NAME FÜR DIE EWIGKEIT IN NEON GRAVIERT!',
      ],
      it: [
        'NUOVO RECORD ASSOLUTO! SEI UNA LEGGENDA!',
        'IL MONDO È TUO! CHE SPLENDORE SPETTACOLARE!',
        "NOME INCISO NELL'ETERNITÀ CON LUCE NEON!",
      ],
      ja: [
        '新世界記録達成！お前は伝説の存在だ！',
        '世界はお前のものだ！目も眩む輝き！',
        'ネオンの光と共に永遠に刻まれる名！',
      ],
      zh: [
        '全新世界纪录！你就是活着的传奇！',
        '世界属于你！何等耀眼的霓虹光芒！',
        '你的名字将在霓虹光辉中永垂不朽！',
      ],
    },
  },
  {
    id: 'frenzy',
    emoji: '⚡',
    color: '#A66CFF',
    glowColor: 'rgba(166, 108, 255, 0.6)',
    labels: {
      pt: 'MODO FRENESI',
      en: 'FRENZY MODE',
      es: 'MODO FRENESÍ',
      fr: 'MODE FRÉNÉSIE',
      de: 'RASEREI-MODUS',
      it: 'MODALITÀ FURIA',
      ja: '狂乱モード',
      zh: '狂暴模式',
    },
    phrases: {
      pt: [
        'MODO FRENESI ATIVADO! TUDO VALE DOBRADO!',
        'OVERDRIVE TOTAL! BRILHO MÁXIMO NO ABISMO!',
        'NÍVEL DEMONÍACO DE VELOCIDADE!',
      ],
      en: [
        'FRENZY MODE ACTIVATED! EVERYTHING COUNTS DOUBLE!',
        'TOTAL OVERDRIVE! MAXIMUM GLOW IN THE ABYSS!',
        'DEMONIC LEVEL OF VELOCITY AND POWER!',
      ],
      es: [
        '¡MODO FRENESÍ ACTIVADO! ¡TODO VALE EL DOBLE!',
        '¡OVERDRIVE TOTAL! ¡MÁXIMO BRILLO EN EL ABISMO!',
        '¡NIVEL DEMONÍACO DE PURA VELOCIDAD!',
      ],
      fr: [
        'MODE FRÉNÉSIE ACTIVÉ ! TOUT VAUT DOUBLE !',
        "OVERDRIVE TOTAL ! PUISSANCE MAXIMALE DANS L'ABÎME !",
        'VITESSE DÉMONIAQUE SANS LIMITES !',
      ],
      de: [
        'RASEREI-MODUS AKTIV! ALLES ZÄHLT DOPPELT!',
        'TOTALER OVERDRIVE! MAXIMALES LEUCHTEN!',
        'DÄMONISCHE GESCHWINDIGKEIT ERREICHT!',
      ],
      it: [
        'MODALITÀ FURIA ATTIVA! TUTTO VALE IL DOPPIO!',
        "OVERDRIVE TOTALE! MASSIMA LUCE NELL'ABISSO!",
        'LIVELLO DEMONIACO DI VELOCITÀ!',
      ],
      ja: [
        '狂乱モード起動！すべてが倍加する！',
        'オーバードライブ全開！深淵の極限発光！',
        '神速を超えた悪魔的スピード！',
      ],
      zh: [
        '狂暴模式启动！所有得分与奖励翻倍！',
        '全面超载！深渊之中的极致光芒！',
        '超越极限的魔鬼般速度！',
      ],
    },
  },
  {
    id: 'challenge',
    emoji: '🎯',
    color: '#00D2FF',
    glowColor: 'rgba(0, 210, 255, 0.6)',
    labels: {
      pt: 'DESAFIO ÉPICO',
      en: 'EPIC CHALLENGE',
      es: 'DESAFÍO ÉPICO',
      fr: 'DÉFI ÉPIQUE',
      de: 'EPISCHE PRÜFUNG',
      it: 'SFIDA EPICA',
      ja: '究極の挑戦',
      zh: '史诗挑战',
    },
    phrases: {
      pt: [
        'O ABISMO TE DESAFIA! MOSTRA DO QUE É CAPAZ!',
        'VOCÊ TEM O PODER DE REESCREVER A HISTÓRIA!',
        'NINGUÉM NUNCA FEZ ISSO ANTES! VOCÊ É HISTÓRIA!',
      ],
      en: [
        'THE ABYSS CHALLENGES YOU! SHOW WHAT YOU GOT!',
        'YOU HAVE THE POWER TO REWRITE HISTORY!',
        'NO ONE HAS EVER DONE THIS BEFORE! YOU ARE LEGENDARY!',
      ],
      es: [
        '¡EL ABISMO TE DESAFÍA! ¡MUESTRA DE QUÉ ERES CAPAZ!',
        '¡TIENES EL PODER DE REESCRIBIR LA HISTORIA!',
        '¡NADIE HA LOGRADO ESTO ANTES! ¡ERES PURA HISTORIA!',
      ],
      fr: [
        'L’ABÎME VOUS DÉFIE ! MONTREZ VOTRE VRAIE FORCE !',
        'VOUS AVEZ LE POUVOIR DE RÉÉCRIRE L’HISTOIRE !',
        'PERSONNE N’A FAIT ÇA AVANT ! VOUS ÊTES UNE LÉGENDE !',
      ],
      de: [
        'DER ABGRUND FORDERT DICH HERAUS! ZEIG DEINE MACHT!',
        'DU KANNST DIE GESCHICHTE NEU SCHREIBEN!',
        'DAS HAT NOCH NIE JEMAND GESCHAFFT! DU BIST GESCHICHTE!',
      ],
      it: [
        "L'ABISSO TI SFIDA! MOSTRA DI COSA SEI CAPACE!",
        'HAI IL POTERE DI RISCRIVERE LA STORIA!',
        'NESSUNO CI È MAI RIUSCITO PRIMA! SEI STORIA!',
      ],
      ja: [
        '奈落がお前を試す！真の力を見せてみろ！',
        'お前には歴史を塗り替える力がある！',
        '前人未到の領域！お前が伝説だ！',
      ],
      zh: [
        '深渊向你发起挑战！展现你的真正实力！',
        '你拥有重写历史的无上力量！',
        '前无古人！你就是奇迹本身！',
      ],
    },
  },
];

const CINEMATIC_LOGS_BY_LANG: Record<Language, string[]> = {
  pt: [
    'SINTONIZANDO FREQUÊNCIA QUÂNTICA...',
    'DECODIFICANDO DIRETIVA NEON...',
    'CALIBRANDO ENERGIA DO ABISMO...',
    'DESBLOQUEANDO SÍNTESE VOCAL...',
    'TRANSMISSÃO HOLOGRÁFICA PRONTA!',
  ],
  en: [
    'TUNING QUANTUM FREQUENCY...',
    'DECODING NEON DIRECTIVE...',
    'CALIBRATING ABYSS ENERGY...',
    'UNLOCKING VOICE SYNTHESIS...',
    'HOLOGRAPHIC BROADCAST READY!',
  ],
  es: [
    'SINTONIZANDO FRECUENCIA CUÁNTICA...',
    'DECODIFICANDO DIRECTIVA NEÓN...',
    'CALIBRANDO ENERGÍA DEL ABISMO...',
    'DESBLOQUEANDO SÍNTESIS VOCAL...',
    '¡TRANSMISIÓN HOLOGRÁFICA LISTA!',
  ],
  fr: [
    'SYNTONISATION QUANTIQUE...',
    'DÉCODAGE DIRECTIVE NÉON...',
    'CALIBRAGE ÉNERGIE DE L’ABÎME...',
    'SYNTHÈSE VOCALE PRÊTE...',
    'DIFFUSION HOLOGRAPHIQUE ACTIVÉE !',
  ],
  de: [
    'QUANTENFREQUENZ WIRD ABGESTIMMT...',
    'NEON-DIREKTIVE WIRD DEKODIERT...',
    'ABGRUND-ENERGIE WIRD KALIBRIERT...',
    'SPRACHSYNTHESE FREIGESCHALTET...',
    'HOLOGRAFISCHE ÜBERTRAGUNG BEREIT!',
  ],
  it: [
    'SINTONIZZAZIONE FREQUENZA QUANTICA...',
    'DECODIFICA DIRETTIVA NEON...',
    'CALIBRAZIONE ENERGIA DELL’ABISSO...',
    'SINTESI VOCALE SBLOCCATA...',
    'TRASMISSIONE OLOGRAFICA PRONTA!',
  ],
  ja: [
    '量子周波数を同調中...',
    'ネオン指令をデコード中...',
    '奈落のエネルギーを較正中...',
    '音声合成エンジンを解除中...',
    'ホログラフィック通信準備完了！',
  ],
  zh: [
    '正在调谐量子频率……',
    '正在解码霓虹指令……',
    '正在校准深渊能量……',
    '正在解锁语音合成……',
    '全息广播准备就绪！',
  ],
};

const UI_TEXT_BY_LANG: Record<Language, {
  title: string;
  subtitle: string;
  defaultText: string;
  processorTitle: string;
  initSynthesis: string;
  narrating: string;
  heardCount: string;
  addictionLevel: string;
  statusLevels: [string, string, string, string];
  back: string;
  lockedTitle: string;
  lockedDesc: string;
  unlockBtn: string;
  needMoreCoins: string;
  unlockedSuccess: string;
  vipBadge: string;
}> = {
  pt: {
    title: '🎙️ NARRADOR VICIANTE',
    subtitle: '🔥 O ABISMO TE CHAMA...',
    defaultText: 'CLIQUE EM UM BOTÃO ABAIXO PARA OUVIR O NARRADOR...',
    processorTitle: 'PROCESSADOR CINEMATOGRÁFICO DE VOZ',
    initSynthesis: 'INICIALIZANDO SINTETIZADOR',
    narrating: 'NARRANDO...',
    heardCount: 'FRASES OUVIDAS:',
    addictionLevel: 'NÍVEL DE VÍCIO:',
    statusLevels: ['INICIANTE HIPNOTIZADO', 'DEPENDENTE DO ABISMO', 'VICIADO EXTREMO', 'POSSUÍDO PELO NEON 🔥'],
    back: 'VOLTAR',
    lockedTitle: '🎙️ DESBLOQUEAR NARRADOR VIP',
    lockedDesc: 'Desbloqueie acesso vitalício a 8 idiomas, comentários em tempo real e 24+ falas gravadas em voz grave ultra-viciante!',
    unlockBtn: 'DESBLOQUEAR POR 3.000 🪙',
    needMoreCoins: 'MOEDAS INSUFICIENTES (PRECISA DE 3.000 🪙)',
    unlockedSuccess: '🎉 NARRADOR VIP DESBLOQUEADO COM SUCESSO!',
    vipBadge: 'VIP EXCLUSIVO',
  },
  en: {
    title: '🎙️ ADDICTIVE NARRATOR',
    subtitle: '🔥 THE ABYSS CALLS YOU...',
    defaultText: 'CLICK A BUTTON BELOW TO HEAR THE NARRATOR...',
    processorTitle: 'CINEMATIC VOICE PROCESSOR',
    initSynthesis: 'INITIALIZING SYNTHESIZER',
    narrating: 'NARRATING...',
    heardCount: 'PHRASES HEARD:',
    addictionLevel: 'ADDICTION LEVEL:',
    statusLevels: ['HYPNOTIZED NOVICE', 'ABYSS DEPENDENT', 'EXTREME ADDICT', 'NEON POSSESSED 🔥'],
    back: 'BACK',
    lockedTitle: '🎙️ UNLOCK VIP NARRATOR',
    lockedDesc: 'Unlock lifetime access to 8 languages, live commentary, and 24+ ultra-addictive deep male voice voiceovers!',
    unlockBtn: 'UNLOCK FOR 3,000 🪙',
    needMoreCoins: 'NOT ENOUGH COINS (NEED 3,000 🪙)',
    unlockedSuccess: '🎉 VIP NARRATOR SUCCESSFULLY UNLOCKED!',
    vipBadge: 'EXCLUSIVE VIP',
  },
  es: {
    title: '🎙️ NARRADOR ADICTIVO',
    subtitle: '🔥 EL ABISMO TE LLAMA...',
    defaultText: 'HAZ CLIC EN UN BOTÓN PARA ESCUCHAR AL NARRADOR...',
    processorTitle: 'PROCESADOR CINEMATOGRÁFICO DE VOZ',
    initSynthesis: 'INICIALIZANDO SINTETIZADOR',
    narrating: 'NARRANDO...',
    heardCount: 'FRASES ESCUCHADAS:',
    addictionLevel: 'NIVEL DE ADICCIÓN:',
    statusLevels: ['PRINCIPIANTE HIPNOTIZADO', 'DEPENDIENTE DEL ABISMO', 'ADICTO EXTREMO', 'POSEÍDO POR EL NEÓN 🔥'],
    back: 'VOLVER',
    lockedTitle: '🎙️ DESBLOQUEAR NARRADOR VIP',
    lockedDesc: '¡Desbloquea acceso vitalicio a 8 idiomas, comentarios épicos y más de 24 frases ultra-adictivas!',
    unlockBtn: 'DESBLOQUEAR POR 3.000 🪙',
    needMoreCoins: 'MONEDAS INSUFICIENTES (NECESITAS 3.000 🪙)',
    unlockedSuccess: '¡🎉 NARRADOR VIP DESBLOQUEADO CON ÉXITO!',
    vipBadge: 'VIP EXCLUSIVO',
  },
  fr: {
    title: '🎙️ NARRATEUR ADDICTIF',
    subtitle: '🔥 L’ABÎME VOUS APPELLE...',
    defaultText: 'CLIQUEZ SUR UN BOUTON CI-DESSOUS POUR ÉCOUTER...',
    processorTitle: 'PROCESSEUR CINÉMATIQUE VOCAL',
    initSynthesis: 'INITIALISATION SYNTHÉTISEUR',
    narrating: 'EN DIRECT...',
    heardCount: 'PHRASES ÉCOUTÉES :',
    addictionLevel: 'NIVEAU D’ADDICTION :',
    statusLevels: ['DÉBUTANT HYPNOTISÉ', 'DÉPENDANT DE L’ABÎME', 'ADDICTE EXTRÊME', 'POSSÉDÉ PAR LE NÉON 🔥'],
    back: 'RETOUR',
    lockedTitle: '🎙️ DÉBLOQUER LE NARRATEUR VIP',
    lockedDesc: 'Débloquez l’accès à vie à 8 langues, commentaires épiques et plus de 24 répliques vocales addictives !',
    unlockBtn: 'DÉBLOQUER POUR 3 000 🪙',
    needMoreCoins: 'PIÈCES INSUFFISANTES (3 000 🪙 REQUISES)',
    unlockedSuccess: '🎉 NARRATEUR VIP DÉBLOQUÉ AVEC SUCCÈS !',
    vipBadge: 'VIP EXCLUSIF',
  },
  de: {
    title: '🎙️ SÜCHTIG-MACHER ERZÄHLER',
    subtitle: '🔥 DER ABGRUND RUFT DICH...',
    defaultText: 'KLICKE AUF EINEN BUTTON, UM DEN ERZÄHLER ZU HÖREN...',
    processorTitle: 'KINOMATISCHER SPRACHPROZESSOR',
    initSynthesis: 'SYNTHESIZER WIRD INITIALISIERT',
    narrating: 'ERZÄHLUNG LÄUFT...',
    heardCount: 'GEHÖRTE SÄTZE:',
    addictionLevel: 'SUCHT-LEVEL:',
    statusLevels: ['HYPNOTISIERTER ANFÄNGER', 'ABGRUND-ABHÄNGIG', 'EXTREM SÜCHTIG', 'VOM NEON BESESSEN 🔥'],
    back: 'ZURÜCK',
    lockedTitle: '🎙️ VIP-ERZÄHLER FREISCHALTEN',
    lockedDesc: 'Schalte lebenslangen Zugriff auf 8 Sprachen, epische Live-Kommentare und 24+ süchtig machende Sprüche frei!',
    unlockBtn: 'FÜR 3.000 🪙 FREISCHALTEN',
    needMoreCoins: 'NICHT GENUG MÜNZEN (3.000 🪙 BENÖTIGT)',
    unlockedSuccess: '🎉 VIP-ERZÄHLER ERFOLGREICH FREIGESCHALTET!',
    vipBadge: 'EXKLUSIVES VIP',
  },
  it: {
    title: '🎙️ NARRATORE ADRENALINICO',
    subtitle: '🔥 L’ABISSO TI CHIAMA...',
    defaultText: 'CLICCA SU UN PULSANTE QUI SOTTO PER ASCOLTARE...',
    processorTitle: 'PROCESSORE VOCALE CINEMATOGRAFICO',
    initSynthesis: 'INIZIALIZZAZIONE SINTETIZZATORE',
    narrating: 'IN VOCE...',
    heardCount: 'FRASI ASCOLTATE:',
    addictionLevel: 'LIVELLO DI DIPENDENZA:',
    statusLevels: ['PRINCIPIANTE IPNOTIZZATO', 'DIPENDENTE DALL’ABISSO', 'SUPER DIPENDENTE', 'POSSEDUTO DAL NEON 🔥'],
    back: 'INDIETRO',
    lockedTitle: '🎙️ SBLOCCA NARRATORE VIP',
    lockedDesc: 'Sblocca accesso a vita a 8 lingue, commenti epici dal vivo e oltre 24 battute travolgenti per 3.000 monete!',
    unlockBtn: 'SBLOCCA PER 3.000 🪙',
    needMoreCoins: 'MONETE INSUFFICIENTI (SERVONO 3.000 🪙)',
    unlockedSuccess: '🎉 NARRATORE VIP SBLOCCATO CON SUCCESSO!',
    vipBadge: 'VIP ESCLUSIVO',
  },
  ja: {
    title: '🎙️ 中毒性神ナレーター',
    subtitle: '🔥 奈落がお前を呼んでいる...',
    defaultText: '下のボタンを押してナレーションを聴け...',
    processorTitle: 'シネマティック音声演算プロセッサ',
    initSynthesis: '音声合成エンジン初期化中',
    narrating: 'ナレーション中...',
    heardCount: '再生回数:',
    addictionLevel: '中毒度:',
    statusLevels: ['催眠初級者', '深淵中毒者', '極限熱狂者', 'ネオンの覇者 🔥'],
    back: '戻る',
    lockedTitle: '🎙️ VIP神ナレーターを解放',
    lockedDesc: '3,000コインで8言語対応の永久アクセス、実況解説、24種類以上の超中毒ボイスをすべて解放！',
    unlockBtn: '3,000 🪙 で解放する',
    needMoreCoins: 'コインが足りません (3,000 🪙 必要)',
    unlockedSuccess: '🎉 VIP神ナレーターの解放に成功しました！',
    vipBadge: '限定 VIP',
  },
  zh: {
    title: '🎙️ 极度上瘾解说员',
    subtitle: '🔥 深渊正在呼唤你……',
    defaultText: '点击下方按钮即可收听专属解说……',
    processorTitle: '电影级量子语音处理器',
    initSynthesis: '正在初始化语音引擎',
    narrating: '解说播报中……',
    heardCount: '已收听金句:',
    addictionLevel: '上瘾等级:',
    statusLevels: ['初级入迷', '深渊依赖', '终极狂热', '霓虹掌控者 🔥'],
    back: '返回',
    lockedTitle: '🎙️ 解锁 VIP 极度上瘾解说员',
    lockedDesc: '仅需 3,000 金币，即可永久解锁全 8 种语言、实时史诗播报及 24+ 条极度上瘾磁性男声语音！',
    unlockBtn: '以 3,000 🪙 解锁',
    needMoreCoins: '金币不足（需要 3,000 🪙）',
    unlockedSuccess: '🎉 VIP 极度上瘾解说员解锁成功！',
    vipBadge: '专属 VIP',
  },
};

export const NarratorVicianteModal: React.FC<NarratorVicianteModalProps> = ({
  settings,
  coins,
  isUnlocked,
  onUnlock,
  onBack,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>(() => settings?.language || 'pt');
  const ui = UI_TEXT_BY_LANG[currentLang] || UI_TEXT_BY_LANG.pt;

  const [displayText, setDisplayText] = useState<string>(ui.defaultText);
  const [activeCategory, setActiveCategory] = useState<NarratorCategoryData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [cinematicLogIndex, setCinematicLogIndex] = useState<number>(0);
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);
  const [phrasesCount, setPhrasesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('wall_drop_narrator_phrases_count');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPhraseIndexRef = useRef<{ [key: string]: number }>({});

  const handleUnlockClick = () => {
    if (coins < 3000) {
      audio.playSfx('crash', settings);
      setUnlockFeedback(ui.needMoreCoins);
      setTimeout(() => setUnlockFeedback(null), 3000);
      return;
    }

    const success = onUnlock();
    if (success) {
      audio.playSfx('unlock', settings);
      audio.playSfx('victory', settings);
      setUnlockFeedback(ui.unlockedSuccess);
      setTimeout(() => setUnlockFeedback(null), 3000);
    }
  };

  useEffect(() => {
    setDisplayText(ui.defaultText);
  }, [currentLang]);

  useEffect(() => {
    return () => {
      if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  // Web Speech API execution adapted to the active language with grave pitch
  const speakGraveVoice = (text: string, langCode: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap: Record<Language, string> = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        ja: 'ja-JP',
        zh: 'zh-CN',
      };

      utterance.lang = langMap[langCode] || 'pt-BR';
      utterance.rate = 0.85; // Velocidade 0.85
      utterance.pitch = 0.8; // Tom grave masculino

      const voices = window.speechSynthesis.getVoices();
      const targetPrefix = langCode;

      const matchingMaleVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(targetPrefix) &&
          (v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('homme') ||
            v.name.toLowerCase().includes('männlich') ||
            v.name.toLowerCase().includes('masculin') ||
            v.name.toLowerCase().includes('daniel') ||
            v.name.toLowerCase().includes('lucas') ||
            v.name.toLowerCase().includes('george') ||
            v.name.toLowerCase().includes('david'))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));

      if (matchingMaleVoice) {
        utterance.voice = matchingMaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[SpeechSynthesis Narrator Catch]:', e);
    }
  };

  const handleCategoryClick = (cat: NarratorCategoryData) => {
    if (isProcessing || isNarrating) return;

    audio.playSfx('click', settings);

    const phrases = cat.phrases[currentLang] || cat.phrases.pt;
    const lastIdx = lastPhraseIndexRef.current[cat.id] ?? -1;
    const nextIdx = (lastIdx + 1) % phrases.length;
    lastPhraseIndexRef.current[cat.id] = nextIdx;
    const fullText = phrases[nextIdx].toUpperCase();

    // Iniciar Animação Cinematográfica de Processamento (Exatos 3 Segundos)
    setIsProcessing(true);
    setActiveCategory(cat);
    setProcessingProgress(0);
    setCinematicLogIndex(0);

    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

    const PROCESSING_DURATION = 3000;
    const progressStepTime = 30;
    const totalSteps = PROCESSING_DURATION / progressStepTime;
    let currentStep = 0;

    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const pct = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      setProcessingProgress(pct);
    }, progressStepTime);

    logIntervalRef.current = setInterval(() => {
      const logs = CINEMATIC_LOGS_BY_LANG[currentLang] || CINEMATIC_LOGS_BY_LANG.pt;
      setCinematicLogIndex((prev) => (prev + 1) % logs.length);
    }, 600);

    processingTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
      setIsProcessing(false);
      setProcessingProgress(100);

      try {
        audio.playSfx('record', settings);
      } catch {}
      speakGraveVoice(fullText, currentLang);

      setPhrasesCount((prev) => {
        const next = prev + 1;
        try {
          localStorage.setItem('wall_drop_narrator_phrases_count', next.toString());
        } catch {}
        return next;
      });

      setIsNarrating(true);
      setDisplayText('');

      const TYPE_DURATION = 2500;
      const totalChars = fullText.length;
      const intervalMs = Math.max(15, Math.floor(TYPE_DURATION / totalChars));
      let charIndex = 0;

      typeIntervalRef.current = setInterval(() => {
        charIndex++;
        if (charIndex <= totalChars) {
          setDisplayText(fullText.slice(0, charIndex));
        } else {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        }
      }, intervalMs);

      animTimerRef.current = setTimeout(() => {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        setDisplayText(fullText);
        setIsNarrating(false);
      }, TYPE_DURATION);
    }, PROCESSING_DURATION);
  };

  const isBusy = isProcessing || isNarrating;

  const addictionLevel = Math.min(100, Math.floor((phrasesCount / 30) * 100));
  const addictionLabel =
    addictionLevel < 25
      ? ui.statusLevels[0]
      : addictionLevel < 50
      ? ui.statusLevels[1]
      : addictionLevel < 80
      ? ui.statusLevels[2]
      : ui.statusLevels[3];

  const currentLogs = CINEMATIC_LOGS_BY_LANG[currentLang] || CINEMATIC_LOGS_BY_LANG.pt;

  return (
    <div
      id="narrator-viciante-screen"
      className="relative w-full h-full flex flex-col justify-between items-center p-3 sm:p-5 bg-gradient-to-b from-[#0f051d] via-[#05020c] to-[#020b18] text-white select-none overflow-hidden"
    >
      {/* Background Neon Lighting Glows */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ANIMAÇÃO CINEMATOGRÁFICA DE PROCESSAMENTO (3 SEGUNDOS) OVERLAY */}
      <AnimatePresence>
        {isProcessing && activeCategory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl"
          >
            {/* Cinematic Lens Flare Background */}
            <div
              className="absolute w-80 h-80 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"
              style={{ backgroundColor: activeCategory.color }}
            />

            {/* Cinematic Futuristic HUD Frame */}
            <div
              className="relative w-full max-w-sm flex flex-col items-center justify-center p-7 rounded-3xl border-2 shadow-2xl overflow-hidden"
              style={{
                borderColor: activeCategory.color,
                boxShadow: `0 0 40px ${activeCategory.glowColor}, inset 0 0 30px rgba(0,0,0,0.8)`,
                background: 'linear-gradient(180deg, rgba(15,8,30,0.95) 0%, rgba(5,2,12,0.98) 100%)',
              }}
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-30 pointer-events-none" />

              {/* Glowing Top Badge */}
              <div
                className="px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-md flex items-center gap-1.5"
                style={{
                  backgroundColor: activeCategory.color,
                  color: '#000',
                  boxShadow: `0 0 15px ${activeCategory.color}`,
                }}
              >
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>{ui.processorTitle}</span>
              </div>

              {/* Central Sci-Fi Energy Reactor */}
              <div className="relative w-28 h-28 my-3 flex items-center justify-center">
                {/* Rotating Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed"
                  style={{ borderColor: activeCategory.color }}
                />

                {/* Counter Rotating Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute inset-2 rounded-full border-2 border-dotted"
                  style={{ borderColor: activeCategory.color, opacity: 0.6 }}
                />

                {/* Pulsing Core */}
                <motion.div
                  animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                  style={{
                    backgroundColor: `${activeCategory.color}33`,
                    border: `2px solid ${activeCategory.color}`,
                    boxShadow: `0 0 25px ${activeCategory.color}`,
                  }}
                >
                  {activeCategory.emoji}
                </motion.div>
              </div>

              {/* Category Title */}
              <h2
                className="text-lg sm:text-xl font-black uppercase tracking-wider text-center mt-2"
                style={{
                  color: '#FFFFFF',
                  textShadow: `0 0 15px ${activeCategory.color}`,
                  fontFamily: 'Impact, Arial Black, sans-serif',
                }}
              >
                {activeCategory.labels[currentLang] || activeCategory.labels.pt}
              </h2>

              {/* Dynamic Cinematic System Log */}
              <p className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase my-2 h-5 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{currentLogs[cinematicLogIndex]}</span>
              </p>

              {/* High-Tech Progress Bar */}
              <div className="w-full bg-slate-900/90 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/80 my-2 relative">
                <motion.div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${processingProgress}%`,
                    backgroundColor: activeCategory.color,
                    boxShadow: `0 0 15px ${activeCategory.color}`,
                  }}
                />
              </div>

              {/* Numerical Percentage */}
              <div className="flex justify-between w-full text-[10px] font-extrabold text-slate-400 px-1">
                <span>{ui.initSynthesis}</span>
                <span style={{ color: activeCategory.color }}>{processingProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar with Language Switcher */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-1 gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            audio.playSfx('click', settings);
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              try {
                window.speechSynthesis.cancel();
              } catch {}
            }
            onBack();
          }}
          className="p-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{ui.back}</span>
        </motion.button>

        {/* 8-Language Selector Ribbon */}
        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800/80 p-1 rounded-2xl overflow-x-auto max-w-[210px] scrollbar-none">
          {SUPPORTED_LANGS.map((langCode) => {
            const isSelected = currentLang === langCode;
            return (
              <motion.button
                key={langCode}
                type="button"
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.15 }}
                onClick={() => {
                  audio.playSfx('click', settings);
                  setCurrentLang(langCode);
                }}
                className={`p-1 px-1.5 rounded-xl text-xs flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/50 scale-105 border border-purple-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title={getLanguageName(langCode)}
              >
                <span>{getLanguageFlag(langCode)}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-950/80 border border-purple-500/40 rounded-full text-purple-300 text-[10px] font-extrabold shadow-md backdrop-blur-md shrink-0">
          <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
          <span>{isUnlocked ? 'LIVE 🎙️' : 'VIP 🔒'}</span>
        </div>
      </div>

      {!isUnlocked ? (
        /* =========================================================================
           VIP LOCKED GATE (PREÇO: 3.000 MOEDAS 🪙)
           ========================================================================= */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md my-auto z-10 flex flex-col items-center text-center p-4 bg-slate-950/90 border border-purple-500/40 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.25)] relative overflow-hidden"
        >
          {/* Neon decorative background circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* VIP Badge */}
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full text-slate-950 text-xs font-black tracking-widest uppercase shadow-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ui.vipBadge}</span>
          </div>

          {/* Animated Lock Icon */}
          <div className="relative my-2">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-900/60 to-slate-900/90 border-2 border-purple-400/80 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
              <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs shadow-md">
              🎙️
            </div>
          </div>

          {/* Title & Description */}
          <h2
            className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 mt-2 tracking-wide"
            style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          >
            {ui.lockedTitle}
          </h2>

          <p className="text-xs text-slate-300 max-w-xs mt-1.5 leading-relaxed font-medium">
            {ui.lockedDesc}
          </p>

          {/* Features Highlights */}
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs my-3 text-left">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>8 Idiomas Mundiais</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Voz Grave Cinematográfica</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Comentários de Combo</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Soundboard 24+ Falas</span>
            </div>
          </div>

          {/* Coins Balance Indicator */}
          <div className="flex items-center justify-between w-full max-w-xs px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold mb-3">
            <span className="text-slate-400">Seu Saldo:</span>
            <span className="text-amber-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              <span>{coins.toLocaleString()} 🪙</span>
            </span>
          </div>

          {/* Unlock Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleUnlockClick}
            className={`w-full max-w-xs py-3 px-4 rounded-2xl font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 border transition-all duration-200 shadow-xl uppercase ${
              coins >= 3000
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-purple-600 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer hover:brightness-110'
                : 'bg-slate-900 border-slate-800 text-slate-400 cursor-pointer hover:border-slate-700'
            }`}
          >
            {coins >= 3000 ? <Unlock className="w-4 h-4 text-slate-950" /> : <Lock className="w-4 h-4 text-slate-500" />}
            <span>{coins >= 3000 ? ui.unlockBtn : `FALTAM ${3000 - coins} 🪙 (3.000)`}</span>
          </motion.button>

          {/* Feedback Message */}
          {unlockFeedback && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-extrabold text-amber-400 mt-2 animate-pulse"
            >
              {unlockFeedback}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <>
          {/* Title & Blinking Subtitle */}
          <div className="flex flex-col items-center text-center z-10 my-1">
            <div className="flex items-center gap-2">
              <Mic className="w-6 h-6 text-cyan-400 animate-bounce" />
              <h1
                className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
              >
                {ui.title}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-amber-400 tracking-widest uppercase mt-0.5 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 inline text-amber-400" />
              {ui.subtitle}
            </p>
          </div>

          {/* Display Box for Phrases */}
          <div className="w-full max-w-md my-auto z-10 px-2">
            <div
              className={`relative min-h-[105px] sm:min-h-[115px] rounded-2xl p-4 sm:p-5 flex flex-col justify-center items-center text-center transition-all duration-300 border ${
                activeCategory
                  ? 'bg-slate-950/90 shadow-2xl backdrop-blur-md'
                  : 'bg-slate-950/80 border-purple-900/60 shadow-lg'
              }`}
              style={{
                borderColor: activeCategory ? activeCategory.color : '#6366f1',
                boxShadow: activeCategory ? `0 0 25px ${activeCategory.glowColor}` : '0 0 15px rgba(99,102,241,0.2)',
              }}
            >
              {activeCategory && (
                <div
                  className="absolute -top-3 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md"
                  style={{ backgroundColor: activeCategory.color }}
                >
                  {activeCategory.emoji} {activeCategory.labels[currentLang] || activeCategory.labels.pt}
                </div>
              )}

              <p
                className="text-sm sm:text-base md:text-lg font-black tracking-wide text-white transition-all leading-snug"
                style={{
                  textShadow: activeCategory
                    ? `0 0 12px ${activeCategory.color}, 0 0 24px ${activeCategory.glowColor}`
                    : '0 0 8px rgba(255,255,255,0.6)',
                  letterSpacing: '0.05em',
                }}
              >
                {displayText}
                {isNarrating && (
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-ping align-middle" />
                )}
              </p>

              {isNarrating && (
                <div className="mt-2 text-[10px] font-bold text-cyan-300/80 flex items-center gap-1 tracking-wider uppercase">
                  <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>{ui.narrating}</span>
                </div>
              )}
            </div>
          </div>

          {/* 8 Neon Interactive Buttons Grid with Spring Animations */}
          <div className="w-full max-w-md grid grid-cols-2 gap-2.5 z-10 my-1 px-1">
            {NARRATOR_DATA.map((cat) => {
              const isCurrent = activeCategory?.id === cat.id && isBusy;
              const labelText = cat.labels[currentLang] || cat.labels.pt;

              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  disabled={isBusy}
                  whileHover={!isBusy ? { scale: 1.04, y: -2 } : {}}
                  whileTap={!isBusy ? { scale: 0.92 } : {}}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  onClick={() => handleCategoryClick(cat)}
                  className={`relative py-3 px-2 rounded-2xl font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 border transition-all duration-200 shadow-md uppercase select-none ${
                    isBusy && !isCurrent
                      ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900/60 text-slate-500'
                      : isCurrent
                      ? 'animate-pulse text-white shadow-lg'
                      : 'hover:brightness-125 text-white cursor-pointer'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? cat.color : `${cat.color}22`,
                    borderColor: cat.color,
                    boxShadow: isCurrent
                      ? `0 0 20px ${cat.color}`
                      : `0 0 10px ${cat.glowColor}`,
                    color: isCurrent ? '#000' : '#FFF',
                  }}
                >
                  <span className="text-base sm:text-lg">{cat.emoji}</span>
                  <span
                    style={{
                      textShadow: isCurrent
                        ? 'none'
                        : `0 0 8px ${cat.color}`,
                    }}
                  >
                    {labelText}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Footer: Phrases Count & Addiction Level Indicator */}
          <div className="w-full max-w-md z-10 mt-2 bg-slate-950/90 border border-slate-800/80 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-md">
            <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-extrabold">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>{ui.heardCount}</span>
                <span className="text-white text-xs">{phrasesCount}</span>
              </span>
              <span className="text-amber-400 tracking-wider">
                {addictionLabel} ({addictionLevel}%)
              </span>
            </div>

            {/* Progress Bar for Addiction Level */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.7)]"
                style={{ width: `${Math.max(5, addictionLevel)}%` }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
