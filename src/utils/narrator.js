// src/utils/narrator.js
// Banco de falas expandido e motor do Narrador para Wall Drop
// Tom: Narrador de futebol dramático com toque sinistro, engraçado, sarcástico e irritante

export const FALAS_IRRITANTES = [
  "Sério? Foi ISSO que você fez?",
  "Meu vizinho de 5 anos jogaria melhor que isso.",
  "Você tá jogando ou só cutucando a tela?",
  "Ai que dó... ai que dóóó.",
  "De novo? SÉRIO, de novo?",
  "Eu vou fingir que não vi isso.",
  "Isso doeu em mim também, viu.",
  "Tá tentando ou é sempre assim mesmo?",
  "Misericórdia, {name}! Até uma tartaruga desviava dessa parede!",
  "Parabéns, {name}! Ganhou o troféu de colisão frontal do ano!",
  "A parede nem fez força e você já entregou tudo!",
  "Você tá jogando com a tela desligada ou com a mão no bolso?",
  "Se desviar de parede fosse crime, você seria a pessoa mais inocente do planeta!",
  "Olha, o botão de esquiva não morde, tá {name}?",
  "Mais devagar que a sua reação, só a minha paciência narrando isso!",
];

export const FALAS_ENGRACADAS = [
  "A gota morreu como viveu: decepcionando.",
  "RIP gotinha. 2026-2026. Vida curta, queda curtíssima.",
  "Ela lutou bravamente por... 2 segundos.",
  "Isso vai doer amanhã. Ou agora. Agora mesmo.",
  "Parabéns, você achou a única parede do mapa inteiro.",
  "A física ganhou essa rodada.",
  "Alguém chama uma ambulância. Pra gota.",
  "Parede 1, gotinha 0! E a torcida da parede tá fazendo a onda!",
  "Foi de F no chat com direito a replay em câmera lenta!",
  "Erro 404: habilidade de esquiva não encontrada no sistema!",
  "A gravidade mandou um abraço e a parede mandou a conta do hospital!",
  "Tentou fazer manobra radical e virou adesivo 4K de parede!",
  "Caiu mais rápido que o sinal do Wi-Fi em dia de tempestade!",
  "Um minuto de silêncio para os reflexos do nosso querido {name}...",
];

export const FALAS_SARCASTICAS = [
  "Uau. Simplesmente... uau.",
  "Vou anotar isso aqui: 'não tentou muito'.",
  "Isso é uma pontuação ou um erro de digitação?",
  "Nem vou comentar. Ah espera, já comentei.",
  "Que performance fascinante de como NÃO jogar.",
  "Se o objetivo era bater o mais rápido possível, você foi perfeito.",
  "Sensacional. Minhas expectativas estavam baixas, mas você superou.",
  "Impressionante como você encontrou exatamente o obstáculo.",
  "Uma aula magistral de encontro imediato com o concreto.",
  "Vou fingir que isso foi só um aquecimento desastroso.",
  "Nota 10 pro impacto, nota 0 pra capacidade de desvio!",
  "Achei poético o jeito que você desistiu no meio do caminho.",
];

export const FALAS_PROVOCACAO = [
  "Aposto que você não consegue de novo. AH, aposto mesmo.",
  "Vai, clica aí. Eu SEI que você vai clicar.",
  "Só mais uma vez. É sempre 'só mais uma vez'.",
  "Você não vai parar agora, vai? VAI?",
  "A parede tá rindo de você. Literalmente. Ouça.",
  "Duvido você passar do próximo obstáculo sem fechar os olhos.",
  "Bora, clica no botão e finge que a última partida nunca aconteceu.",
  "Vai desistir ou vai dar mais um show de barbeiragem pra gente rir?",
  "Mais uma tentativa pra alimentar a sede de vitória da parede?",
  "Clica de novo, vai! A parede tá com saudades do seu abraço.",
  "Eu sei que seu orgulho tá ferido. Vai lá tentar de novo!",
  "Quero ver se tem coragem de bater o próprio recorde de trapalhada.",
];

export const FALAS_BIZARRAS = [
  "Fun fact: gotas não têm ossos. Isso não ajudou em nada.",
  "Em algum lugar, uma torneira está orgulhosa de você.",
  "Isso não estava no roteiro. Nada disso estava no roteiro.",
  "Eu já vi coisas... coisas que você não acreditaria.",
  "Segundo a mecânica quântica, em algum universo você desviou dessa parede.",
  "Cuidado: cientistas afirmam que bater em paredes repetidamente causa Game Over.",
  "Se você olhar bem fundo pro abismo... o abismo também bate na parede.",
  "O coeficiente de atrito do seu personagem acaba de atingir o infinito.",
  "Historiadores do futuro vão estudar essa manobra com muita confusão.",
  "Nenhuma gota foi ferida durante a gravação desta partida. Mentira, foi sim.",
  "O som dessa batida foi ouvido em três dimensões paralelas simultâneas.",
  "Se a parede pudesse falar, ela teria pedido desculpas pelo estrago.",
];

export const FALAS_NORMAIS_DEFEAT = [
  "Foi de Wall.",
  "A parede ganhou desta vez.",
  "Instinto superior falhou!",
  "Foi de F com estilo!",
  "A parede 1, você 0.",
  "Calma, respira e tenta de novo!",
  "A parede ergueu o escudo, mas você brilhou!",
  "Não faz mal, se levanta e brilha de novo!",
  "Um pequeno deslize no caminho da glória!",
  "Essa foi rápida demais! A parede nem esperou!",
  "Piscou, bateu! Respira e volta!",
  "Bateu de surpresa, mas o brilho continua!",
];

export class NarratorEngine {
  constructor() {
    this.lastPhrase = '';
    this.lastSpokenTime = 0;
    this.cooldownMs = 3000; // Cooldown mínimo obrigatório de 3.0s entre falas
    this.history = [];
  }

  /**
   * Sorteia uma frase com distribuição ponderada:
   * - 70% chance de fala normal
   * - 20% chance de fala irritante / engraçada / sarcástica (distribuídas igualmente)
   * - 5% chance de fala bizarra rara
   * - 5% chance de fala de provocação
   * Garante que a mesma frase NUNCA se repita duas vezes seguidas.
   */
  getRandomPhrase(playerName = 'Jogador', forceCategory = null) {
    let pool = [];

    if (forceCategory) {
      switch (forceCategory) {
        case 'irritante':
        case 'irritantes':
          pool = FALAS_IRRITANTES;
          break;
        case 'engracado':
        case 'engracadas':
          pool = FALAS_ENGRACADAS;
          break;
        case 'sarcastica':
        case 'sarcasticas':
          pool = FALAS_SARCASTICAS;
          break;
        case 'provocacao':
          pool = FALAS_PROVOCACAO;
          break;
        case 'bizarra':
        case 'bizarras':
          pool = FALAS_BIZARRAS;
          break;
        default:
          pool = FALAS_NORMAIS_DEFEAT;
      }
    } else {
      const roll = Math.random() * 100;

      if (roll < 70) {
        // 70% Normal
        pool = FALAS_NORMAIS_DEFEAT;
      } else if (roll < 90) {
        // 20% Irritante / Engraçada / Sarcástica (sorteio uniforme entre as 3)
        const subRoll = Math.random() * 3;
        if (subRoll < 1) {
          pool = FALAS_IRRITANTES;
        } else if (subRoll < 2) {
          pool = FALAS_ENGRACADAS;
        } else {
          pool = FALAS_SARCASTICAS;
        }
      } else if (roll < 95) {
        // 5% Bizarra Rara
        pool = FALAS_BIZARRAS;
      } else {
        // 5% Provocação
        pool = FALAS_PROVOCACAO;
      }
    }

    // Filtrar para nunca repetir a MESMA frase duas vezes seguidas
    let candidates = pool.filter((phrase) => phrase !== this.lastPhrase);
    if (candidates.length === 0) {
      candidates = pool;
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    this.lastPhrase = chosen;
    
    this.history.push(chosen);
    if (this.history.length > 20) {
      this.history.shift();
    }

    return chosen.replace(/\{name\}/g, playerName || 'Jogador');
  }

  /**
   * Verifica se o cooldown de 1.5s foi respeitado
   */
  canSpeak() {
    const now = Date.now();
    return now - this.lastSpokenTime >= this.cooldownMs;
  }

  markSpoken() {
    this.lastSpokenTime = Date.now();
  }

  resetCooldown() {
    this.lastSpokenTime = 0;
  }
}

export const narratorEngine = new NarratorEngine();
export default narratorEngine;
