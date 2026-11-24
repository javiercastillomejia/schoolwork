/**
 * Los 74 verbos irregulares de la hoja de clase, en el mismo orden y con las
 * mismas semanas (7 verbos por semana; la semana 11 tiene 4).
 *
 * El past participle se omite a propósito: de momento solo se estudian el
 * infinitivo, el past simple y el significado.
 */

export type FamilyId =
  | 'same'
  | 'ought'
  | 'toA'
  | 'toO'
  | 'ew'
  | 'shortE'
  | 'endsT'
  | 'aid'
  | 'old'
  | 'ood'
  | 'shorter'
  | 'unique';

export interface Verb {
  id: number;
  week: number;
  /** Infinitivo sin "to": "bring". */
  base: string;
  /** Formas de past simple que da la hoja. */
  past: string[];
  /** true si hay que escribir todas las formas (was/were); si no, vale cualquiera. */
  needsAll: boolean;
  /** Significado tal y como aparece en la hoja. */
  meaning: string;
  family: FamilyId;
  /** Frase de ejemplo; el past va entre llaves: "Tom {brought} a cake." */
  example: string;
  exampleEs: string;
  /** Formas correctas en inglés que la hoja no recoge (no se aceptan, pero no se enseñan como error). */
  otherValid: string[];
  /** Texto que se envía a la voz del navegador para leer el past, si difiere de la escritura. */
  pastSpeech?: string;
}

export interface Family {
  id: FamilyId;
  name: string;
  hint: string;
}

export const FAMILIES: Record<FamilyId, Family> = {
  same: { id: 'same', name: 'No cambian', hint: 'El past se escribe igual que el infinitivo.' },
  ought: { id: 'ought', name: '-ought / -aught', hint: 'Terminan en -ought o -aught.' },
  toA: { id: 'toA', name: 'La vocal pasa a A', hint: 'La vocal del infinitivo cambia a «a».' },
  toO: { id: 'toO', name: 'La vocal pasa a O', hint: 'La vocal del infinitivo cambia a «o».' },
  ew: { id: 'ew', name: 'Terminan en -ew', hint: 'El past acaba en -ew.' },
  shortE: { id: 'shortE', name: 'ee / ea → e', hint: 'La vocal larga se acorta a «e».' },
  endsT: { id: 'endsT', name: 'Terminan en -t', hint: 'El past acaba en -t en lugar de -ed.' },
  aid: { id: 'aid', name: '-ay → -aid', hint: 'Cambian -ay por -aid.' },
  old: { id: 'old', name: '-ell → -old', hint: 'Cambian -ell por -old.' },
  ood: { id: 'ood', name: '-and → -ood', hint: 'Cambian -and por -ood.' },
  shorter: { id: 'shorter', name: 'Se acortan', hint: 'El past es una versión más corta del infinitivo.' },
  unique: { id: 'unique', name: 'Únicos', hint: 'No siguen ningún patrón: hay que memorizarlos.' },
};

type Extra = { otherValid?: string[]; pastSpeech?: string };

function v(
  id: number,
  base: string,
  past: string,
  meaning: string,
  family: FamilyId,
  example: string,
  exampleEs: string,
  extra: Extra = {},
): Verb {
  const needsAll = base === 'be';
  return {
    id,
    week: Math.ceil(id / 7),
    base,
    past: past.split('/'),
    needsAll,
    meaning,
    family,
    example,
    exampleEs,
    otherValid: extra.otherValid ?? [],
    pastSpeech: extra.pastSpeech,
  };
}

export const VERBS: Verb[] = [
  // Semana 1
  v(1, 'be', 'was/were', 'ser/estar', 'unique', 'I {was} very tired yesterday.', 'Ayer estaba muy cansado.'),
  v(2, 'become', 'became', 'llegar a ser', 'toA', 'She {became} a doctor in 2020.', 'Llegó a ser médica en 2020.'),
  v(3, 'begin', 'began', 'empezar/comenzar', 'toA', 'The film {began} at eight o’clock.', 'La película empezó a las ocho.'),
  v(4, 'bite', 'bit', 'morder', 'shorter', 'The dog {bit} my shoe.', 'El perro mordió mi zapato.'),
  v(5, 'break', 'broke', 'romper', 'toO', 'I {broke} a glass in the kitchen.', 'Rompí un vaso en la cocina.'),
  v(6, 'bring', 'brought', 'traer/llevar', 'ought', 'Tom {brought} a cake to the party.', 'Tom trajo una tarta a la fiesta.'),
  v(7, 'build', 'built', 'construir', 'endsT', 'We {built} a sandcastle on the beach.', 'Construimos un castillo de arena en la playa.'),
  // Semana 2
  v(8, 'burn', 'burnt/burned', 'quemar/arder', 'endsT', 'I {burnt} my finger on the oven.', 'Me quemé el dedo con el horno.'),
  v(9, 'buy', 'bought', 'comprar', 'ought', 'My mum {bought} a new car.', 'Mi madre compró un coche nuevo.'),
  v(10, 'catch', 'caught', 'coger/atrapar', 'ought', 'The goalkeeper {caught} the ball.', 'El portero atrapó el balón.'),
  v(11, 'choose', 'chose', 'elegir/escoger', 'toO', 'I {chose} the blue T-shirt.', 'Elegí la camiseta azul.'),
  v(12, 'come', 'came', 'venir/llegar', 'toA', 'My cousins {came} to visit us.', 'Mis primos vinieron a visitarnos.'),
  v(13, 'cut', 'cut', 'cortar', 'same', 'She {cut} the pizza into eight pieces.', 'Cortó la pizza en ocho trozos.'),
  v(14, 'do', 'did', 'hacer', 'unique', 'I {did} my homework after school.', 'Hice los deberes después del cole.'),
  // Semana 3
  v(15, 'draw', 'drew', 'dibujar', 'ew', 'He {drew} a picture of his cat.', 'Dibujó a su gato.'),
  v(16, 'dream', 'dreamt', 'soñar', 'shortE', 'I {dreamt} about dinosaurs last night.', 'Anoche soñé con dinosaurios.', {
    otherValid: ['dreamed'],
  }),
  v(17, 'drink', 'drank', 'beber', 'toA', 'We {drank} orange juice at breakfast.', 'Bebimos zumo de naranja en el desayuno.'),
  v(18, 'drive', 'drove', 'conducir', 'toO', 'My dad {drove} to Madrid.', 'Mi padre condujo hasta Madrid.'),
  v(19, 'eat', 'ate', 'comer', 'unique', 'We {ate} paella on Sunday.', 'Comimos paella el domingo.'),
  v(20, 'fall', 'fell', 'caerse', 'unique', 'She {fell} off her bike.', 'Se cayó de la bici.'),
  v(21, 'feed', 'fed', 'alimentar', 'shortE', 'I {fed} the fish this morning.', 'Di de comer a los peces esta mañana.'),
  // Semana 4
  v(22, 'feel', 'felt', 'sentir', 'shortE', 'I {felt} happy after the match.', 'Me sentí feliz después del partido.'),
  v(23, 'fight', 'fought', 'luchar', 'ought', 'The two cats {fought} in the garden.', 'Los dos gatos lucharon en el jardín.'),
  v(24, 'find', 'found', 'encontrar', 'unique', 'I {found} my keys under the sofa.', 'Encontré mis llaves debajo del sofá.'),
  v(25, 'fly', 'flew', 'volar', 'ew', 'We {flew} to London last summer.', 'Volamos a Londres el verano pasado.'),
  v(26, 'forget', 'forgot', 'olvidar', 'toO', 'I {forgot} my umbrella at school.', 'Olvidé el paraguas en el colegio.'),
  v(27, 'freeze', 'froze', 'congelar/helar', 'toO', 'The lake {froze} last winter.', 'El lago se heló el invierno pasado.'),
  v(28, 'get', 'got', 'conseguir/obtener', 'toO', 'I {got} good marks in my exams.', 'Conseguí buenas notas en los exámenes.'),
  // Semana 5
  v(29, 'give', 'gave', 'dar', 'toA', 'She {gave} me a book.', 'Me dio un libro.'),
  v(30, 'go', 'went', 'ir', 'unique', 'We {went} to the cinema on Friday.', 'Fuimos al cine el viernes.'),
  v(31, 'grow', 'grew', 'crecer/cultivar', 'ew', 'The tomatoes {grew} very fast.', 'Los tomates crecieron muy rápido.'),
  v(32, 'have', 'had', 'tener/haber', 'unique', 'I {had} a dog when I was little.', 'Tenía un perro cuando era pequeño.'),
  v(33, 'hear', 'heard', 'oír', 'unique', 'I {heard} a strange noise.', 'Oí un ruido extraño.'),
  v(34, 'hide', 'hid', 'esconder', 'shorter', 'The children {hid} behind the tree.', 'Los niños se escondieron detrás del árbol.'),
  v(35, 'hit', 'hit', 'golpear/chocar', 'same', 'He {hit} the ball very hard.', 'Golpeó la pelota muy fuerte.'),
  // Semana 6
  v(36, 'hurt', 'hurt', 'herir/doler', 'same', 'I {hurt} my knee playing football.', 'Me hice daño en la rodilla jugando al fútbol.'),
  v(37, 'keep', 'kept', 'conservar/mantener', 'shortE', 'She {kept} all her old toys.', 'Conservó todos sus juguetes viejos.'),
  v(38, 'know', 'knew', 'saber/conocer', 'ew', 'I {knew} the answer!', '¡Sabía la respuesta!'),
  v(39, 'learn', 'learnt/learned', 'aprender', 'endsT', 'We {learnt} a new song in music class.', 'Aprendimos una canción nueva en clase de música.'),
  v(40, 'leave', 'left', 'dejar (abandonar)', 'shortE', 'I {left} my bag on the bus.', 'Dejé la mochila en el autobús.'),
  v(41, 'lend', 'lent', 'prestar', 'endsT', 'My friend {lent} me his pen.', 'Mi amigo me prestó su boli.'),
  v(42, 'let', 'let', 'dejar (permitir)', 'same', 'My parents {let} me stay up late.', 'Mis padres me dejaron acostarme tarde.'),
  // Semana 7
  v(43, 'lose', 'lost', 'perder', 'unique', 'Our team {lost} the match.', 'Nuestro equipo perdió el partido.'),
  v(44, 'make', 'made', 'hacer/fabricar', 'unique', 'We {made} a cake for Grandma.', 'Hicimos una tarta para la abuela.'),
  v(45, 'meet', 'met', 'encontrarse/quedar con', 'shortE', 'I {met} my friends at the park.', 'Quedé con mis amigos en el parque.'),
  v(46, 'pay', 'paid', 'pagar', 'aid', 'Dad {paid} for the tickets.', 'Papá pagó las entradas.'),
  v(47, 'put', 'put', 'poner/colocar', 'same', 'I {put} the milk in the fridge.', 'Puse la leche en la nevera.'),
  v(48, 'read', 'read', 'leer', 'same', 'I {read} a great book last week.', 'Leí un libro genial la semana pasada.', {
    pastSpeech: 'red',
  }),
  v(49, 'ride', 'rode', 'montar', 'toO', 'She {rode} a horse on holiday.', 'Montó a caballo en vacaciones.'),
  // Semana 8
  v(50, 'run', 'ran', 'correr', 'toA', 'I {ran} to the bus stop.', 'Corrí a la parada del autobús.'),
  v(51, 'say', 'said', 'decir', 'aid', 'She {said} hello to everyone.', 'Dijo hola a todo el mundo.'),
  v(52, 'see', 'saw', 'ver', 'unique', 'We {saw} a whale from the boat.', 'Vimos una ballena desde el barco.'),
  v(53, 'sell', 'sold', 'vender', 'old', 'They {sold} their old house.', 'Vendieron su casa vieja.'),
  v(54, 'send', 'sent', 'enviar', 'endsT', 'I {sent} a message to my friend.', 'Envié un mensaje a mi amigo.'),
  v(55, 'shoot', 'shot', 'disparar', 'shorter', 'The player {shot} and scored a goal.', 'El jugador disparó y marcó un gol.'),
  v(56, 'sing', 'sang', 'cantar', 'toA', 'We {sang} “Happy Birthday” to Ana.', 'Le cantamos «Cumpleaños feliz» a Ana.'),
  // Semana 9
  v(57, 'sit', 'sat', 'sentarse', 'toA', 'I {sat} next to Lucía in class.', 'Me senté al lado de Lucía en clase.'),
  v(58, 'sleep', 'slept', 'dormir', 'shortE', 'The baby {slept} all night.', 'El bebé durmió toda la noche.'),
  v(59, 'speak', 'spoke', 'hablar', 'toO', 'The teacher {spoke} to my parents.', 'La profesora habló con mis padres.'),
  v(60, 'spell', 'spelt', 'deletrear', 'endsT', 'He {spelt} his name for me.', 'Me deletreó su nombre.', {
    otherValid: ['spelled'],
  }),
  v(61, 'spend', 'spent', 'gastar', 'endsT', 'I {spent} all my money on sweets.', 'Gasté todo mi dinero en chuches.'),
  v(62, 'stand', 'stood', 'estar de pie/colocar', 'ood', 'We {stood} in the queue for an hour.', 'Estuvimos de pie en la cola una hora.'),
  v(63, 'steal', 'stole', 'robar', 'toO', 'Someone {stole} my bike!', '¡Alguien robó mi bici!'),
  // Semana 10
  v(64, 'swim', 'swam', 'nadar', 'toA', 'We {swam} in the sea every day.', 'Nadamos en el mar todos los días.'),
  v(65, 'take', 'took', 'llevarse/coger', 'unique', 'I {took} an apple from the table.', 'Cogí una manzana de la mesa.'),
  v(66, 'teach', 'taught', 'enseñar', 'ought', 'Mr Smith {taught} us maths.', 'El señor Smith nos enseñó matemáticas.'),
  v(67, 'tell', 'told', 'decir (contar)', 'old', 'Grandpa {told} us a funny story.', 'El abuelo nos contó una historia divertida.'),
  v(68, 'think', 'thought', 'pensar', 'ought', 'I {thought} the exam was easy.', 'Pensé que el examen era fácil.'),
  v(69, 'throw', 'threw', 'arrojar/lanzar', 'ew', 'He {threw} the ball to his dog.', 'Le lanzó la pelota a su perro.'),
  v(70, 'understand', 'understood', 'entender/comprender', 'ood', 'I {understood} the lesson.', 'Entendí la lección.'),
  // Semana 11
  v(71, 'wake', 'woke', 'despertar', 'toO', 'I {woke} up at seven.', 'Me desperté a las siete.'),
  v(72, 'wear', 'wore', 'llevar puesto', 'toO', 'She {wore} a red dress to the party.', 'Llevó un vestido rojo a la fiesta.'),
  v(73, 'win', 'won', 'ganar', 'unique', 'Our class {won} the competition.', 'Nuestra clase ganó el concurso.'),
  v(74, 'write', 'wrote', 'escribir', 'toO', 'I {wrote} a letter to my grandma.', 'Escribí una carta a mi abuela.'),
];

export const WEEKS: number[] = [...new Set(VERBS.map((verb) => verb.week))];

const BY_ID = new Map(VERBS.map((verb) => [verb.id, verb]));

export function getVerb(id: number): Verb {
  const verb = BY_ID.get(id);
  if (!verb) throw new Error(`Verbo desconocido: ${id}`);
  return verb;
}

export function verbsOfWeek(week: number): Verb[] {
  return VERBS.filter((verb) => verb.week === week);
}

/** "was/were" o "burnt / burned", como en la hoja. */
export function pastLabel(verb: Verb): string {
  return verb.past.join(verb.needsAll ? '/' : ' / ');
}

/** Lo que se envía a la voz del navegador para leer el past. */
export function pastSpeech(verb: Verb): string {
  return verb.pastSpeech ?? verb.past.join(', ');
}

/** Parte la frase de ejemplo en [antes, past, después]. */
export function splitExample(verb: Verb): [string, string, string] {
  const match = /^(.*)\{(.+)\}(.*)$/.exec(verb.example);
  if (!match) return [verb.example, '', ''];
  return [match[1] ?? '', match[2] ?? '', match[3] ?? ''];
}
