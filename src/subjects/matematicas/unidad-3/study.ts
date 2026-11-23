import type { StudyBlock, Topic } from '../../../core/types';

/** Los apartados del temario (Anaya, Unidad 3, páginas 34-41) y la hoja de repaso. */
export const TOPICS: Topic[] = [
  { id: 'que', emoji: '🍕', title: '¿Qué es una fracción?', subtitle: 'Numerador, denominador y tipos de fracciones' },
  { id: 'leer', emoji: '🗣️', title: 'Cómo se leen', subtitle: 'Medios, tercios, cuartos… y los -avos' },
  { id: 'dec', emoji: '🔟', title: 'Fracciones decimales', subtitle: 'Denominador 10, 100 o 1000 y números decimales' },
  { id: 'equiv', emoji: '🍫', title: 'Fracciones equivalentes', subtitle: 'Amplificar y simplificar' },
  { id: 'orden', emoji: '📏', title: 'Orden de fracciones', subtitle: 'Cuál es mayor y cómo ordenarlas' },
  { id: 'suma', emoji: '➕', title: 'Suma y resta', subtitle: 'Con el mismo y con distinto denominador' },
  { id: 'cantidad', emoji: '🧮', title: 'Fracción de una cantidad', subtitle: 'Divide entre el de abajo y multiplica por el de arriba' },
  { id: 'repaso', emoji: '📝', title: 'Hoja de repaso', subtitle: 'Chuleta y los 26 ejercicios de la hoja del cole', sheet: true },
];

export const STUDY: Record<string, StudyBlock[]> = {
  que: [
    { type: 'p', text: 'Una **fracción** indica las partes que cogemos de algo que hemos dividido en **partes iguales**. En [2/6]:' },
    { type: 'figure', figure: { kind: 'shape', shape: 'circle', parts: 6, filled: 2 }, caption: '[2/6] de una pizza: 6 trozos iguales y cogemos 2.' },
    {
      type: 'list',
      items: [
        '**Numerador** (arriba, el 2): número de partes que se toman.',
        '**Denominador** (abajo, el 6): número de partes iguales en las que se divide la unidad.',
      ],
    },
    { type: 'heading', text: 'Tipos de fracciones' },
    {
      type: 'table',
      head: ['Tipo', 'Cómo es', 'Ejemplo'],
      rows: [
        ['Propia', 'El numerador es **menor** que el denominador. Vale **menos que 1**.', '[2/6] < 1'],
        ['Impropia', 'El numerador es **mayor** que el denominador. Vale **más que 1**.', '[7/6] > 1'],
        ['Igual a la unidad', 'El numerador y el denominador son **iguales**. Vale **1**.', '[6/6] = 1'],
        ['Número mixto', 'Un número **entero** y una **fracción** juntos.', '[1 1/6]'],
      ],
    },
    { type: 'heading', text: 'Pasar de impropia a número mixto' },
    {
      type: 'p',
      text: '[7/6] = [1 1/6]. El 1 es el círculo entero (los 6 trozos de 6) y sobra 1 trozo, que es [1/6]. Las fracciones impropias se pueden pasar a mixtas **y al revés**.',
    },
    { type: 'tip', text: 'Truco: divide el numerador entre el denominador. **El cociente son los enteros** y **el resto, los trozos que sobran**: 7 : 6 = 1 y sobra 1 → [1 1/6].' },
  ],

  leer: [
    { type: 'p', text: 'Primero se dice el **numerador** como número normal (uno, dos, tres…) y luego el **denominador** así:' },
    {
      type: 'table',
      head: ['Denominador', 'Se lee', 'Ejemplo'],
      rows: [
        ['2', 'medio', '[1/2] = un medio'],
        ['3', 'tercio', '[1/3] = un tercio'],
        ['4', 'cuarto', '[1/4] = un cuarto'],
        ['5', 'quinto', '[1/5] = un quinto'],
        ['10', 'décimo', '[1/10] = un décimo'],
        ['18', 'dieciochoavo', '[1/18] = un dieciochoavo'],
      ],
    },
    {
      type: 'p',
      text: 'Del 4 en adelante se lee como número ordinal (cuarto, quinto, sexto, séptimo, octavo, noveno, décimo). A partir del 11 se añade **-avo**: onceavo, doceavo, dieciochoavo.',
    },
    { type: 'tip', text: 'En la vida diaria usamos mucho «**medio**» (la mitad de algo), «**un cuarto**» (de kilo o de litro), tercios y quintos.' },
    {
      type: 'pairs',
      title: 'De 1 kg, 1 litro o 1 km (1000 g, 1000 mL, 1000 m)',
      items: [
        ['[1/2] (un medio)', '500'],
        ['[1/3] (un tercio)', '333,33'],
        ['[1/4] (un cuarto)', '250'],
        ['[1/5] (un quinto)', '200'],
      ],
    },
  ],

  dec: [
    { type: 'p', text: 'Una **fracción decimal** es la que tiene como denominador **10, 100, 1000…** Se puede escribir como **número decimal**:' },
    {
      type: 'table',
      head: ['Fracción', 'Se lee', 'Número decimal'],
      rows: [
        ['[3/10]', 'tres décimos', '0,3 (tres décimas)'],
        ['[13/10]', 'trece décimos', '1,3'],
        ['[4/100]', 'cuatro centésimos', '0,04'],
        ['[12/10]', 'doce décimos', '1,2 (o también [1 2/10])'],
      ],
    },
    { type: 'tip', text: 'Truco: con denominador 10 hay **una** cifra detrás de la coma; con 100, **dos** cifras; con 1000, **tres**.' },
    { type: 'pairs', title: 'Y al revés', items: [['0,3', '[3/10]'], ['0,25', '[25/100]'], ['0,007', '[7/1000]']] },
  ],

  equiv: [
    {
      type: 'p',
      text: 'Son fracciones que representan **la misma cantidad** aunque se escriban distinto. Por ejemplo, [1/3], [2/6] y [8/24] de una tableta de chocolate son el mismo trozo.',
    },
    { type: 'figure', figure: { kind: 'shape', shape: 'bar', parts: 3, filled: 1 }, caption: '[1/3]' },
    { type: 'figure', figure: { kind: 'shape', shape: 'bar', parts: 6, filled: 2 }, caption: '[2/6]: ¡el mismo trozo!' },
    { type: 'p', text: 'Para conseguir fracciones equivalentes se **multiplica o divide** el numerador y el denominador **por el mismo número**:' },
    {
      type: 'list',
      items: [
        '**Amplificación** (multiplicar): [1/2] = [2/4] = [4/8] = [12/24] (×2, ×2, ×3)',
        '**Simplificación** (dividir): [10/20] = [5/10] = [1/2] (:2, :5)',
      ],
    },
    {
      type: 'tip',
      text: 'Sirven para dejar dos fracciones con el **mismo denominador** y así compararlas o sumarlas. Ejemplo: [2/3] y [3/5] se convierten en [10/15] y [9/15].',
    },
  ],

  orden: [
    { type: 'p', text: 'Para saber qué fracción es mayor, miramos cuántos trozos hay (denominador) y cuántos cogemos (numerador).' },
    {
      type: 'table',
      head: ['Caso', 'Regla', 'Ejemplo'],
      rows: [
        ['Mismo denominador', 'Es mayor la que tiene el **numerador más grande** (cogemos más trozos iguales).', '[1/7] < [3/7] < [5/7] < [7/7]'],
        ['Mismo numerador', 'Es mayor la que tiene el **denominador más pequeño** (los trozos son más grandes).', '[2/2] > [2/4] > [2/8]'],
        ['Distinto numerador y denominador', 'Se pasan a equivalentes con el **mismo denominador** y se comparan.', '[2/3] y [3/5] → [10/15] > [9/15]'],
      ],
    },
    { type: 'figure', figure: { kind: 'shape', shape: 'bar', parts: 2, filled: 1 }, caption: '[1/2]' },
    { type: 'figure', figure: { kind: 'shape', shape: 'bar', parts: 8, filled: 1 }, caption: '[1/8]: el trozo es mucho más pequeño' },
    { type: 'tip', text: 'Para comparar con 1 o con 2: 1 = [3/3], 2 = [6/3]. Así [7/3] > 2.' },
  ],

  suma: [
    { type: 'p', text: '**Con el mismo denominador:** se suman o restan los **numeradores** y el **denominador no cambia**.' },
    {
      type: 'list',
      items: ['Suma: [2/24] + [6/24] = [8/24] (Gema se come 2 onzas y luego 6 de una tableta de 24)', 'Resta: [16/24] − [4/24] = [12/24]'],
    },
    { type: 'p', text: '**Con distinto denominador:** primero se convierten en fracciones **equivalentes con el mismo denominador** y después se opera igual.' },
    { type: 'list', items: ['[2/5] + [3/10] = [4/10] + [3/10] = [7/10]', '[2/3] − [1/6] = [4/6] − [1/6] = [3/6]'] },
    { type: 'tip', text: '¡Nunca se suman los denominadores! [1/4] + [1/4] = [2/4], no [2/8].' },
  ],

  cantidad: [
    { type: 'p', text: 'Para calcular la fracción de un número: **se divide entre el denominador y se multiplica por el numerador**.' },
    { type: 'tip', text: '[3/4] de 80 = 80 : 4 × 3 = 60' },
    { type: 'heading', text: 'Ejemplo del libro' },
    { type: 'p', text: 'En un huerto hay un depósito de 4000 litros. Con [4/8] riegan las verduras y con [3/8] los árboles.' },
    {
      type: 'steps',
      items: [
        'Cada parte: 4000 : 8 = 500 litros',
        'Verduras (4 partes): 500 × 4 = 2000 litros',
        'Árboles (3 partes): 500 × 3 = 1500 litros',
        'Sobra: 4000 − 2000 − 1500 = 500 litros (o [1/8] de 4000 = 500)',
      ],
    },
    { type: 'heading', text: 'Con grupos de cosas' },
    { type: 'figure', figure: { kind: 'shape', shape: 'dots', parts: 10, filled: 4 }, caption: '[2/5] de 10 círculos: 10 : 5 = 2 → 2 × 2 = 4 círculos' },
  ],

  repaso: [
    {
      type: 'p',
      text: 'Aquí tienes la **hoja de repaso** del cole hecha app: los **26 ejercicios** en el mismo orden, con la corrección de cada uno. Puedes hacerla entera o practicar 10 al azar.',
    },
    { type: 'heading', text: 'Chuleta para el examen' },
    {
      type: 'list',
      items: [
        '**Numerador** = partes que cojo (arriba). **Denominador** = partes en que divido (abajo).',
        '**Propia** < 1 · **Impropia** > 1 · **Igual a la unidad** = 1 · **Mixto** = entero + fracción ([7/6] = [1 1/6]).',
        'Se leen: 2 medio, 3 tercio, 4 cuarto, 5 quinto… 10 décimo, 11 en adelante -avo.',
        '**Decimales**: denominador 10, 100, 1000 → [3/10] = 0,3 · [4/100] = 0,04.',
        '**Equivalentes**: multiplico o divido arriba y abajo por el mismo número (amplificar / simplificar).',
        '**Ordenar**: mismo denominador → gana el numerador mayor; mismo numerador → gana el denominador menor.',
        '**Sumar y restar**: con el mismo denominador opero los numeradores y el de abajo se queda igual.',
        '**Fracción de una cantidad**: divido entre el de abajo y multiplico por el de arriba ([3/4] de 80 = 80 : 4 × 3 = 60).',
      ],
    },
    {
      type: 'note',
      text: 'En la hoja, «unitarias» son las fracciones iguales a la unidad (6/6, 12/12, 4/4…), que no son ni propias ni impropias; así se han corregido los ejercicios 1 y 17. En los de sumar, amplificar o simplificar se da por buena cualquier fracción equivalente correcta.',
    },
  ],
};
