// Centralized Multilingual Narrator Manager & Phrase Engine for Wall Drop
import { GameSettings } from '../types';
import { narratorService as libNarratorService } from '../../lib/services/narrator_service';
import { NarratorConfig, NARRATOR_SPEED } from './narratorConfig';

export type NarratorEventCategory =
  | 'welcome'
  | 'start'
  | 'scoreMilestone'
  | 'highStreak'
  | 'highScore'
  | 'defeat'
  | 'deathFast'
  | 'deathUnexpected'
  | 'unlock'
  | 'spendCoins'
  | 'missionComplete'
  | 'nearMiss'
  | 'coinMilestone'
  | 'coinStreak'
  | 'comboMilestone'
  | 'combo3'
  | 'combo5'
  | 'combo10'
  | 'evolution'
  | 'secondChance'
  | 'shopOpen'
  | 'selectCharacter'
  | 'selectRare'
  | 'equipItem'
  | 'insufficientCoins'
  | 'returnMenu'
  | 'rankingOpen'
  | 'challengesOpen'
  | 'settingsOpen'
  | 'workshopOpen'
  | 'customUnlock'
  | 'abilityUpgraded'
  | 'shieldAbsorb'
  | 'slowMoCollected'
  | 'languageChange'
  | 'playClick'
  | 'premiumOpen'
  | 'pause'
  | 'resume'
  | 'irritante'
  | 'irritantes'
  | 'engracado'
  | 'engracadas'
  | 'sarcastica'
  | 'sarcasticas'
  | 'provocacao'
  | 'bizarra'
  | 'bizarras'
  | 'carinhoso'
  | 'timido'
  // 7 Novos Momentos Viciantes de Narração
  | 'frenzyMode'
  | 'frenzyEnd'
  | 'goldenRush'
  | 'liveHighScore'
  | 'ultraNearMiss'
  | 'hyperSpeedZone'
  | 'instantRematch'
  | 'stubbornStreak';

// Complete translation phrase table per language
export const NARRATOR_PHRASES: Record<string, Partial<Record<NarratorEventCategory, string[]>>> = {
  pt: {
    frenzyMode: [
      'MODO FRENESI ATIVADO! TUDO VALE DOBRADO, {name}!',
      'OVERDRIVE TOTAL! BRILHO MÁXIMO NO ABISMO!',
      'FRENESI NEON! AGILIDADE SOBRE-HUMANA!',
      'MULTIPLICADOR 2X ATIVO! MOSTRA DO QUE É CAPAZ!',
      'NÍVEL DEMONÍACO DE VELOCIDADE!',
    ],
    frenzyEnd: [
      'Frenesi finalizado! Que sequência absurda, {name}!',
      'Overdrive normalizado! Continua firme!',
      'Respira, o frenesi passou mas o ritmo continua!',
    ],
    goldenRush: [
      'CHUVA DE OURO! COLETA TUDO, {name}!',
      'SEQUÊNCIA DOURADA! O ABISMO TÁ PAGANDO!',
      'TESOURO CAINDO DO CÉU! PEGA TODAS!',
      'COFRE ABERTO! PURA PROSPERIDADE NO NEON!',
    ],
    liveHighScore: [
      'NOVO RECORDE PESSOAL AO VIVO, {name}!',
      'SUPEROU O PRÓPRIO LIMITE! HISTÓRICO!',
      'VOCÊ BATEU SEU RECORDE! CONTINUA, NINGUÉM TE PARA!',
      'MARCA LENDÁRIA ULTRAPASSADA!',
    ],
    ultraNearMiss: [
      'ESSA RASPOU NA LATARIA POR MEIO MILÍMETRO!',
      'MEU DEUS! A PAREDE ATÉ TREMEU COM ESSE DESVIO!',
      'FOI POR UM FIAPO DE LUZ!',
      'CORAGEM PURA! DESVIO CIRÚRGICO, {name}!',
    ],
    hyperSpeedZone: [
      'ENTRANDO NA ZONA DE HIPERVELOCIDADE!',
      'ZONA ULTRA-RÁPIDA! REFLEXOS DE AÇO AGORA!',
      'GRAVIDADE EM ACELERAÇÃO MÁXIMA!',
      'PREPARA O CORAÇÃO, A VELOCIDADE DOBROU!',
    ],
    instantRematch: [
      'Revanche em menos de um segundo?! É disso que eu tô falando, {name}!',
      'Nem piscou e já voltou! Essa vai ser a partida da sua vida!',
      'Vontade de vencer inabalável! Bora pra cima!',
      'Sem choro, só ação! Agora o recorde cai!',
    ],
    stubbornStreak: [
      'Sete derrotas e a mesma determinação de ferro! Você é teimoso demais, {name}!',
      'Essa insistência vai virar vitória épica! Não desiste!',
      'A parede tá cansando de você e você não cansa da parede!',
      'Persistência lendária! O verdadeiro campeão cai 10 vezes e levanta 11!',
    ],
    welcome: [
      'Bem-vindo ao Wall Drop, {name}!',
      'De volta à queda, {name}!',
      'Pronto para o abismo, {name}?',
      'Lendário {name} na área! Chegou a hora de brilhar!',
      'O abismo tava com saudades de você, {name}!',
      'Pronto pra dar um show na queda?',
      'O mestre do abismo voltou! Mostra teu brilho!',
    ],
    start: [
      'Faz o que você sabe fazer que é brilhar!',
      'Faz o que você sabe fazer de melhor: brilhar, {name}!',
      '{name}, foco total na queda!',
      'Bora! A queda começou!',
      'Preparado, {name}?',
      'Mostra o que sabes fazer!',
      'Mostra o teu brilho no abismo!',
      'Entrou na zona de velocidade total!',
      'Mãos no controle e olhos na queda!',
      'Vai com tudo, mostra como se brilha!',
      'Sem freios, só vitória!',
    ],
    scoreMilestone: [
      'Nível insano de agilidade, {name}!',
      'Excelente travessia!',
      'Velocidade pura!',
      'Incrível ponto de controle!',
      'Que performance brilhante, {name}!',
      'Você tá brilhando como um raio neon!',
      'Reflexos cirúrgicos de puro aço!',
      'Desvio sensacional, que brilho!',
      'Mestre absoluto da gravidade!',
    ],
    highStreak: [
      'Sequência impressionante!',
      'Ninguém te para!',
      'Foco total, {name}!',
      'Que ritmo insano, tá brilhando demais!',
      'Modo gravidade zero ativado!',
      'Ninguém consegue acompanhar teu brilho!',
      'Domínio absoluto da queda!',
    ],
    highScore: [
      'NOVO RECORDE ABSOLUTO!',
      'ESCREVESTE A HISTÓRIA, {name}!',
      'LENDÁRIO!',
      'O MUNDO É TEU! QUE BRILHO ESPETACULAR!',
      'RECORDISTA SUPREMO DA WALL DROP!',
      'NOME GRAVADO NA ETERNIDADE COM BRILHO NEON!',
    ],
    defeat: [
      'Foi de Wall.',
      'A parede ganhou desta vez.',
      'Instinto superior falhou!',
      'Foi de F com estilo!',
      'A parede 1, você 0.',
      'Calma, respira e tenta de novo!',
      'A parede ergueu o escudo, mas você brilhou!',
      'Não faz mal, se levanta e brilha de novo!',
      'Tática ousada! A parede levou por pouco!',
      'Um pequeno deslize no caminho da glória!',
      'Sério mesmo, {name}? A parede nem se mexeu e você entregou tudo!',
      'Gravei essa jogada pra mandar de presente pros teus inimigos!',
      'A parede mandou avisar que adorou o seu abraço!',
      'Misericórdia, {name}! Foi o gato que pisou no controle?',
      'Mais rápido que a sua queda, só a vergonha de ter batido assim!',
      'Dizem que errar é humano... mas você exagerou agora!',
      'Foi a gravidade ou seus dedos que decidiram tirar férias?',
      'Quer um travesseiro pra próxima colisão na parede?',
      'A física chora toda vez que você joga, {name}!',
      'Nota 10 pro impacto, nota 0 pra capacidade de desvio!',
      'Uau! A parede nem precisou se esforçar pra te parar!',
      'O objetivo era sobreviver, não virar mosaico de parede!',
      'Tragédia anunciada! Respira e tenta não bater em um segundo!',
      'A parede ficou até preocupada com essa cabeçada!',
      'Achei que era aula de esquiva, não de demolição!',
    ],
    deathFast: [
      'Essa foi rápida demais!',
      'A parede nem esperou!',
      'Foi de berço em segundos!',
      'A parede nem te deu tempo de brilhar!',
      'Piscou, bateu! Respira e volta!',
      'Misericórdia! Entrou na partida só pra cair no chão?',
      '0,5 segundos?! Isso é um novo recorde de barbeiragem!',
      'Você por acaso tem alergia a ficar vivo por mais de 3 segundos?',
      'Nem deu tempo de eu puxar o ar pra narrar, {name}!',
      'Entrou, bateu, morreu! Eficiência máxima na derrota!',
      'Olha... o botão de desvio serve justamente pra desviar!',
      'Você bateu a velocidade da luz em perder o jogo!',
      'Parabéns, {name}! Você acelerou direto pro desastre!',
    ],
    deathUnexpected: [
      'Que impacto chocante!',
      'Veio do nada!',
      'A parede não teve piedade!',
      'Bateu de surpresa, mas o brilho continua!',
      'Colisão frontal! Vamos de novo!',
      'A parede surgiu do nada? Ou você que tava de olho fechado?',
      'Isso foi uma tentativa de voo ou uma decolagem sem asas?',
      'Achei que você ia se esquivar, mas você foi direto com tudo!',
      'Que pancada linda! A parede até agradeceu pela visita!',
      'Abraçou o obstáculo com um amor impressionante, {name}!',
      'Nossa! Até meu microfone sentiu a dor dessa porrada!',
    ],
    unlock: [
      'Novo item desbloqueado!',
      'Excelente aquisição, {name}!',
      'Estilo único liberado!',
      'Esse novo item vai te fazer brilhar na arena!',
      'Equipamento lendário desbloqueado!',
    ],
    spendCoins: [
      'Boa escolha, {name}!',
      'Valia cada moeda!',
      'Investimento de mestre!',
      'Boa compra! Investimento pra brilhar!',
      'Moedas bem gastas no arsenal!',
    ],
    missionComplete: [
      'Missão concluída com sucesso, {name}!',
      'Desafio superado!',
      'Recompensa garantida!',
      'Missão cumprida! Recompensa brilhante garantida!',
      'Conquista desbloqueada com brilho supremo!',
    ],
    nearMiss: [
      'FOI POR UM MILÍMETRO!',
      'Pela fresta, {name}!',
      'Uau! Raspou na parede!',
      'Passou raspando na parede e brilhando!',
      'Rasgou o vento por um milímetro!',
      'Limpou a poeira da parede com a lataria, {name}!',
      'Uau! Se a parede tivesse tinta nova, tinha borrado!',
      'Essa foi tão perto que até o narrador prendeu a respiração!',
      'Por meio milímetro você não virou patê de parede!',
    ],
    coinMilestone: [
      'Chuva de moedas!',
      'Rico no abismo, {name}!',
      'Tesouro do abismo coletado! Brilho de ouro!',
    ],
    coinStreak: [
      'Sequência dourada!',
      'Pegou todas as moedas!',
      'Ímã de ouro ativado!',
      'Coleta perfeita, {name}!',
    ],
    comboMilestone: [
      'Que sequência absurda!',
      'Está imparável!',
      'Está imparável, {name}!',
      'Combo imparável, {name}!',
      'Sequência monumental!',
      'Brilho em nível épico!',
      'Domínio total do abismo!',
      'Reflexos sobrenaturais!',
      'Você entrou na zona quântica!',
    ],
    combo3: [
      '3 seguidas!',
      'Ritmo perfeito!',
      'Triplo desvio! Brilho puro!',
      '3 seguidas no compasso!',
    ],
    combo5: [
      'Que sequência absurda!',
      '5 seguidas! Incrível!',
      '5 seguidas! Você tá voando baixo!',
      '5 seguidas! Você tá iluminando tudo!',
      'Ritmo impecável, {name}!',
      'Sequência espetacular!',
    ],
    combo10: [
      'Está imparável!',
      'Está imparável, {name}!',
      'Que sequência absurda!',
      '10 SEGUIDAS! MODO DEMÓNIO!',
      '10 SEGUIDAS! MODO BRILHO SUPREMO!',
      'Reflexos sobre-humanos!',
      'Ninguém te para agora!',
      'Absolutamente inacreditável!',
    ],
    evolution: ['Velocidade aumentada!', 'Agora ficou sério!', 'O ritmo acelerou! Faz o que sabe fazer: brilhar!'],
    secondChance: [
      'Segunda chance ativada! Vai com tudo, {name}!',
      'De volta à ação!',
      'Segunda chance! Faz o que você sabe fazer que é brilhar!',
      'Voltou mais forte! Mostra teu brilho agora!',
    ],
    shopOpen: [
      'Bem-vindo à loja, {name}!',
      'O que vais comprar hoje?',
      'Mercado aberto!',
      'Hora do upgrade pra brilhar na pista!',
    ],
    selectCharacter: [
      'Excelente escolha de personagem!',
      'Pronto para a ação, {name}!',
      'Personagem selecionado!',
      'Com esse herói, é só brilhar!',
    ],
    selectRare: ['Artefacto raro selecionado!', 'Poder supremo!'],
    equipItem: ['Item equipado com sucesso!', 'Novo visual ativado!'],
    insufficientCoins: [
      'Moedas insuficientes, {name}!',
      'Acumula mais moedas na queda!',
      'Tá sem um tostão furado, {name}! Vai trabalhar na queda!',
      'Economia em crise! Junte mais moedas antes de vir gastar!',
      'Saldo zero! A loja não aceita fiado, campeão!',
    ],
    returnMenu: [
      'De volta ao menu principal, {name}.',
      'Pronto para mais uma?',
      'Fugindo pra área segura do menu, {name}?',
      'Correu pro menu pra recuperar o fôlego?',
    ],
    rankingOpen: [
      'Quadro de líderes e recordes!',
      'Olhos nos melhores jogadores!',
    ],
    challengesOpen: [
      'Missões e conquistas disponíveis!',
      'Hora de coletar prêmios!',
    ],
    settingsOpen: [
      'Opções e configurações do jogo.',
      'Ajuste o áudio e narrador.',
    ],
    workshopOpen: [
      'Bem-vindo à Oficina VIP, {name}!',
      'Hora de customizar suas cores e aprimorar poderes!',
      'Oficina de customização e aprimoramento aberta!',
      'Gaste suas 2000 moedas com estilo lendário, {name}!',
    ],
    customUnlock: [
      'Estilo lendário desbloqueado com sucesso!',
      'Visual customizado ativado! Que brilho!',
      'Nova paleta e arena prontas para o show!',
    ],
    abilityUpgraded: [
      'Aprimoramento concluído, {name}!',
      'Poder elevado ao próximo nível!',
      'Suas habilidades no abismo estão mais fortes!',
    ],
    shieldAbsorb: [
      'Escudo energético absorveu o impacto mortal!',
      'Salvo pelo escudo de emergência!',
      'Proteção intacta! Continua caindo, {name}!',
    ],
    slowMoCollected: [
      'Slow-Mo ativado! O tempo congelou ao seu redor, {name}!',
      'Tempo desacelerado! Aproveita a brecha!',
      'Câmera lenta ativada! Domina o abismo!',
      'Tempo parou para o mestre {name} passar!',
    ],
    languageChange: [
      'Idioma alterado para português.',
      'Voz do narrador configurada em português.',
    ],
    playClick: ['Iniciando partida!', 'Bora cair!', 'Partiu brilhar na queda!'],
    premiumOpen: ['Área de recompensas e moedas extras!'],
    pause: [
      'Jogo pausado.',
      'Pausa rápida pra recuperar o brilho!',
      'Pausou pra chorar ou pra procurar um tutorial?',
      'Tá esperando a parede pedir desculpas pra continuar?',
      'Pausa dramática pra disfarçar o susto, {name}?',
      'Pausou? A parede tá te esperando com os braços abertos!',
      'Vai descansar os dedinhos ou tomar um chá de coragem?',
    ],
    resume: ['De volta ao jogo!', 'De volta ao jogo! Brilha!'],
    irritante: [
      'Sério? Foi ISSO que você fez?',
      'Meu vizinho de 5 anos jogaria melhor que isso.',
      'Você tá jogando ou só cutucando a tela?',
      'Ai que dó... ai que dóóó.',
      'De novo? SÉRIO, de novo?',
      'Eu vou fingir que não vi isso.',
      'Isso doeu em mim também, viu.',
      'Tá tentando ou é sempre assim mesmo?',
      'Misericórdia, {name}! Até uma tartaruga desviava dessa parede!',
      'Parabéns, {name}! Ganhou o troféu de colisão frontal do ano!',
      'A parede nem fez força e você já entregou tudo!',
      'Você tá jogando com a tela desligada ou com a mão no bolso?',
      'Se desviar de parede fosse crime, você seria o cidadão mais inocente do planeta!',
      'Olha, o botão de esquiva não morde, tá {name}?',
      'Mais devagar que a sua reação, só a minha paciência narrando isso!',
      'Caramba! Você treinou quantos anos pra jogar mal assim, {name}?',
      'A física chora e a parede ri toda vez que você clica em jogar!',
    ],
    irritantes: [
      'Sério? Foi ISSO que você fez?',
      'Meu vizinho de 5 anos jogaria melhor que isso.',
      'Você tá jogando ou só cutucando a tela?',
      'Ai que dó... ai que dóóó.',
      'De novo? SÉRIO, de novo?',
      'Eu vou fingir que não vi isso.',
      'Isso doeu em mim também, viu.',
      'Tá tentando ou é sempre assim mesmo?',
      'Misericórdia, {name}! Até uma tartaruga desviava dessa parede!',
      'Parabéns, {name}! Ganhou o troféu de colisão frontal do ano!',
      'A parede nem fez força e você já entregou tudo!',
      'Você tá jogando com a tela desligada ou com a mão no bolso?',
    ],
    engracado: [
      'A gota morreu como viveu: decepcionando.',
      'RIP gotinha. 2026-2026. Vida curta, queda curtíssima.',
      'Ela lutou bravamente por... 2 segundos.',
      'Isso vai doer amanhã. Ou agora. Agora mesmo.',
      'Parabéns, você achou a única parede do mapa inteiro.',
      'A física ganhou essa rodada.',
      'Alguém chama uma ambulância. Pra gota.',
      'Parede 1, gotinha 0! E a torcida da parede tá fazendo a onda!',
      'Foi de F no chat com direito a replay em câmera lenta!',
      'Erro 404: habilidade de esquiva não encontrada no sistema!',
      'A gravidade mandou um abraço e a parede mandou a conta do hospital!',
      'Tentou fazer manobra radical e virou adesivo 4K de parede!',
      'Caiu mais rápido que o sinal do Wi-Fi em dia de chuva!',
      'Um minuto de silêncio para os reflexos do nosso querido {name}...',
    ],
    engracadas: [
      'A gota morreu como viveu: decepcionando.',
      'RIP gotinha. 2026-2026. Vida curta, queda curtíssima.',
      'Ela lutou bravamente por... 2 segundos.',
      'Isso vai doer amanhã. Ou agora. Agora mesmo.',
      'Parabéns, você achou a única parede do mapa inteiro.',
      'A física ganhou essa rodada.',
      'Alguém chama uma ambulância. Pra gota.',
      'Parede 1, gotinha 0! E a torcida da parede tá fazendo a onda!',
      'Foi de F no chat com direito a replay em câmera lenta!',
      'Erro 404: habilidade de esquiva não encontrada no sistema!',
      'Tentou fazer manobra radical e virou adesivo de parede!',
    ],
    sarcastica: [
      'Uau. Simplesmente... uau.',
      'Vou anotar isso aqui: "não tentou muito".',
      'Isso é uma pontuação ou um erro de digitação?',
      'Nem vou comentar. Ah espera, já comentei.',
      'Que performance fascinante de como NÃO jogar.',
      'Se o objetivo era bater o mais rápido possível, você foi perfeito.',
      'Sensacional. Minhas expectativas estavam baixas, mas você superou.',
      'Impressionante como você encontrou exatamente o obstáculo.',
      'Uma aula magistral de encontro imediato com o concreto.',
      'Vou fingir que isso foi só um aquecimento desastroso.',
      'Nota 10 pro impacto, nota zero pra capacidade de desvio!',
      'Achei poético o jeito que você desistiu no meio do caminho.',
    ],
    sarcasticas: [
      'Uau. Simplesmente... uau.',
      'Vou anotar isso aqui: "não tentou muito".',
      'Isso é uma pontuação ou um erro de digitação?',
      'Nem vou comentar. Ah espera, já comentei.',
      'Que performance fascinante de como NÃO jogar.',
      'Se o objetivo era bater o mais rápido possível, você foi perfeito.',
      'Sensacional. Minhas expectativas estavam baixas, mas você superou.',
      'Impressionante como você encontrou exatamente o obstáculo.',
      'Uma aula magistral de encontro imediato com o concreto.',
      'Vou fingir que isso foi só um aquecimento desastroso.',
    ],
    provocacao: [
      'Aposto que você não consegue de novo. AH, aposto mesmo.',
      'Vai, clica aí. Eu SEI que você vai clicar.',
      'Só mais uma vez. É sempre "só mais uma vez".',
      'Você não vai parar agora, vai? VAI?',
      'A parede tá rindo de você. Literalmente. Ouça.',
      'Duvido você passar do próximo obstáculo sem fechar os olhos.',
      'Bora, clica no botão e finge que a última partida nunca aconteceu.',
      'Vai desistir ou vai dar mais um show de barbeiragem pra gente rir?',
      'Mais uma tentativa pra alimentar a sede de vitória da parede?',
      'Clica de novo, vai! A parede tá com saudades do seu abraço.',
      'Eu sei que seu orgulho tá ferido. Vai lá tentar de novo!',
      'Quero ver se tem coragem de bater o próprio recorde de trapalhada.',
    ],
    bizarra: [
      'Fun fact: gotas não têm ossos. Isso não ajudou em nada.',
      'Em algum lugar, uma torneira está orgulhosa de você.',
      'Isso não estava no roteiro. Nada disso estava no roteiro.',
      'Eu já vi coisas... coisas que você não acreditaria.',
      'Segundo a mecânica quântica, em algum universo você desviou dessa parede.',
      'Cuidado: cientistas afirmam que bater em paredes repetidamente causa Game Over.',
      'Se você olhar bem fundo pro abismo... o abismo também bate na parede.',
      'O coeficiente de atrito do seu personagem acaba de atingir o infinito.',
      'Historiadores do futuro vão estudar essa manobra com muita confusão.',
      'Nenhuma gota foi ferida durante a gravação desta partida. Mentira, foi sim.',
      'O som dessa batida foi ouvido em três dimensões paralelas simultâneas.',
      'Se a parede pudesse falar, ela teria pedido desculpas pelo estrago.',
    ],
    bizarras: [
      'Fun fact: gotas não têm ossos. Isso não ajudou em nada.',
      'Em algum lugar, uma torneira está orgulhosa de você.',
      'Isso não estava no roteiro. Nada disso estava no roteiro.',
      'Eu já vi coisas... coisas que você não acreditaria.',
      'Segundo a mecânica quântica, em algum universo você desviou dessa parede.',
      'Cuidado: cientistas afirmam que bater em paredes repetidamente causa Game Over.',
      'Se você olhar bem fundo pro abismo... o abismo também bate na parede.',
      'O coeficiente de atrito do seu personagem acaba de atingir o infinito.',
      'Historiadores do futuro vão estudar essa manobra com muita confusão.',
      'Nenhuma gota foi ferida durante a gravação desta partida. Mentira, foi sim.',
    ],
    carinhoso: [
      'Não fica triste, meu bem! Você brilhou demais e na próxima vai voar!',
      'Calma, {name}! Você deu o seu melhor e eu tô muito orgulhoso de você!',
      'A parede foi cruel, mas seu brilho é imparável! Levanta a cabeça!',
      'Tudo bem errar, viu? Você é incrível e cada tentativa te deixa mais forte!',
      'Um abraço bem quentinho pra te dar coragem! Bora tentar de novo juntos, {name}?',
      'Você foi tão longe, {name}! Tenho certeza que no próximo teste você bate o recorde!',
      'Não se cobra tanto, tá? O importante é continuar tentando com esse coração lindo!',
      'Seu brilho é mais forte do que qualquer parede de neon! Força, campeão!',
      'Tô aqui torcendo por você a cada segundo! Vamos lá, mais uma vez com carinho!',
      'A gente cai pra aprender a se levantar ainda mais radiante, {name}!',
      'Você jogou de forma adorável! Na próxima a vitória é toda sua!',
      'Que orgulho de ver sua dedicação! Não desista jamais, meu querido {name}!',
      'Você é uma estrela iluminada e essa parede é só um pequeno obstáculo!',
      'Respira bem fundo... eu sei que você consegue! Confio no seu potencial!',
      'Cada queda é só um degrau rumo ao topo! Você é um verdadeiro herói!',
      'Você é capaz de coisas maravilhosas, {name}! Acredita em você como eu acredito!',
      'Que lindo ver você jogar! Mesmo na derrota, você tem um brilho único!',
      'Vem cá, toma um arzinho e tenta de novo. Eu tô do seu lado!',
      'Você faz o jogo parecer tão especial, {name}! Não desanima não!',
      'Sua garra é inspiradora! Tenho certeza que a vitória tá logo ali na frente!',
      'Mesmo quando perde, você dá um show de fofura e determinação!',
      'Fica em paz, {name}! Você é incrível e esse jogo é só pra você se divertir!',
      'A parede não sabe o talento gigante que você tem aí dentro!',
      'Você é a melhor parte dessa jornada! Continua brilhando, {name}!',
      'Um passo de cada vez, meu amigo! Você tá ficando cada dia melhor!',
      'Seus reflexos são cheios de luz! Na próxima vai dar tudo certo!',
      'Nunca perca essa sua energia maravilhosa, {name}! Você é nota mil!',
      'Foi por tão pouquinho! Você jogou com tanto amor e empenho!',
      'Segura na minha mão virtual e vamos juntos vencer esse desafio!',
      'Você inspira todo mundo ao seu redor com essa persistência fofa!',
      'A vida é feita de tentativas e você tá dando um espetáculo de coragem!',
      'Ninguém brilha como você, {name}! Levanta e mostra sua força doce!',
      'Tá tudo bem, tá? O importante é que você se divertiu e tentou!',
      'Amanhã você vai tá voando baixo e desviando de tudo com um sorriso!',
      'Sua luz é contagiosa! Continue tentando que o topo te espera!',
      'Você é uma fofura jogando, {name}! Torço por você em todas as quedas!',
      'Guarda esse sorriso lindo e vamos tentar mais uma partida?',
      'A parede tentou te parar, mas seu brilho é infinito, meu anjo!',
      'Você tem um coração de campeão! Não deixa uma paredinha te abalar!',
      'Cada partida sua é uma obra de arte cheia de carinho!',
      'Sabe de uma coisa, {name}? Você é meu jogador favorito do mundo!',
      'Acredite nos seus sonhos no jogo e na vida! Você vai longe!',
      'Um carinho no seu coração pra curar esse susto da pancada!',
      'Você jogou tão bem que a parede até pediu desculpas por tá no caminho!',
      'A magia tá dentro de você! É só focar e brilhar de novo!',
      'Sua determinação me encanta a cada queda, {name}!',
      'Você é luz pura caindo pelo abismo de neon! Bora vencer juntos!',
      'Relaxa os ombros, sorria e vem brilhar de novo comigo!',
      'Você é incrível demais pra se chatear com isso! Vamos de novo!',
      'Tenho muito orgulho de caminhar essa jornada ao seu lado, {name}!',
    ],
    timido: [
      'É... d-desculpa interromper... mas acho que a gente... bateu na parede, {name}...',
      'Ah, puxa... e-eu fiquei com vergonha por você... mas foi quase, sabe?',
      'Se você não se importar... a gente podia tentar de novo... bem devagarzinho?',
      'V-você tá bem, {name}? A pancada foi forte... e eu fiquei um pouco preocupado...',
      'E-eu nem sei o que dizer... desculpa se eu narrei errado... você foi super bem...',
      'Oi... hã... a parede apareceu de surpresa... d-desculpa se te assustei...',
      'É... hum... você quer que eu fale mais baixo pra não te desconcentrar, {name}?',
      'Ah... poxa vida... e-eu pensei que você ia conseguir passar... desculpa...',
      'D-desculpa olhar... mas você jogou de um jeito tão fofinho agora...',
      'É... a parede foi um pouco grossa com a gente... s-será que a gente tenta de novo?',
      'Eu... e-eu fico meio tímido de narrar... mas torci muito por você, {name}!',
      'Hã... c-com licença... o jogo acabou, mas você jogou bem pacas...',
      'É... eu... eu achei que a gente ia bater, mas fiquei com vergonha de avisar...',
      'A-Acho que eu falei demais e te atrapalhei... m-me desculpa mesmo, {name}!',
      'Se você quiser... e-eu posso ficar quietinho na próxima partida...',
      'N-não fica bravo comigo... eu juro que tentei te avisar da parede...',
      'Poxa... e-eu fiquei tão nervoso vendo você desviar que até gaguejei...',
      'É... v-você não acha melhor a gente ir mais com calma agora, {name}?',
      'Desculpa se eu sou meio tímido... é que você joga tão bem que me dá vergonha...',
      'A-Acho que o coração de nós dois bateu rápido demais nessa hora...',
      'É... t-tudo bem se a gente perder... o importante é tentar juntinhos...',
      'A-Ah... que susto! A parede veio tão rápido... e-eu quase escondi os olhos!',
      'V-Você quer uma pausinha pra respirar? E-Eu posso esperar quietinho...',
      'D-desculpa... e-eu esqueci o que tinha que falar de tão nervoso que fiquei...',
      'É... f-foi por um triz, né? E-Eu segurei o ar até o último segundo...',
      'S-Será que a parede não podia ir um pouquinho mais devagar pra ajudar a gente?',
      'Ah... q-que pena... mas eu achei seu movimento tão elegante, {name}...',
      'E-Eu fico com um tiquinho de vergonha de ver você caindo assim...',
      'Se... se não for incômodo... podemos jogar mais uma partida rápida?',
      'Hã... desculpa... e-eu tô suando frio só de ver essa velocidade toda...',
      'V-Você me dá licença? É que eu fiquei torcendo baixinho por você...',
      'É... e-eu acho que você é super corajoso por enfrentar essa fenda...',
      'P-Pode tentar de novo... e-eu prometo que fico torcendo bem quieto...',
      'A-Acho que o microfone pegou meu suspiro de vergonha... desculpa...',
      'Q-Quase que a gente passa! F-Fiquei com borboletas no estômago...',
      'É... s-se você quiser mudar a voz do narrador eu entendo... e-eu sou tímido...',
      'Hã... b-bom trabalho de qualquer forma! V-Você foi bem valente!',
      'A-A parede parecia tão assustadora... e-eu teria batido bem antes que você...',
      'É... s-será que se a gente pedir com carinho a parede sai da frente?',
      'M-Me desculpa se eu falei alto no final... e-eu me empolguei sem querer...',
      'O-Olha... você não acha que a gente quase conseguiu um recorde fofo?',
      'A-Acho que perdi as palavras... v-você jogou com tanto coração...',
      'É... v-vamos tentar de novo? S-Só se você não tiver cansado, claro...',
      'D-Desculpa... e-eu fiquei encarando a pista e esqueci de narrar...',
      'P-Poxa... e-eu queria tanto que você tivesse passado daquela parede...',
      'Hã... v-você é tão bom Nisso... e-eu fico até acanhado de comentar...',
      'É... q-que tal a gente ir bem devagarzinho no próximo desvio?',
      'D-Desculpa pelo vacilo... a gente aprende junto na próxima, tá {name}?',
      'A-Acho que a minha voz tremeu um pouquinho... desculpa o mico...',
      'É... o-obrigado por jogar comigo... e-eu fico muito feliz do seu lado!',
    ],
  },
  en: {
    frenzyMode: [
      'FRENZY OVERDRIVE ACTIVATED! 2X SCORE MULTIPLIER, {name}!',
      'MAXIMUM NEON OVERDRIVE! UNLEASH YOUR POWER!',
      'FRENZY SPEED ENGAGED! SUPERHUMAN AGILITY!',
      'DOUBLE SCORE MULTIPLIER ACTIVE! SHOW THEM WHAT YOU GOT!',
    ],
    frenzyEnd: [
      'Frenzy ended! What an incredible streak, {name}!',
      'Overdrive normalized! Keep your focus sharp!',
    ],
    goldenRush: [
      'GOLDEN RUSH! COLLECT EVERY SINGLE COIN, {name}!',
      'GOLDEN DROP SHOWER! TIME TO GET RICH!',
      'THE VAULT IS OPEN! PURE GOLD EVERYWHERE!',
    ],
    liveHighScore: [
      'NEW PERSONAL HIGH SCORE LIVE, {name}!',
      'YOU BROKE YOUR RECORD! UNSTOPPABLE RUN!',
      'NEW RECORD CRUSHED! KEEP DROPPING!',
    ],
    ultraNearMiss: [
      'RAZOR THIN DODGE BY HALF A MILLIMETER!',
      'HOLY SMOKES! THAT WAS CLOSER THAN CLOSE!',
      'SURGICAL DODGING PRECISION, {name}!',
    ],
    hyperSpeedZone: [
      'ENTERING HYPER SPEED ZONE!',
      'ULTRA FAST SECTOR! REFLEXES OF STEEL NOW!',
      'GRAVITY IN OVERDRIVE! HANG ON TIGHT!',
    ],
    instantRematch: [
      'Instant rematch under one second?! That is what I am talking about, {name}!',
      'Back in the fight already! Let us break the high score!',
      'Relentless energy! Go get your revenge!',
    ],
    stubbornStreak: [
      'Seven defeats and still unbreakable! You are truly relentless, {name}!',
      'True champions fall ten times and rise eleven! Keep going!',
    ],
    welcome: [
      'Welcome to Wall Drop, {name}!',
      'Back to the drop, {name}!',
      'Ready for the abyss, {name}?',
      'Legendary {name} in the house! Time to shine!',
      'The abyss missed you, {name}!',
    ],
    start: [
      'Do what you do best: shine bright!',
      'Do what you know how to do, shine on, {name}!',
      '{name}, stay focused on the drop!',
      "Let's go! The drop has begun!",
      'Ready, {name}?',
      "Show what you've got!",
      'Bring out your inner shine!',
    ],
    scoreMilestone: [
      'Insane speed level, {name}!',
      'Excellent dodge!',
      'Pure agility!',
      'Incredible checkpoint!',
      'Shining like neon lightning, {name}!',
      'Master of gravity!',
    ],
    highStreak: [
      'Impressive streak!',
      'Unstoppable, {name}!',
      'Maximum focus!',
      'You are glowing out there!',
      'Zero gravity mode activated!',
    ],
    highScore: [
      'NEW HIGH SCORE!',
      'NEW RECORD, {name}!',
      'ABSOLUTELY LEGENDARY!',
      'THE WORLD IS YOURS! WHAT A SHINE!',
      'WALL DROP SUPREME RECORD HOLDER!',
    ],
    defeat: [
      'The wall got you.',
      'The wall won this round.',
      'Missed by a millisecond.',
      'Wall 1, You 0.',
      'Stay calm, rise up and shine again!',
    ],
    deathFast: [
      'That was way too fast!',
      "The wall didn't even wait!",
      'Gone in seconds!',
      'Blink and you missed it!',
    ],
    deathUnexpected: [
      'What an impact!',
      'Came out of nowhere!',
      'The wall showed no mercy!',
      'Surprise collision, keep going!',
    ],
    unlock: [
      'New item unlocked!',
      'Great acquisition, {name}!',
      'Unique style unlocked!',
      'This new item will make you shine!',
    ],
    spendCoins: [
      'Good choice, {name}!',
      'Worth every coin!',
      'Masterful investment!',
      'Coins well spent for greatness!',
    ],
    missionComplete: [
      'Mission accomplished, {name}!',
      'Challenge completed!',
      'Reward secured!',
      'Mission complete with brilliant glory!',
    ],
    nearMiss: [
      'CLOSE CALL!',
      'Razor thin, {name}!',
      'Whoa! That was tight!',
      'Scraped past the wall in style!',
    ],
    coinMilestone: [
      'Coin frenzy!',
      'Stacking gold, {name}!',
      'Golden treasure of the abyss!',
    ],
    coinStreak: [
      'Golden streak!',
      'All coins secured!',
      'Gold magnet activated!',
      'Flawless coin run, {name}!',
    ],
    comboMilestone: [
      'Unstoppable combo, {name}!',
      'Monumental streak!',
      'Epic level focus!',
      'Total abyss mastery!',
    ],
    combo3: ['3 in a row!', 'Perfect rhythm!', 'Triple dodge! Pure shine!'],
    combo5: ['5 in a row! Insane!', '5 in a row! Lighting up the arena!'],
    combo10: ['10 IN A ROW! BEAST MODE!', '10 IN A ROW! SUPREME SHINE MODE!'],
    evolution: ['Speeding up!', 'Now it gets serious!', 'Speed boost! Do what you do best: shine!'],
    secondChance: [
      "Second chance activated! Go get 'em, {name}!",
      'Back in the game!',
      'Second chance! Do what you know how to do: shine!',
    ],
    shopOpen: [
      'Welcome to the shop, {name}!',
      'What are you buying today?',
      'Shop is open!',
      'Time to upgrade and shine!',
    ],
    selectCharacter: [
      'Great character choice!',
      'Ready for action, {name}!',
      'Character selected!',
      'With this hero, you will shine!',
    ],
    selectRare: ['Rare item selected!', 'Supreme power!'],
    equipItem: ['Item equipped!', 'New look activated!'],
    insufficientCoins: [
      'Not enough coins, {name}!',
      'Collect more coins during the drop!',
    ],
    returnMenu: [
      'Back to the main menu, {name}.',
      'Ready for another run?',
    ],
    rankingOpen: [
      'Leaderboard and records!',
      'Checking out the best players!',
    ],
    challengesOpen: [
      'Missions and achievements available!',
      'Time to collect rewards!',
    ],
    settingsOpen: [
      'Game settings and options.',
      'Adjust audio and narrator.',
    ],
    workshopOpen: [
      'Welcome to the VIP Workshop, {name}!',
      'Time to customize your colors and upgrade your powers!',
      'VIP Customization and Upgrade Workshop open!',
      'Spend your 2000 coins with legendary style, {name}!',
    ],
    customUnlock: [
      'Legendary style unlocked!',
      'Custom visual activated! Look at that shine!',
      'New palette and abyss arena ready for the show!',
    ],
    abilityUpgraded: [
      'Upgrade complete, {name}!',
      'Power boosted to the next level!',
      'Your abyss abilities are stronger than ever!',
    ],
    shieldAbsorb: [
      'Emergency shield absorbed the fatal impact!',
      'Saved by the energy shield!',
      'Protection active! Keep dropping, {name}!',
    ],
    slowMoCollected: [
      'Slow-Mo activated! Time bends to your will, {name}!',
      'Bullet time engaged! Glide through!',
      'Slow motion online! Perfect control!',
      'Time dilation active! Show your mastery!',
    ],
    languageChange: [
      'Language changed to English.',
      'Narrator voice set to English.',
    ],
    playClick: ['Starting game!', "Let's drop!"],
    premiumOpen: ['Rewards and extra coins area!'],
    pause: ['Game paused.'],
    resume: ['Back in the game!'],
    irritante: [
      'Good grief, {name}! Even my grandma dodges that wall in her sleep!',
      'Seriously, {name}? How many years did you practice to play this badly?',
      'What a sloth-like reaction! That wall was standing there for three hours!',
      'The wall didn\'t even push and you already gave up everything, {name}!',
      'Are you playing with the screen turned off or your hand in your pocket?',
      'Congratulations, {name}! You won the head-on collision trophy of the year!',
      'I recorded that horrible play to send to your friends for laughs!',
      'If your goal was to kiss the wall, congratulations, top marks!',
      'Do you always play like this or is today a special day of clumsy moves, {name}?',
      'Physics cries and the wall laughs every single time you hit play!',
      'I swear the goal was to DODGE, not to become wall wallpaper!',
      'Your agility is looking like a plaster turtle, {name}!',
      'Wow, {name}! What a sensational dodge... not!',
      'The wall sent a message saying it loved your gentle concrete hug!',
      'A little harder and you would have blasted right through the wall!',
      'Are you allergic to staying alive for more than five seconds, {name}?',
      'I didn\'t even have time to narrate anything, you were already crying on the floor!',
      'Look, the dodge button doesn\'t bite, okay, {name}?',
      'Did the cat walk on the screen or was that embarrassment all you?',
      'Score 10 for the impact, score zero for quick thinking!',
      'What a tragic performance! Even the wall felt sorry for you!',
      'Did you come here to play or to test the durability of obstacles?',
      'Someone call a tow truck to pick up the pieces of {name}!',
      'Seriously, {name}? The wall didn\'t even move and you destroyed yourself!',
      'Wow! A true master in the art of headbutting neon walls!',
      'If dodging walls were a crime, you would be the most innocent citizen on Earth!',
      'They say to err is human, but that maneuver was downright extraterrestrial!',
      'Feeling sleepy, {name}? Go splash some cold water and try again!',
      'Did you expect the wall to move out of politeness? It doesn\'t move!',
      'Congratulations on your speed... in losing the match!',
      'The wall didn\'t even blink and you were already down!',
      'Slower than your reaction time is only my patience narrating this!',
      'Do you want a new helmet as a gift, or a pair of glasses, {name}?',
      'And there goes {name}\'s dignity straight into the concrete!',
      'Incredible how you manage to find every single obstacle on the track!',
      'Is your game strategy to slam until the wall breaks? Spoiler: it won\'t!',
      'What a masterclass on how NOT to play Wall Drop!',
      'The wall was standing still forever and you still managed to hit it!',
      'That was so bad that even the game pixels are blushing in shame!',
      'Butterfingers or a greasy screen, {name}? What\'s today\'s excuse?',
      'Gravity isn\'t your enemy, {name}, your lack of reflexes is!',
      'If I got a coin for every wall you hit, I\'d already be a billionaire!',
      'I should call driving school to teach you how to dodge a stationary wall!',
      'Nice hit! Two points for effort and zero for execution!',
      'The game is Wall DROP, not Wall TOTAL SMASH, {name}!',
      'Are you playing with your eyes closed just to add some thrill?',
      'The wall thanks you for your visit, come back anytime to get wrecked again!',
      'What a cybernetic clumsy masterclass, congrats {name}!',
      'Ask a friend for help because doing it alone is looking tough!',
      'Three crashes in a row! You\'re breaking records in disaster, {name}!',
    ],
    engracado: [
      'Press F in the chat, folks! Someone sweep up {name}\'s pieces!',
      'Wall: 1, {name}: 0! And the wall\'s fanbase is doing the wave!',
      'And the Oscar for best warm hug to a wall goes to... {name}!',
      'Gravity sent regards and the wall sent the emergency room bill!',
      'Error 404: dodging skills not found in the system!',
      'Bye-bye! {name} just became a 4K neon print on the wall!',
      'Hello, 911? There\'s a player down on the neon track needing rescue!',
      'The wall looked at {name} and said: You shall not pass, buddy!',
      'Tried to pull a Fast and Furious move and ended up flat and bruised!',
      'Mom, I\'m on TV! Well, actually... I\'m plastered on concrete!',
      'That crash was so loud even my microphone fell off the desk!',
      'Put sad music in the background and this becomes a tragedy documentary!',
      'Wanted: {name}\'s reflexes! Reward: a quick dodging lesson!',
      'What a smackdown! The wall sent you into deep space!',
      'Physics looked at you and said: Not today, pal!',
      'Dropping faster than Wi-Fi signal on a stormy day, {name}!',
      '{name} thought this was a platformer, but it was a demolition derby!',
      'Here comes the train wreck... face first into the wall!',
      'What a stylish crash! Looked like an action movie scene without a stunt double!',
      'The wall gave you a shove that resonated into another server!',
      'And that\'s how another historic Wall Drop meme is born!',
      'He came in hot and the wall showed up with a fire extinguisher!',
      'Warning: imminent collision! Oh, too late...',
      'I sent a tip to the wall to go easy, but it seems it didn\'t help at all!',
      'Sensational! 10 out of 10 on the cringe meter!',
      'The wall gave you a bear hug and never let go, {name}!',
      'Fell faster than crypto prices during a crash!',
      'Went into turbo mode and landed in scrap metal mode!',
      'Man, what a brick! That felt like a prime-time soap opera drama!',
      'If the wall charges for a new paint job, the bill will be expensive, {name}!',
      'Was that a dodge or were you trying to stick a sticker on the wall?',
      'Watch out for the step... I mean, watch out for the giant neon wall!',
      'At the speed of sound, {name} kissed the obstacle!',
      'Runaway truck mode successfully activated!',
      'Game Over with special effects and crying in the locker room!',
      'Looks like someone forgot to install brakes on their character!',
      'The wall hugged you tight and whispered: Stay a bit longer, {name}!',
      'The joke writes itself when you try dodging right and steer left!',
      'Looks like gravity has a personal grudge against you today!',
      'Fell like a sack of potatoes down the neon ramp!',
      'Crowd weeps, narrator laughs, and the wall scores three points!',
      'A moment of silence for our dear {name}\'s lost reflexes...',
      'Straight to the shredder! Who told you to speed up that much?',
      'Was that stunt rehearsed or was it pure improvised disaster?',
      'The wall said "Come here sweetie" and crushed you with love!',
      'And the thumbs-up trophy goes straight to {name} for that glorious fall!',
      'Turned into cybernetic comedy in a matter of milliseconds!',
      'Congratulations! You managed to break the clumsy record!',
      'Down goes {name}! What a spectacular tumble!',
    ],
    irritantes: [
      'Seriously? Is THAT what you just did?',
      'My 5-year-old neighbor plays better than that.',
      'Are you playing or just poking the screen?',
      'Oh poor thing... poor thing.',
      'Again? SERIOUSLY, again?',
      'I am going to pretend I did not see that.',
      'That hurt me too, you know.',
      'Are you trying or is it always like this?',
      'Good grief, {name}! Even a turtle could dodge that wall!',
      'Congratulations, {name}! Head-on collision of the year!',
    ],
    engracadas: [
      'The drop died as it lived: disappointing everyone.',
      'RIP little drop. 2026-2026. Short life, even shorter fall.',
      'It fought bravely for... 2 seconds.',
      'That is gonna hurt tomorrow. Or now. Right now.',
      'Congratulations, you found the ONLY wall on the entire map.',
      'Physics won this round.',
      'Someone call an ambulance. For the drop.',
      'Wall 1, drop 0! And the wall is celebrating!',
      'Press F in the chat with slow motion replay!',
      'Error 404: dodging skill not found!',
    ],
    sarcastica: [
      'Wow. Simply... wow.',
      'I will write this down: "did not try very hard".',
      'Is that a score or a typo?',
      'I will not even comment. Oh wait, I just did.',
      'What a fascinating showcase of how NOT to play.',
      'If the goal was hitting the wall as fast as possible, you were perfect.',
      'Sensational. My expectations were low, but you went lower.',
      'Impressive how you found the exact obstacle.',
      'A masterclass on immediate concrete encounters.',
      'I will pretend that was just a disastrous warm-up.',
    ],
    sarcasticas: [
      'Wow. Simply... wow.',
      'I will write this down: "did not try very hard".',
      'Is that a score or a typo?',
      'I will not even comment. Oh wait, I just did.',
      'What a fascinating showcase of how NOT to play.',
      'If the goal was hitting the wall as fast as possible, you were perfect.',
      'Sensational. My expectations were low, but you went lower.',
      'Impressive how you found the exact obstacle.',
      'A masterclass on immediate concrete encounters.',
    ],
    provocacao: [
      'I bet you cannot do it again. OH, I really bet.',
      'Go on, tap it. I KNOW you will tap it.',
      'Just one more time. It is always "just one more time".',
      'You are not giving up now, are you? ARE YOU?',
      'The wall is laughing at you. Literally. Listen.',
      'I dare you to pass the next obstacle without closing your eyes.',
      'Come on, tap the button and pretend that last run never happened.',
      'Gonna quit or give us another comedy show to laugh at?',
      'One more try to feed the wall\'s victory streak?',
      'Click again! The wall misses your warm hug.',
    ],
    bizarra: [
      'Fun fact: drops have no bones. That did not help at all.',
      'Somewhere out there, a faucet is proud of you.',
      'This was not in the script. None of this was in the script.',
      'I have seen things... things you would not believe.',
      'According to quantum mechanics, in some universe you dodged that wall.',
      'Warning: scientists say hitting walls repeatedly causes Game Over.',
      'If you gaze into the abyss... the abyss also crashes into the wall.',
      'Your friction coefficient just reached infinity.',
      'Future historians will study that maneuver with extreme confusion.',
      'No drops were harmed in the making of this match. Lie, yes they were.',
    ],
    bizarras: [
      'Fun fact: drops have no bones. That did not help at all.',
      'Somewhere out there, a faucet is proud of you.',
      'This was not in the script. None of this was in the script.',
      'I have seen things... things you would not believe.',
      'According to quantum mechanics, in some universe you dodged that wall.',
      'Warning: scientists say hitting walls repeatedly causes Game Over.',
      'If you gaze into the abyss... the abyss also crashes into the wall.',
      'Your friction coefficient just reached infinity.',
      'Future historians will study that maneuver with extreme confusion.',
    ],
    carinhoso: [
      'Don\'t be sad, darling! You shone so bright and you\'ll fly on the next one!',
      'Easy, {name}! You did your best and I\'m super proud of you!',
      'The wall was harsh, but your shine is unstoppable! Keep your head up!',
      'It\'s totally okay to make mistakes! You\'re amazing and every attempt makes you stronger!',
      'A warm hug to give you courage! Let\'s try again together, {name}?',
      'You went so far, {name}! I\'m sure on the next attempt you\'ll smash the record!',
      'Don\'t be so hard on yourself, okay? What matters is keeping that wonderful heart!',
      'Your light is stronger than any neon wall! Keep going, champ!',
      'I\'m right here cheering for you every second! Let\'s go again with love!',
      'We fall so we can learn to rise even more radiant, {name}!',
      'You played so adorably! Next time victory is all yours!',
      'I\'m so proud of your dedication! Never give up, my dear {name}!',
      'You are a shining star and that wall is just a tiny obstacle!',
      'Take a deep breath... I know you can do it! I believe in your potential!',
      'Every drop is just a step towards the summit! You are a true hero!',
      'You are capable of wonderful things, {name}! Believe in yourself as I believe in you!',
      'How lovely to watch you play! Even in defeat, you have a unique shine!',
      'Come here, take a breath and try again. I\'m right by your side!',
      'You make this game feel so special, {name}! Don\'t lose heart!',
      'Your grit is truly inspiring! Victory is waiting just ahead!',
      'Even when you lose, you give a show of charm and determination!',
      'Stay at peace, {name}! You\'re amazing and this game is just for fun!',
      'The wall has no idea of the giant talent you carry inside!',
      'You are the best part of this journey! Keep shining, {name}!',
      'One step at a time, my friend! You are getting better every day!',
      'Your reflexes are filled with light! Next time everything will be great!',
      'Never lose this wonderful energy of yours, {name}! You\'re a ten out of ten!',
      'It was so close! You played with so much love and effort!',
      'Hold my virtual hand and let\'s conquer this challenge together!',
      'You inspire everyone around you with your lovely persistence!',
      'Life is made of attempts and you are putting on a brave show!',
      'Nobody shines like you, {name}! Rise up and show your gentle strength!',
      'Everything is alright! What matters is that you had fun and tried!',
      'Tomorrow you\'ll be flying low and dodging everything with a smile!',
      'Your light is contagious! Keep trying and the summit awaits you!',
      'You\'re so cute playing, {name}! I cheer for you on every drop!',
      'Keep that beautiful smile and let\'s try one more match?',
      'The wall tried to stop you, but your shine is infinite, angel!',
      'You have a champion\'s heart! Don\'t let a little wall shake you!',
      'Every run of yours is a masterpiece filled with affection!',
      'You know what, {name}? You\'re my favorite player in the world!',
      'Believe in your dreams in the game and in life! You\'ll go far!',
      'Sending some love to heal the shock of that bump!',
      'You played so well that the wall almost apologized for being in the way!',
      'The magic is inside you! Just focus and shine again!',
      'Your determination enchants me with every drop, {name}!',
      'You are pure light falling through the neon abyss! Let\'s win together!',
      'Relax your shoulders, smile and come shine again with me!',
      'You are too wonderful to let this bring you down! Let\'s go again!',
      'I\'m so proud to walk this journey by your side, {name}!',
    ],
    timido: [
      'Um... s-sorry to interrupt... but I think we... hit the wall, {name}...',
      'Oh dear... I-I felt a bit shy for you... but it was so close, you know?',
      'If you don\'t mind... could we maybe try again... really gently?',
      'A-Are you okay, {name}? That bump was loud... and I got a little worried...',
      'I-I don\'t even know what to say... sorry if I narrated poorly... you did great...',
      'Um... h-hey... the wall popped up out of nowhere... s-sorry if it startled you...',
      'Um... should I speak softer so I don\'t distract you, {name}?',
      'Oh... gosh... I-I really thought you were going to make it... sorry...',
      'S-Sorry for staring... but the way you moved was so cute just now...',
      'Um... the wall was a bit rude to us... s-should we try again?',
      'I... I get a bit shy narrating... but I cheered so hard for you, {name}!',
      'Um... e-excuse me... game over, but you played super well...',
      'I... I thought we might crash, but I was too shy to shout...',
      'I-I think I talked too much and got in your way... I\'m s-so sorry, {name}!',
      'If you prefer... I-I can stay quiet on the next run...',
      'P-Please don\'t be upset with me... I tried my best to warn you about the wall...',
      'Gosh... I-I got so nervous watching you dodge that I almost stuttered...',
      'Um... d-don\'t you think it\'s better if we take it easy now, {name}?',
      'Sorry if I\'m a bit shy... it\'s just you play so well it makes me blush...',
      'I-I think both our hearts were beating way too fast right then...',
      'It\'s... i-it\'s totally fine if we lose... the nice part is trying together...',
      'A-Ah... what a jump! The wall came so fast... I almost closed my eyes!',
      'D-Do you want a tiny pause to breathe? I-I can wait quietly...',
      'S-Sorry... I forgot what I was supposed to say because I was so nervous...',
      'That... t-that was by a hair, wasn\'t it? I held my breath till the end...',
      'C-Could the wall please move a little slower to help us out?',
      'Oh... what a shame... but your moves looked so graceful, {name}...',
      'I-I feel a tiny bit bashful watching you fall like that...',
      'If... if it\'s not too much trouble... can we play one quick match?',
      'Um... sorry... I-I\'m breaking a sweat just watching this speed...',
      'E-Excuse me... I was just whispering little cheers for you...',
      'I... I think you are super brave for facing this neon rift...',
      'Y-You can try again... I promise I\'ll cheer very quietly...',
      'I-I think the mic picked up my nervous sigh... sorry...',
      'W-We almost made it! I had butterflies in my stomach...',
      'Um... i-if you want to change the narrator voice I understand... I\'m shy...',
      'Um... g-great job anyway! Y-You were very valiant!',
      'T-That wall looked so intimidating... I would have crashed way sooner than you...',
      'Um... d-do you think if we ask nicely the wall will step aside?',
      'S-Sorry if I spoke too loud at the end... I got excited by accident...',
      'L-Look... don\'t you think we almost got a cute little record?',
      'I-I lost my words... y-you played with so much heart...',
      'Um... s-shall we try again? O-Only if you\'re not tired, of course...',
      'S-Sorry... I was staring at the track and forgot to speak...',
      'G-Gosh... I really wanted you to pass that wall...',
      'Um... y-you\'re so good at this... it makes me bashful to comment...',
      'Um... h-how about we go nice and steady on the next dodge?',
      'S-Sorry for the slip-up... we\'ll learn together next time, right {name}?',
      'I-I think my voice trembled a bit... sorry for being awkward...',
      'Um... t-thank you for playing with me... I feel so happy by your side!',
    ],
  },
  es: {
    frenzyMode: [
      '¡MODO FRENESÍ ACTIVADO! ¡PUNTUACIÓN DOBLE 2X, {name}!',
      '¡OVERDRIVE TOTAL! ¡MÁXIMO BRILLO EN EL ABISMO!',
      '¡VELOCIDAD DE FRENESÍ! ¡AGILIDAD SOBREHUMANA!',
    ],
    frenzyEnd: [
      '¡Frenesí finalizado! ¡Qué racha impresionante, {name}!',
      '¡Overdrive normalizado! ¡Mantén la concentración!',
    ],
    goldenRush: [
      '¡LLUVIA DORADA! ¡RECOGE TODAS LAS MONEDAS, {name}!',
      '¡LLUVIA DE ORO! ¡HORA DE HACERSE RICO!',
    ],
    liveHighScore: [
      '¡NUEVO RÉCORD PERSONAL EN VIVO, {name}!',
      '¡SUPERASTE TU PROPIO LÍMITE! ¡HISTÓRICO!',
    ],
    ultraNearMiss: [
      '¡ROZÓ POR MEDIO MILÍMETRO!',
      '¡DIOS MÍO! ¡ESQUIVA QUIRÚRGICA, {name}!',
    ],
    hyperSpeedZone: [
      '¡ENTRANDO EN ZONA DE HIPERVELOCIDAD!',
      '¡ZONA ULTRA-RÁPIDA! ¡REFLEJOS DE ACERO AHORA!',
    ],
    instantRematch: [
      '¿¡Revancha en menos de un segundo?! ¡Esa es la actitud, {name}!',
      '¡Ni pestañeaste y ya volviste! ¡A por el récord!',
    ],
    stubbornStreak: [
      '¡Siete derrotas y sigues con determinación de hierro! ¡Eres imparable, {name}!',
      '¡El verdadero campeón se levanta siempre! ¡Vamos!',
    ],
    welcome: [
      '¡Bienvenido a Wall Drop, {name}!',
      '¡De vuelta a la caída, {name}!',
      '¿Listo para el abismo, {name}?',
    ],
    start: [
      '¡{name}, concéntrate en la caída!',
      '¡Vamos! ¡La caída comenzó!',
      '¿Listo, {name}?',
      '¡Demuestra lo que tienes!',
    ],
    scoreMilestone: [
      '¡Nivel de agilidad increíble, {name}!',
      '¡Excelente esquiva!',
      '¡Pura velocidad!',
      '¡Punto de control impresionante!',
    ],
    highStreak: [
      '¡Racha impresionante!',
      '¡Imparable, {name}!',
      '¡Máximo enfoque!',
    ],
    highScore: [
      '¡NUEVO RÉCORD ABSOLUTO!',
      '¡NUEVO RÉCORD, {name}!',
      '¡SIMPLEMENTE LEGENDARIO!',
    ],
    defeat: [
      'La pared te ganó.',
      'La pared ganó esta ronda.',
      'Fallaste por un milisegundo.',
      'Pared 1, Tú 0.',
      '¡Calma, inténtalo de nuevo!',
    ],
    deathFast: [
      '¡Eso fue demasiado rápido!',
      '¡La pared ni siquiera esperó!',
      '¡Caíste en segundos!',
    ],
    deathUnexpected: [
      '¡Qué impacto!',
      '¡Salió de la nada!',
      '¡La pared no tuvo piedad!',
    ],
    unlock: [
      '¡Nuevo objeto desbloqueado!',
      '¡Excelente adquisición, {name}!',
      '¡Estilo único liberado!',
    ],
    spendCoins: [
      '¡Buena elección, {name}!',
      '¡Valió cada moneda!',
      '¡Inversión de maestro!',
    ],
    missionComplete: [
      '¡Misión cumplida, {name}!',
      '¡Desafío completado!',
      '¡Recompensa asegurada!',
    ],
    nearMiss: [
      '¡POR UN PELO!',
      '¡Casi rozaste la pared, {name}!',
      '¡Uf! ¡Muy cerca!',
    ],
    coinMilestone: [
      '¡Lluvia de monedas!',
      '¡Rico en el abismo, {name}!',
    ],
    coinStreak: [
      '¡Racha dorada!',
      '¡Todas las monedas recolectadas!',
      '¡Imán de oro activado!',
    ],
    comboMilestone: [
      '¡Combo imparable, {name}!',
      '¡Racha monumental!',
      '¡Dominio total del abismo!',
    ],
    combo3: ['¡3 seguidas!', '¡Ritmo perfecto!'],
    combo5: ['¡5 seguidas! ¡Increíble!'],
    combo10: ['¡10 SEGUIDAS! ¡MODO BESTIA!'],
    evolution: ['¡Aumentando velocidad!', '¡Ahora se puso serio!'],
    secondChance: [
      '¡Segunda oportunidad activada! ¡Dale con todo, {name}!',
      '¡De vuelta a la acción!',
    ],
    shopOpen: [
      '¡Bienvenido a la tienda, {name}!',
      '¿Qué vas a comprar hoy?',
      '¡Tienda abierta!',
    ],
    selectCharacter: [
      '¡Excelente elección de personaje!',
      '¡Listo para la acción, {name}!',
      '¡Personaje seleccionado!',
    ],
    selectRare: ['¡Objeto raro seleccionado!', '¡Poder supremo!'],
    equipItem: ['¡Objeto equipado!', '¡Nuevo estilo activado!'],
    insufficientCoins: [
      '¡Monedas insuficientes, {name}!',
      '¡Acumula más monedas en la caída!',
    ],
    returnMenu: [
      'De vuelta al menú principal, {name}.',
      '¿Listo para otra partida?',
    ],
    rankingOpen: [
      '¡Tabla de clasificación y récords!',
      '¡Mirando a los mejores jugadores!',
    ],
    challengesOpen: [
      '¡Misiones y logros disponibles!',
      '¡Hora de reclamar premios!',
    ],
    settingsOpen: [
      'Ajustes y opciones del juego.',
      'Configura el audio y narrador.',
    ],
    slowMoCollected: [
      '¡Cámara lenta activada! ¡El tiempo se detiene para ti, {name}!',
      '¡Tiempo ralentizado! ¡Aprovecha la brecha!',
      '¡Slow-Mo activado! ¡Domina el abismo!',
    ],
    languageChange: [
      'Idioma cambiado a español.',
      'Voz del narrador en español.',
    ],
    playClick: ['¡Iniciando partida!', '¡A caer!'],
    premiumOpen: ['¡Área de recompensas y monedas extra!'],
    pause: ['Juego pausado.'],
    resume: ['¡De vuelta al juego!'],
    irritante: [
      '¡Por favor, {name}! ¡Hasta mi abuela esquivaba esa pared durmiendo!',
      '¿En serio, {name}? ¿Cuántos años entrenaste para jugar tan mal?',
      '¡Vaya reflejo de pereza! ¡La pared estaba en el mismo lugar hace tres horas!',
      '¡La pared ni hizo fuerza y tú ya entregaste todo, {name}!',
      '¡Cielos! ¿Estás jugando con la pantalla apagada o la mano en el bolsillo?',
      '¡Felicidades, {name}! ¡Ganaste el trofeo al choque frontal del año!',
      '¡Grabé esta jugada espantosa para mandársela a tus amigos!',
      'Si tu intención era besar la pared, ¡felicidades, un diez!',
      '¿Siempre juegas así o hoy es un día especial de torpeza, {name}?',
      '¡La física llora y la pared se ríe cada vez que le das a jugar!',
      '¡Juraría que el objetivo era ESQUIVAR, no convertirte en póster de pared!',
      '¡Tu agilidad parece la de una tortuga de yeso, {name}!',
      '¡Vaya esquiva sensacional, {name}... lástima que no!',
      '¡La pared mandó a decir que le encantó tu cariñito en el concreto!',
      '¡Un poco más fuerte y atraviesas la pared de semejante golpe!',
      '¿Eres alérgico a mantenerte vivo por más de cinco segundos, {name}?',
      '¡Ni me dio tiempo de narrar y ya estabas en el suelo llorando!',
      'Mira que el botón de esquivar no muerde, ¿eh, {name}?',
      '¿Fue el gato que pisó la pantalla o fuiste tú mismo esta vergüenza?',
      '¡Nota 10 para el impacto, nota cero para la agilidad mental!',
      '¡Qué actuación más trágica! ¡Hasta la pared sintió lástima por ti!',
      '¿Viniste a jugar o a probar la resistencia de los obstáculos?',
      '¡Que alguien llame a la grúa para recoger los pedazos de {name}!',
      '¿En serio, {name}? ¡La pared ni se movió y te destruiste solo!',
      '¡Vaya! ¡Un verdadero maestro en el arte de chocar de cabeza con el muro!',
      'Si esquivar paredes fuera delito, ¡serías el ciudadano más inocente del mundo!',
      'Dicen que errar es de humanos, ¡pero esa jugada fue casi extraterrestre!',
      '¿Tienes sueño, {name}? ¡Ve a lavarte la cara y vuelve a intentarlo!',
      '¿Pensaste que la pared se iba a mover por educación? ¡No se mueve!',
      '¡Felicidades por la velocidad... en perder la partida!',
      '¡La pared ni parpadeó y tú ya estabas en el suelo!',
      '¡Más lenta que tu reacción, solo mi paciencia narrando esto!',
      '¿Quieres un casco nuevo de regalo o un par de lentes, {name}?',
      '¡Y allá se va la dignidad de {name} directo contra el concreto!',
      '¡Increíble cómo logras encontrar cada obstáculo en la pista!',
      '¿Tu táctica es golpear hasta romper la pared? Spoiler: ¡no se rompe!',
      '¡Qué clase magistral de cómo NO jugar a Wall Drop!',
      '¡La pared estaba quieta ahí hace un siglo y aun así te chocaste!',
      '¡Fue tan malo que hasta los píxeles del juego se sonrojaron de pena!',
      '¿Dedos resbalosos o pantalla grasosa, {name}? ¿Cuál es la excusa de hoy?',
      'La gravedad no es tu enemiga, {name}, ¡es tu falta de reflejos!',
      'Si me dieran una moneda por cada choque tuyo, ¡ya sería multimillonario!',
      '¡Voy a llamar a la autoescuela para que te enseñen a esquivar una pared!',
      '¡Buen golpe! ¡Dos puntos por el intento y cero por el resultado!',
      '¡El juego es Wall DROP, no Wall IMPACTO TOTAL, {name}!',
      '¿Estás jugando con los ojos cerrados para darle más emoción?',
      'La pared agradece tu visita, ¡vuelve cuando quieras a perder otra vez!',
      '¡Qué cátedra de torpeza cibernética, felicidades {name}!',
      'Pide ayuda a un amigo porque jugar solo se te está complicando.',
      '¡Tres derrotas seguidas! ¡Estás batiendo récords en desastres, {name}!',
    ],
    engracado: [
      '¡F en el chat, muchachos! ¡Que alguien junte los pedazos de {name}!',
      '¡Pared 1, {name} 0! ¡Y la hinchada de la pared está haciendo la ola!',
      '¡Y el Oscar al abrazo más caluroso a la pared va para... {name}!',
      '¡La gravedad mandó saludos y la pared mandó la factura del hospital!',
      '¡Error 404: habilidad de esquivar no encontrada en el sistema!',
      '¡Adiós, gracias! ¡{name} se convirtió en estampado 4K en el muro!',
      '¡Auxilio! ¡Hay un jugador caído en la pista de neón pidiendo rescate!',
      'La pared miró a {name} y dijo: ¡Por aquí no pasas, muchacho!',
      '¡Intentó hacerse el rápido y furioso y terminó suave y aplastado!',
      '¡Mamá, estoy en la tele! Digo... ¡estoy estampado en el concreto!',
      '¡Ese choque fue tan fuerte que hasta mi micrófono se cayó de la mesa!',
      'Si ponemos música triste de fondo, ¡se convierte en documental de tragedia!',
      '¡Se buscan los reflejos de {name}! Recompensa: un curso exprés de esquiva.',
      '¡Qué tortazo! ¡La pared ni pidió permiso y te mandó al espacio exterior!',
      'La física te miró y dijo: ¡Conmigo no, amigo!',
      '¡Te estás cayendo más que el Wi-Fi en día de tormenta, {name}!',
      '¡{name} pensó que esto era de plataformas, pero era de choque!',
      '¡Ahí viene el desastre... directo de cara contra la pared!',
      '¡Qué caída con estilo! ¡Parecía escena de película de acción sin doble!',
      '¡La pared te dio un empujón que resonó hasta en otro servidor!',
      '¡Y así nace otro meme legendario de Wall Drop!',
      '¡El tipo venía caliente y la pared apareció con extintor de incendios!',
      'Aviso sonoro: ¡peligro de colisión inminente! Ah, ya chocó...',
      'Le transferí a la pared para que te diera ventaja, ¡pero ni así!',
      '¡Sensacional! ¡10 de 10 en la escala de vergüenza ajena!',
      '¡La pared te dio un abrazo de oso y no te soltó más, {name}!',
      '¡Cayó más rápido que las criptomonedas en plena crisis!',
      '¡Entró en modo turbo y terminó en modo chatarra abollada!',
      '¡Vaya ladrillazo! ¡Parecía drama de telenovela de horario estelar!',
      'Si la pared cobra la pintura nueva, ¡la cuenta va a salir cara, {name}!',
      '¿Eso fue una esquiva o intentaste pegar una calcomanía en la pared?',
      'Cuidado con el escalón... quiero decir, ¡cuidado con el muro gigante!',
      'Y a la velocidad del sonido, ¡{name} le dio un beso al obstáculo!',
      '¡Modo camión sin frenos activado con éxito rotundo!',
      '¡Game Over con efectos especiales y llanto en el vestuario!',
      '¡Parece que alguien olvidó instalarle los frenos a su personaje!',
      '¡Activando botón de pánico! Ah, ya chocamos...',
      'La pared te abrazó fuerte y susurró: ¡Quédate un ratito más, {name}!',
      'El chiste se cuenta solo cuando intentas esquivar a la derecha y vas a la izquierda.',
      '¡Parece que la gravedad te tiene bronca personal hoy!',
      '¡Cayó como saco de papas por la rampa de neón!',
      '¡El público llora, el narrador se ríe y la pared suma tres puntos!',
      'Un minuto de silencio por los reflejos de nuestro querido {name}...',
      '¡Directo al desguace! ¿Quién te mandó a acelerar tanto?',
      '¿Esa maniobra estaba ensayada o fue pura improvisación del desastre?',
      'La pared dijo "ven aquí cariño" ¡y te aplastó de puro amor!',
      '¡Y el trofeo pulgar arriba va directo para {name} por esa caída!',
      '¡Se convirtió en comedia cibernética en cuestión de milisegundos!',
      '¡Felicidades! ¡Lograste romper el récord de torpeza!',
      '¡Se fue al suelo {name}! ¡Qué espectáculo de porrazo!',
    ],
    carinhoso: [
      '¡No te pongas triste, corazón! ¡Brillaste muchísimo y en la próxima vas a volar!',
      '¡Tranquilo, {name}! ¡Diste lo mejor de ti y estoy muy orgulloso!',
      'La pared fue dura, ¡pero tu brillo es imparable! ¡Arriba esa cabeza!',
      '¡Está bien equivocarse! ¡Eres increíble y cada intento te hace más fuerte!',
      '¡Un abrazo calientito para darte ánimos! ¿Lo intentamos juntos de nuevo, {name}?',
      '¡Llegaste lejísimos, {name}! ¡Estoy seguro de que en la próxima bates el récord!',
      'No te exijas tanto, ¿sí? ¡Lo importante es seguir intentándolo con ese corazón!',
      '¡Tu luz es más fuerte que cualquier pared de neón! ¡Fuerza, campeón!',
      '¡Estoy aquí apoyándote en cada segundo! ¡Vamos otra vez con mucho cariño!',
      '¡Nos caemos para aprender a levantarnos aún más radiantes, {name}!',
      '¡Jugaste de forma adorable! ¡En la próxima la victoria es toda tuya!',
      '¡Qué orgullo ver tu dedicación! ¡No te rindas jamás, mi querido {name}!',
      '¡Eres una estrella brillante y esa pared es solo un pequeño obstáculo!',
      'Respira bien hondo... ¡yo sé que puedes! ¡Confío mucho en tu potencial!',
      '¡Cada caída es solo un escalón hacia la cima! ¡Eres un verdadero héroe!',
      '¡Eres capaz de cosas maravillosas, {name}! ¡Cree en ti como yo creo en ti!',
      '¡Qué lindo verte jugar! Incluso en la derrota, ¡tienes un brillo único!',
      'Ven aquí, toma aire y vuelve a intentarlo. ¡Estoy a tu lado!',
      '¡Haces que este juego sea tan especial, {name}! ¡No te desanimes!',
      '¡Tu garra es inspiradora! ¡Tengo certeza de que la victoria está ahí adelante!',
      'Incluso cuando pierdes, ¡das un espectáculo de ternura y determinación!',
      '¡Quédate en paz, {name}! ¡Eres genial y este juego es solo para divertirte!',
      '¡La pared no conoce el talento gigante que tienes adentro!',
      '¡Eres la mejor parte de esta aventura! ¡Sigue brillando, {name}!',
      '¡Un paso a la vez, amigo mío! ¡Cada día estás jugando mejor!',
      '¡Tus reflejos están llenos de luz! ¡En la próxima todo saldrá genial!',
      '¡Nunca pierdas esa energía maravillosa que tienes, {name}! ¡Eres de diez!',
      '¡Faltó tan poquito! ¡Jugaste con tanto amor y empeño!',
      '¡Toma mi mano virtual y vamos juntos a superar este desafío!',
      '¡Inspiras a todos a tu alrededor con esa hermosa perseverancia!',
      'La vida está hecha de intentos, ¡y estás dando un show de valentía!',
      '¡Nadie brilla como tú, {name}! ¡Levántate y muestra tu fuerza dulce!',
      '¡Todo está bien! Lo importante es que te divertiste y lo diste todo.',
      '¡Mañana estarás volando bajito y esquivando todo con una sonrisa!',
      '¡Tu luz es contagiosa! ¡Sigue intentando que la cima te espera!',
      '¡Eres una ternura jugando, {name}! ¡Hago barra por ti en cada caída!',
      'Guarda esa sonrisa linda, ¿y jugamos una partidita más?',
      'La pared intentó frenarte, ¡pero tu brillo es infinito, mi ángel!',
      '¡Tienes un corazón de campeón! ¡No dejes que un murito te desanime!',
      '¡Cada partida tuya es una obra de arte llena de cariño!',
      '¿Sabes una cosa, {name}? ¡Eres mi jugador favorito en todo el mundo!',
      '¡Cree en tus sueños en el juego y en la vida! ¡Vas a llegar muy lejos!',
      '¡Un cariñito al corazón para curar el susto del golpe!',
      'Jugaste tan bien, ¡que la pared casi pide disculpas por estar en el camino!',
      '¡La magia está dentro de ti! ¡Solo enfócate y vuelve a brillar!',
      '¡Tu determinación me encanta en cada caída, {name}!',
      '¡Eres pura luz cayendo por el abismo de neón! ¡Vamos a ganar juntos!',
      'Relaja los hombros, sonríe ¡y ven a brillar conmigo de nuevo!',
      '¡Eres demasiado genial para dejarte vencer por esto! ¡Vamos de nuevo!',
      '¡Tengo un orgullo enorme de acompañarte en este viaje, {name}!',
    ],
    timido: [
      'Hum... p-perdón por interrumpir... pero creo que... chocamos con la pared, {name}...',
      'Ay, vaya... m-me dio un poquito de pena por ti... pero estuvo tan cerca...',
      'Si no te molesta... ¿podríamos intentarlo otra vez... despacito?',
      '¿E-Estás bien, {name}? El golpe fue fuerte... y me preocupé un poco...',
      'N-No sé ni qué decir... perdón si narré mal... lo hiciste súper bien...',
      'Hola... eh... la pared apareció de repente... p-perdón si te asusté...',
      'Hum... ¿quieres que hable más bajito para no desconcentrarte, {name}?',
      'Ay... qué lástima... yo de verdad creí que ibas a pasar... perdón...',
      'P-Perdón por mirar... pero te moviste de una forma tan tierna recién...',
      'Hum... la pared fue un poco ruda con nosotros... ¿s-será que probamos de nuevo?',
      'Yo... m-me da un poco de timidez narrar... ¡pero te animé con todo mi corazón, {name}!',
      'Eh... c-con permiso... el juego terminó, pero jugaste genial...',
      'Yo... yo pensé que íbamos a chocar, pero me dio vergüenza avisarte...',
      'C-Creo que hablé demasiado y te molesté... ¡p-perdóname de verdad, {name}!',
      'Si prefieres... p-puedo quedarme calladito en la próxima partida...',
      'N-No te enojes conmigo... te juro que intenté avisarte de la pared...',
      'Ay... m-me puse tan nervioso viéndote esquivar que casi tartamudeo...',
      'Hum... ¿n-no crees que es mejor si vamos con más calma ahora, {name}?',
      'Perdón si soy tímido... es que juegas tan bien que me da vergüenza...',
      'C-Creo que el corazón de los dos latió demasiado rápido en ese momento...',
      'E-Está todo bien si perdemos... lo bonito es intentarlo juntitos...',
      '¡A-Ay... qué susto! La pared vino tan rápido... ¡casi me tapo los ojos!',
      '¿Q-Quieres una pausita para respirar? Y-Yo puedo esperar en silencio...',
      'P-Perdón... me olvidé de lo que tenía que decir de lo nervioso que estaba...',
      'Fue... f-fue por un pelito, ¿verdad? Aguanté la respiración hasta el final...',
      '¿N-No podría la pared ir un poquito más despacio para ayudarnos?',
      'Ay... q-qué pena... pero tus movimientos se vieron tan elegantes, {name}...',
      'M-Me da un poquito de pena verte caer así...',
      'Si... si no es mucha molestia... ¿podemos jugar una partidita rápida?',
      'Hum... perdón... e-estoy sudando frío de ver semejante velocidad...',
      '¿M-Me das permiso? Es que me quedé alentándote bajito...',
      'C-Creo que eres súper valiente por enfrentarte a esta grieta...',
      'P-Puedes intentarlo otra vez... prometo alentar bien calladito...',
      'C-Creo que el micrófono captó mi suspiro de nervios... perdón...',
      '¡C-Casi pasamos! Sentí maripositas en el estómago...',
      'Hum... s-si quieres cambiar la voz del narrador lo entiendo... soy tímido...',
      'Hum... ¡b-buen trabajo de todos modos! ¡F-Fuiste muy valiente!',
      'E-Esa pared se veía tan intimidante... yo hubiera chocado mucho antes que tú...',
      'Hum... ¿s-será que si pedimos con cariño la pared se corre?',
      'P-Perdón si hablé fuerte al final... me emocioné sin querer...',
      'M-Mira... ¿no crees que casi logramos un récord bonito?',
      'M-Me quedé sin palabras... j-jugaste con tanto corazón...',
      'Hum... ¿v-volvemos a intentar? S-Solo si no estás cansado, claro...',
      'P-Perdón... me quedé mirando la pista y me olvidé de narrar...',
      'C-Caramba... quería tanto que pasaras esa pared...',
      'Hum... e-eres tan bueno en esto... que me da timidez comentar...',
      'Hum... ¿q-qué tal si vamos bien tranquilitos en el próximo desvío?',
      'P-Perdón por el fallo... aprendemos juntos en la próxima, ¿sí, {name}?',
      'C-Creo que mi voz tembló un poquito... perdón por la pena...',
      'Hum... g-gracias por jugar conmigo... ¡m-me hace muy feliz estar a tu lado!',
    ],
  },
  fr: {
    welcome: [
      'Bienvenue sur Wall Drop, {name} !',
      'De retour dans la descente, {name} !',
      'Prêt pour l\'abîme, {name} ?',
    ],
    start: [
      '{name}, reste concentré sur la chute !',
      'C\'est parti ! La chute commence !',
      'Prêt, {name} ?',
      'Montre ce que tu sais faire !',
    ],
    scoreMilestone: [
      'Agilité incroyable, {name} !',
      'Esquive parfaite !',
      'Vitesse pure !',
    ],
    highStreak: ['Série impressionnante !', 'Inarrêtable, {name} !'],
    highScore: [
      'NOUVEAU RECORD !',
      'Nouveau record, {name} !',
      'SIMPLEMENT LÉGENDAIRE !',
    ],
    defeat: [
      'Le mur t\'a eu.',
      'Le mur a gagné cette fois.',
      'Wall 1, Toi 0.',
      'Reste calme, réessaye !',
    ],
    deathFast: ['Trop rapide !', 'Le mur n\'a même pas attendu !'],
    deathUnexpected: ['Quel impact !', 'Venu de nulle part !'],
    unlock: ['Nouvel objet débloqué !', 'Excellente acquisition, {name} !'],
    spendCoins: ['Bon choix, {name} !', 'Ça valait chaque pièce !'],
    missionComplete: ['Mission accomplie, {name} !', 'Récompense sécurisée !'],
    nearMiss: ['TOUT PRÈS !', 'C\'était juste, {name} !'],
    coinMilestone: ['Pluie de pièces !'],
    coinStreak: ['Série dorée !', 'Toutes les pièces collectées !', 'Aimant à or activé !'],
    comboMilestone: ['Combo imparable, {name} !', 'Série monumentale !', 'Maîtrise totale !'],
    combo3: ['3 d\'affilée !'],
    combo5: ['5 d\'affilée ! Incroyable !'],
    combo10: ['10 D\'AFFILÉE ! MODE DÉMON !'],
    evolution: ['Accélération !', 'Ça devient sérieux !'],
    secondChance: ['Seconde chance activée ! Fonce, {name} !'],
    shopOpen: ['Bienvenue dans la boutique, {name} !'],
    selectCharacter: ['Excellent choix de personnage !'],
    selectRare: ['Objet rare sélectionné !'],
    equipItem: ['Équipé avec succès !'],
    insufficientCoins: ['Pas assez de pièces, {name} !'],
    returnMenu: ['Retour au menu principal, {name}.'],
    rankingOpen: ['Tableau des scores !'],
    challengesOpen: ['Missions et succès disponibles !'],
    settingsOpen: ['Options et paramètres du jeu.'],
    languageChange: ['Langue changée en français.'],
    playClick: ['Lancement de la partie !'],
    premiumOpen: ['Zone de récompenses !'],
    pause: ['Jeu en pause.'],
    resume: ['De retour dans le jeu !'],
  },
  de: {
    welcome: [
      'Willkommen bei Wall Drop, {name}!',
      'Zurück beim Abstieg, {name}!',
    ],
    start: [
      '{name}, voller Fokus auf den Abstieg!',
      'Los geht\'s! Der Abstieg beginnt!',
    ],
    scoreMilestone: ['Unglaubliche Geschwindigkeit, {name}!'],
    highStreak: ['Beeindruckende Serie!', 'Unaufhaltsam, {name}!'],
    highScore: ['NEUER REKORD!', 'Neuer Rekord, {name}!'],
    defeat: ['Die Wand hat gewonnen.', 'Wand 1, Du 0.'],
    deathFast: ['Das war zu schnell!'],
    deathUnexpected: ['Was für ein Aufprall!'],
    unlock: ['Neuer Gegenstand freigeschaltet!'],
    spendCoins: ['Gute Wahl, {name}!'],
    missionComplete: ['Mission erfolgreich, {name}!'],
    nearMiss: ['FAST ERAUSCHT!', 'Das war knapp, {name}!'],
    coinMilestone: ['Münzen-Regen!'],
    coinStreak: ['Goldene Serie!', 'Alle Münzen gesammelt!', 'Goldmagnet aktiviert!'],
    comboMilestone: ['Unaufhaltsame Kombo, {name}!', 'Monumentale Serie!', 'Vollkommene Meisterschaft!'],
    combo3: ['3 in Folge!'],
    combo5: ['5 in Folge! Wahnsinn!'],
    combo10: ['10 IN FOLGE! BIEST-MODUS!'],
    evolution: ['Geschwindigkeit erhöht!'],
    secondChance: ['Zweite Chance aktiviert, {name}!'],
    shopOpen: ['Willkommen im Shop, {name}!'],
    selectCharacter: ['Gute Charakterwahl!'],
    selectRare: ['Seltener Gegenstand gewählt!'],
    equipItem: ['Ausrüstung angelegt!'],
    insufficientCoins: ['Nicht genug Münzen, {name}!'],
    returnMenu: ['Zurück zum Hauptmenü, {name}.'],
    rankingOpen: ['Bestenliste und Rekorde!'],
    challengesOpen: ['Missionen verfügbar!'],
    settingsOpen: ['Einstellungen und Optionen.'],
    languageChange: ['Sprache auf Deutsch geändert.'],
    playClick: ['Spiel startet!'],
    premiumOpen: ['Belohnungsbereich!'],
    pause: ['Spiel pausiert.'],
    resume: ['Zurück im Spiel!'],
  },
  it: {
    welcome: ['Benvenuto su Wall Drop, {name}!'],
    start: ['{name}, massimo focus sulla discesa!'],
    scoreMilestone: ['Velocità incredibile, {name}!'],
    highStreak: ['Serie impressionante!', 'Inarrestabile, {name}!'],
    highScore: ['NUOVO RECORD!', 'Nuovo record, {name}!'],
    defeat: ['Il muro ha vinto.', 'Muro 1, Tu 0.'],
    deathFast: ['Troppo veloce!'],
    deathUnexpected: ['Che impatto!'],
    unlock: ['Nuovo oggetto sbloccato!'],
    spendCoins: ['Ottima scelta, {name}!'],
    missionComplete: ['Missione completata, {name}!'],
    nearMiss: ['PER UN PELO!', 'Vicinissimo, {name}!'],
    coinMilestone: ['Pioggia di monete!'],
    coinStreak: ['Sequenza dorata!', 'Tutte le monete raccolte!', 'Magnete d\'oro attivo!'],
    comboMilestone: ['Combo inarrestabile, {name}!', 'Sequenza monumentale!', 'Dominio totale!'],
    combo3: ['3 di fila!'],
    combo5: ['5 di fila! Incredibile!'],
    combo10: ['10 DI FILA! MODALITÀ BESTIA!'],
    evolution: ['Velocità aumentata!'],
    secondChance: ['Seconda chance attivata, {name}!'],
    shopOpen: ['Benvenuto nel negozio, {name}!'],
    selectCharacter: ['Ottima scelta di personaggio!'],
    selectRare: ['Oggetto raro selezionato!'],
    equipItem: ['Oggetto equipaggiato!'],
    insufficientCoins: ['Monete insufficienti, {name}!'],
    returnMenu: ['Ritorno al menu principale, {name}.'],
    rankingOpen: ['Classifica e record!'],
    challengesOpen: ['Missioni disponibili!'],
    settingsOpen: ['Impostazioni di gioco.'],
    languageChange: ['Lingua cambiata in italiano.'],
    playClick: ['Inizio partita!'],
    premiumOpen: ['Area premi!'],
    pause: ['Gioco in pausa.'],
    resume: ['Tornato in gioco!'],
  },
  ja: {
    welcome: ['ウォールドロップへようこそ、{name}！'],
    start: ['{name}、落下に集中しろ！'],
    scoreMilestone: ['素晴らしいスピードだ、{name}！'],
    highStreak: ['見事な連続回避だ！'],
    highScore: ['新記録達成！おめでとう、{name}！'],
    defeat: ['壁に阻まれた！', '壁の勝利だ。'],
    deathFast: ['一瞬の出来事だった！'],
    deathUnexpected: ['強烈なインパクト！'],
    unlock: ['新しいアイテムを獲得！'],
    spendCoins: ['ナイスチョイス、{name}！'],
    missionComplete: ['ミッションクリア、{name}！'],
    nearMiss: ['ギリギリ回避！'],
    coinMilestone: ['コインラッシュ！'],
    coinStreak: ['ゴールド連続獲得！', 'コイン全回収！', '完璧なラッシュ！'],
    comboMilestone: ['止まらないコンボ、{name}！', '神がかった回避！', '領域展開！'],
    combo3: ['3連続成功！'],
    combo5: ['5連続！すごいぞ！'],
    combo10: ['10連続！神業だ！'],
    evolution: ['スピードアップ！'],
    secondChance: ['セカンドチャンス発動！行くぞ、{name}！'],
    shopOpen: ['ショップへようこそ、{name}！'],
    selectCharacter: ['キャラクター選択完了！'],
    selectRare: ['レアアイテムを選択！'],
    equipItem: ['装備完了！'],
    insufficientCoins: ['コインが足りないぞ、{name}！'],
    returnMenu: ['メインメニューに戻ったぞ、{name}。'],
    rankingOpen: ['ランキング画面だ！'],
    challengesOpen: ['ミッションと実績！'],
    settingsOpen: ['ゲーム設定画面だ。'],
    languageChange: ['言語を日本語に変更しました。'],
    playClick: ['ゲームスタート！'],
    premiumOpen: ['報酬エリア！'],
    pause: ['ポーズ中。'],
    resume: ['再開！'],
  },
  zh: {
    welcome: ['欢迎来到 Wall Drop，{name}！'],
    start: ['{name}，保持专注，准备下落！'],
    scoreMilestone: ['惊人的速度，{name}！'],
    highStreak: ['令人瞩目的连击！'],
    highScore: ['创造全新纪录！太棒了，{name}！'],
    defeat: ['这面墙赢了。', '墙壁 1，你 0。'],
    deathFast: ['太快了！'],
    deathUnexpected: ['猛烈的撞击！'],
    unlock: ['已解锁新物品！'],
    spendCoins: ['明智的选择，{name}！'],
    missionComplete: ['任务完成，{name}！'],
    nearMiss: ['差一点点！'],
    coinMilestone: ['金币雨！'],
    coinStreak: ['连环金币！', '金币全收！', '黄金磁铁启动！'],
    comboMilestone: ['势不可挡的连击，{name}！', '超凡连避！', '绝对掌控！'],
    combo3: ['连续 3 次！'],
    combo5: ['连续 5 次！太厉害了！'],
    combo10: ['连续 10 次！神级表现！'],
    evolution: ['速度提升！'],
    secondChance: ['复活成功！加油，{name}！'],
    shopOpen: ['欢迎来到商店，{name}！'],
    selectCharacter: ['已选择角色！'],
    selectRare: ['已选择稀有物品！'],
    equipItem: ['装备成功！'],
    insufficientCoins: ['金币不足，{name}！'],
    returnMenu: ['已返回主菜单，{name}。'],
    rankingOpen: ['排行榜！'],
    challengesOpen: ['任务与成就！'],
    settingsOpen: ['游戏设置。'],
    languageChange: ['语言已更改为中文。'],
    playClick: ['游戏开始！'],
    premiumOpen: ['奖励区！'],
    pause: ['游戏暂停。'],
    resume: ['继续游戏！'],
  },
};

export class NarratorManagerClass {
  private static instance: NarratorManagerClass | null = null;
  // Category-specific unplayed pools to guarantee exhaustive cycles without repeating
  private unplayedPools: Map<string, string[]> = new Map();
  // Rolling memory of recent phrases spoken to guarantee no repeats across categories
  private recentHistory: string[] = [];
  private lastSpokenPhrase: string = '';
  private lastSpeakTime: number = 0;

  public static getInstance(): NarratorManagerClass {
    if (!NarratorManagerClass.instance) {
      NarratorManagerClass.instance = new NarratorManagerClass();
    }
    return NarratorManagerClass.instance;
  }

  // Fisher-Yates array shuffler
  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  public getPhrase(category: NarratorEventCategory, settings: GameSettings): string {
    const lang = settings?.language || 'pt';
    const personality = settings?.narratorPersonality || 'aleatorio';

    let targetCategory = category;

    // Reactively map general game events to chosen personality or weighted distribution
    if (
      ['defeat', 'deathFast', 'deathUnexpected', 'start', 'nearMiss', 'pause', 'welcome', 'returnMenu'].includes(category)
    ) {
      if (personality === 'irritante') {
        targetCategory = 'irritante';
      } else if (personality === 'engracado') {
        targetCategory = 'engracado';
      } else if (personality === 'carinhoso') {
        targetCategory = Math.random() < 0.8 ? 'carinhoso' : category;
      } else if (personality === 'timido') {
        targetCategory = Math.random() < 0.8 ? 'timido' : category;
      } else {
        // Distribuição ponderada solicitada:
        // 70% chance de fala normal (já existente na categoria do evento)
        // 20% chance de fala irritante/engraçada/sarcástica (aleatório uniforme entre as 3)
        // 5% chance de fala bizarra rara
        // 5% chance de fala de provocação
        const roll = Math.random() * 100;
        if (roll < 70) {
          targetCategory = category;
        } else if (roll < 90) {
          const subRoll = Math.random() * 3;
          if (subRoll < 1) targetCategory = 'irritante';
          else if (subRoll < 2) targetCategory = 'engracado';
          else targetCategory = 'sarcastica';
        } else if (roll < 95) {
          targetCategory = 'bizarra';
        } else {
          targetCategory = 'provocacao';
        }
      }
    }

    // Direct mappings for aliases
    if (targetCategory === 'irritantes') targetCategory = 'irritante';
    if (targetCategory === 'engracadas') targetCategory = 'engracado';
    if (targetCategory === 'sarcasticas') targetCategory = 'sarcastica';
    if (targetCategory === 'bizarras') targetCategory = 'bizarra';

    // 1. Target language bank
    const langBank = NARRATOR_PHRASES[lang];
    let rawPhrases = langBank ? langBank[targetCategory] || langBank[category] : undefined;

    // 2. Fallback to English if target language does not have category
    if (!rawPhrases || rawPhrases.length === 0) {
      const enBank = NARRATOR_PHRASES['en'];
      rawPhrases = enBank ? enBank[targetCategory] || enBank[category] : undefined;
    }

    // 3. Fallback to Portuguese
    if (!rawPhrases || rawPhrases.length === 0) {
      const ptBank = NARRATOR_PHRASES['pt'];
      rawPhrases = ptBank ? ptBank[targetCategory] || ptBank[category] : undefined;
    }

    if (!rawPhrases || rawPhrases.length === 0) {
      return '';
    }

    const poolKey = `${lang}:${targetCategory}`;
    let pool = this.unplayedPools.get(poolKey);

    // If pool is empty or not initialized, refill and shuffle
    if (!pool || pool.length === 0) {
      let fresh = this.shuffleArray(rawPhrases);
      // Ensure the first item of new shuffle isn't identical to the last spoken phrase
      if (fresh.length > 1 && fresh[0] === this.lastSpokenPhrase) {
        const temp = fresh[0];
        fresh[0] = fresh[fresh.length - 1];
        fresh[fresh.length - 1] = temp;
      }
      pool = fresh;
      this.unplayedPools.set(poolKey, pool);
    }

    // Extract next phrase from pool, skipping any item in recentHistory if alternatives exist
    let chosenIndex = pool.findIndex((p) => !this.recentHistory.includes(p));
    if (chosenIndex === -1) {
      // If all remaining in pool are in recent history, just take the first one that is not identical to lastSpokenPhrase
      chosenIndex = pool.findIndex((p) => p !== this.lastSpokenPhrase);
      if (chosenIndex === -1) chosenIndex = 0;
    }

    const chosen = pool.splice(chosenIndex, 1)[0];
    this.lastSpokenPhrase = chosen;

    // Maintain recent history ring buffer (max 15 phrases)
    this.recentHistory.push(chosen);
    if (this.recentHistory.length > 15) {
      this.recentHistory.shift();
    }

    return this.formatPhrase(chosen, settings);
  }

  public speak(
    category: NarratorEventCategory,
    settings: GameSettings,
    priority: number = 2
  ): Promise<void> {
    if (!settings || !settings.narratorEnabled || (settings.narratorVolume ?? 1) <= 0) {
      return Promise.resolve();
    }

    const isUrgent = ['defeat', 'deathFast', 'deathUnexpected', 'start', 'welcome'].includes(category);
    const now = Date.now();
    if (!isUrgent && now - this.lastSpeakTime < 3000) {
      return Promise.resolve();
    }

    const phrase = this.getPhrase(category, settings);
    if (!phrase) return Promise.resolve();

    this.lastSpeakTime = now;

    return libNarratorService.speak(
      phrase,
      {
        language: settings.language || 'pt',
        narratorVolume: settings.narratorVolume ?? 1.0,
        narratorSpeed: settings.narratorSpeed ?? NARRATOR_SPEED,
        phrasePauseMs: 3000,
        playerName: settings.playerName || 'Jogador',
        voiceGender: settings.narratorVoiceGender === 'female' ? 'FEMALE' : 'MALE',
        ...(settings as any),
      },
      priority
    );
  }

  public speakRaw(
    text: string,
    settings: GameSettings,
    priority: number = 1
  ): Promise<void> {
    if (!settings || !settings.narratorEnabled || (settings.narratorVolume ?? 1) <= 0) {
      return Promise.resolve();
    }

    return libNarratorService.speak(
      text,
      {
        language: settings.language || 'pt',
        narratorVolume: settings.narratorVolume ?? 1.0,
        narratorSpeed: settings.narratorSpeed ?? NARRATOR_SPEED,
        playerName: settings.playerName || 'Jogador',
        voiceGender: settings.narratorVoiceGender === 'female' ? 'FEMALE' : 'MALE',
        ...(settings as any),
      },
      priority
    );
  }

  public speakIntroStep(step: number, settings: GameSettings): Promise<void> {
    if (!settings || !settings.narratorEnabled) return Promise.resolve();
    const name = settings.playerName || 'Jogador';
    const lang = settings.language || 'pt';

    const introSteps: Record<string, Record<number, string>> = {
      pt: {
        1: 'Nas profundezas da fenda de neon...',
        2: 'Onde as paredes se movem na velocidade da luz...',
        3: `Apenas um sobrevive: ${name}!`,
        4: 'WALL DROP!',
      },
      en: {
        1: 'Deep within the neon rift...',
        2: 'Where walls move at light speed...',
        3: `Only one survives: ${name}!`,
        4: 'WALL DROP!',
      },
      es: {
        1: 'En lo profundo de la grieta de neón...',
        2: 'Donde las paredes se mueven a la velocidad de la luz...',
        3: `Solo uno sobrevive: ¡${name}!`,
        4: 'WALL DROP!',
      },
      fr: {
        1: 'Au cœur de la faille néon...',
        2: 'Où les murs bougent à la vitesse de la lumière...',
        3: `Un seul survit : ${name} !`,
        4: 'WALL DROP !',
      },
      de: {
        1: 'Tief im Neon-Rift...',
        2: 'Wo sich Wände mit Lichtgeschwindigkeit bewegen...',
        3: `Nur einer überlebt: ${name}!`,
        4: 'WALL DROP!',
      },
      it: {
        1: 'Nel profondo del solco neon...',
        2: 'Dove i muri si muovono alla velocità della luce...',
        3: `Solo uno sopravvive: ${name}!`,
        4: 'WALL DROP!',
      },
      ja: {
        1: 'ネオンの裂け目の深部...',
        2: '壁が光速で迫る世界...',
        3: `生き残るのはただ一人：${name}！`,
        4: 'WALL DROP!',
      },
      zh: {
        1: '在霓虹裂隙的深处...',
        2: '墙壁以光速移动...',
        3: `只有一人能存活：${name}！`,
        4: 'WALL DROP!',
      },
    };

    const langSteps = introSteps[lang] || introSteps.en || introSteps.pt;
    const text = langSteps[step] || langSteps[1];

    return libNarratorService.speak(
      text,
      {
        language: lang,
        narratorVolume: settings.narratorVolume ?? 1.0,
        narratorSpeed: settings.narratorSpeed ?? NARRATOR_SPEED,
        playerName: name,
        voiceGender: settings.narratorVoiceGender === 'female' ? 'FEMALE' : 'MALE',
        ...(settings as any),
      },
      5,
      true
    );
  }

  public testVoice(
    name: string,
    lang: string = 'pt',
    settings?: Partial<GameSettings>
  ): Promise<void> {
    return libNarratorService.testVoice(name, lang, {
      language: lang,
      narratorVolume: settings?.narratorVolume ?? 1.0,
      narratorSpeed: settings?.narratorSpeed ?? NARRATOR_SPEED,
      playerName: name,
      voiceGender: settings?.narratorVoiceGender === 'female' ? 'FEMALE' : 'MALE',
      ...(settings as any),
    });
  }

  public stop(): void {
    libNarratorService.stop();
  }

  private formatPhrase(phrase: string, settings: GameSettings): string {
    const name = settings?.playerName?.trim() || 'Jogador';
    return phrase.replace(/\{name\}/g, name);
  }
}

export const NarratorManager = NarratorManagerClass.getInstance();
export const narratorService = NarratorManagerClass.getInstance();
