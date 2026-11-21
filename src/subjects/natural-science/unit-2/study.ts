import type { StudyBlock, Topic } from '../../../core/types';

/** Los diez temas de la unidad, en el orden del libro. */
export const TOPICS: Topic[] = [
  { id: 'char', emoji: '🐾', title: 'Animal characteristics and types', subtitle: 'Características y tipos de animales' },
  { id: 'nut', emoji: '🍎', title: 'The nutrition function', subtitle: 'La función de nutrición' },
  { id: 'int', emoji: '👀', title: 'The interaction function', subtitle: 'La función de relación' },
  { id: 'rep', emoji: '🥚', title: 'The reproduction function', subtitle: 'La función de reproducción' },
  { id: 'hum', emoji: '🧒', title: 'Vital functions in human beings', subtitle: 'Funciones vitales en el ser humano' },
  { id: 'well', emoji: '💚', title: 'Physical and emotional well-being', subtitle: 'Bienestar físico y emocional' },
  { id: 'world', emoji: '💡', title: 'The world and... you!', subtitle: 'Biomimética: inventos inspirados en la naturaleza' },
  { id: 'story', emoji: '🪺', title: 'Story time!', subtitle: 'El cuento: los nidos del balcón' },
  { id: 'map', emoji: '🗺️', title: 'Map your ideas!', subtitle: 'Mapa conceptual de la unidad' },
  { id: 'review', emoji: '✅', title: "Let's review!", subtitle: 'Repaso final' },
];

/** Fichas de estudio de cada tema (ver "Contenido de estudio" en CONTENT.md). */
export const STUDY: Record<string, StudyBlock[]> = {
  char: [
    { type: 'heading', text: 'What do ALL animals share?' },
    {
      type: 'list',
      items: [
        "They **don't make their own food**. They feed on other living organisms.",
        'They **breathe oxygen** and expel **carbon dioxide** (from air or water).',
        'They have got **sense organs** to see, hear, smell, taste and touch. They feel sensations and detect movement.',
        'They **move** between places using their **locomotor system** (climb, walk, run, swim, fly).',
      ],
    },
    { type: 'heading', text: 'Vertebrates' },
    { type: 'p', text: '**Vertebrates** have got an **internal skeleton and a backbone**.' },
    {
      type: 'list',
      items: [
        '**Cold-blooded**: body temperature **varies** with the environment (fish, reptiles, amphibians).',
        '**Warm-blooded**: **constant** body temperature (mammals, birds).',
      ],
    },
    {
      type: 'table',
      head: ['Group', 'Blood', 'Characteristics'],
      rows: [
        ['Fish', 'Cold', 'Aquatic. Most are oviparous. Scales, fins and a tail. Breathe underwater through **gills**.'],
        [
          'Reptiles',
          'Cold',
          'Land and aquatic, breathe air. Most oviparous, lay eggs on dry land. Four legs and sharp claws (except snakes). Scales; some have a hard shell.',
        ],
        [
          'Amphibians',
          'Cold',
          'Land animals that live close to water. Oviparous, lay eggs in water. Thin, **moist skin** that absorbs oxygen. Life cycle of a frog: egg, tadpole, frog.',
        ],
        ['Mammals', 'Warm', 'Land or aquatic. Almost all are **viviparous**. Many have fur or hair. Arms, hands, legs, fins or wings.'],
        ['Birds', 'Warm', 'Land animals. Oviparous. **Feathers, wings and a beak**. Most can fly.'],
      ],
    },
    { type: 'heading', text: 'Invertebrates' },
    { type: 'p', text: "**Invertebrates** **haven't got** an internal skeleton or a backbone. They are **oviparous**." },
    {
      type: 'table',
      head: ['Group', 'Characteristics'],
      rows: [
        ['Cnidaria', 'Some swim (jellyfish), some live fixed in one place (coral, anemones). Jellyfish use poisonous tentacles to hunt.'],
        ['Worms', 'Very long bodies divided into segments or rings. Aquatic (leech) or dry land (earthworm).'],
        ['Echinoderms', 'Usually shaped like a **star or a ball**. Covered in a shell with spines.'],
        ['Molluscs', 'Land and aquatic. Some have a hard shell to protect their bodies, like a snail.'],
        [
          'Arthropods',
          'Armour plates and various numbers of legs. Some have wings and fly. Some live in water (crabs), some on land (spiders, insects like flies).',
        ],
      ],
    },
    { type: 'tip', text: '**Oviparous** = lay eggs. **Viviparous** = babies grow inside the mother and she gives birth.' },
  ],

  nut: [
    { type: 'p', text: '**Nutrition** is when living organisms use **food, water and oxygen** to survive.' },
    {
      type: 'list',
      items: [
        '**Plants are autotrophs**: they **make their own food** through **photosynthesis**. They absorb carbon dioxide from the air through their **leaves**, and water and minerals from the soil through their **roots**.',
        {
          text: '**Animals are heterotrophs**: they feed on other living organisms.',
          items: [
            "**Carnivores** feed on animals they catch (polar bear, tiger). Some are **scavengers**: they eat dead animals they haven't caught.",
            '**Herbivores** feed on plants (horse, cow).',
            '**Omnivores** feed on meat and plants (brown bear, dog).',
          ],
        },
      ],
    },
    {
      type: 'p',
      text: 'Nutrition is also how living organisms **breathe** and **expel waste**. Some expel carbon dioxide through **gills** or **lungs**; all use their excretory system and excretory glands to expel other substances.',
    },
    { type: 'tip', text: 'The 4 systems in nutrition: **digestive, respiratory, circulatory, excretory**.' },
  ],

  int: [
    { type: 'p', text: 'Animals (and humans) receive information and interact with their environment using:' },
    {
      type: 'list',
      items: [
        '**Sense organs**: collect information from the environment and the body.',
        '**Nervous system**: receives and processes the information and transmits signals to the body.',
        '**Locomotor system** (also **musculoskeletal system**): receives the signals; bones, joints and muscles work together so the animal can **move**.',
      ],
    },
    {
      type: 'tip',
      text: '**Effectors** are the parts of the body that respond to the signals. In the locomotor system, the effectors are the **muscles**.',
    },
    {
      type: 'pairs',
      title: 'Senses',
      items: [
        ['sight', 'eyes'],
        ['hearing', 'ears'],
        ['smell', 'nose'],
        ['touch', 'skin'],
        ['taste', 'mouth and tongue'],
      ],
    },
  ],

  rep: [
    {
      type: 'list',
      items: [
        '**Sexual**: a **male and a female sex cell** combine to create new offspring.',
        '**Asexual**: the animal reproduces **by itself**. Most invertebrates reproduce this way, but some vertebrates do too.',
        '**Oviparous**: lay eggs; the baby is born when it **breaks out of the eggshell**. Birds lay eggs in a nest, snakes underground, fish in water.',
        "**Viviparous**: babies develop inside the mother's **womb**; the mother **gives birth**. Lions give birth to cubs, horses to foals, sheep to lambs.",
      ],
    },
    {
      type: 'tip',
      text: 'Sponges and honey bees are invertebrates that reproduce asexually. Sharks and Komodo dragons are vertebrates that can reproduce sexually and asexually.',
    },
    {
      type: 'pairs',
      title: 'Baby animals',
      items: [
        ['kitten', 'cat'],
        ['puppy', 'dog'],
        ['calf', 'cow'],
        ['chick', 'hen'],
        ['cub', 'lion'],
        ['foal', 'horse'],
        ['lamb', 'sheep'],
      ],
    },
  ],

  hum: [
    { type: 'heading', text: 'Nutrition' },
    {
      type: 'list',
      items: [
        '**Digestive system**: obtains nutrients from food.',
        '**Respiratory system**: obtains oxygen from the air and expels carbon dioxide.',
        '**Circulatory system**: takes nutrients and oxygen to all parts of the body, and the waste to the excretory organs.',
        '**Excretory system**: removes waste. The **kidneys** remove salt and waste in **urine**; the **sweat glands** remove salts and waste as **sweat**.',
      ],
    },
    { type: 'heading', text: 'Interaction' },
    {
      type: 'p',
      text: 'Our **sense organs** (eyes, ears, nose, mouth and tongue, skin) receive information. Our **nervous system** (brain, encephalon, nerves) receives the signals, interprets them and sends nerve signals to prepare a reaction. **Effectors** respond: **muscles** (change position, move) and **glands** (produce substances, like saliva glands).',
    },
    { type: 'heading', text: 'Reproduction' },
    {
      type: 'p',
      text: 'Male and female sex cells are needed. Human beings are **viviparous** and reproduce **sexually**.',
    },
  ],

  well: [
    { type: 'heading', text: 'Look after your body systems' },
    {
      type: 'table',
      head: ['System', 'Tips'],
      rows: [
        [
          'Digestive',
          "Healthy, balanced diet: vitamins and minerals, **proteins to grow**, **carbohydrates for energy**, healthy fats for your cells, **calcium for your bones**. Eat regular meals, eat slowly, don't eat spoiled food, wash your hands before and after eating, brush your teeth after meals.",
        ],
        ['Respiratory', 'Breathe through your **nose** (its hairs clean the air). Regular exercise for your lungs.'],
        ['Circulatory', "Regular exercise for your **heart**. Don't eat much food with lots of fats and salt."],
        ['Excretory', 'Drink lots of water, wash every day, wear clean clothes every day.'],
      ],
    },
    { type: 'tip', text: 'Food wheel: **energy-producing** food, **body-building** food, **body-regulating** food.' },
    { type: 'heading', text: 'Mental health' },
    { type: 'p', text: 'Mental health is **just as important** as physical health. Tips and why:' },
    {
      type: 'list',
      items: [
        '**Do things you enjoy**: hobbies help us relax and reduce stress.',
        '**Report bullies immediately**: no one can make us feel unhappy or scared.',
        '**Get lots of sleep**: our bodies need lots of rest to function correctly.',
        '**Eat healthy food**: a balanced diet keeps our bodies strong.',
        '**Express your feelings**: talking about emotions helps us understand them better.',
        '**Look after your body**: it increases our self-esteem.',
        '**Spend time outside away from a screen**: too much time online affects our sleep and mood.',
        "**Don't be afraid to ask for help**: sharing problems is the first step to solving them.",
      ],
    },
    { type: 'steps', title: 'Box breathing (repeat)', items: ['Breathe in (4)', 'Hold (4)', 'Breathe out (4)', 'Pause (4)'] },
  ],

  world: [
    { type: 'p', text: '**Biomimicry** is when scientists and engineers develop new things **inspired by nature**.' },
    {
      type: 'table',
      head: ['Invention', 'Inspired by', 'Why'],
      rows: [
        ['Bullet train', 'Kingfisher', 'Its pointed nose copies the beak, which enters water without splashing.'],
        ['LED lights', 'Firefly', 'Fireflies make their own light.'],
        ['Velcro', 'Burdock burrs', 'The spiky seed balls stick to clothes and fur with tiny hooks.'],
      ],
    },
    {
      type: 'note',
      text: 'El libro solo muestra las 6 fotos; las parejas y explicaciones son las clásicas de biomimética, no están en el texto.',
    },
    { type: 'heading', text: 'Reading: Strange animals' },
    {
      type: 'p',
      text: 'Many animals have an unusual appearance because they have **adapted to their environment** to survive.',
    },
    {
      type: 'list',
      items: [
        "**Brazilian Membracidae**: insect from tropical forests (Africa, America, Asia, Australia). Tiny balls on its head make it look like a helicopter. Looks **scary** but doesn't hurt humans. About half a centimetre; feeds on the **sap** of plants.",
        '**Star-nosed mole** (North America): nose with 22 pink tentacles; 17-20 cm. Almost completely **blind**, uses tentacles to find food. Lives in **moist** soil: woods, **marshes** and fields. Eats worms, aquatic insects, snails, fish and small amphibians.',
      ],
    },
    {
      type: 'pairs',
      title: 'Vocabulary',
      items: [
        ['moist', 'slightly wet'],
        ['sap', 'a fluid inside plants'],
        ['scary', 'makes you feel fear'],
        ['blind', "can't see anything"],
        ['marshes', 'low land with a lot of water'],
        ['strange', 'unusual, surprising or difficult to explain'],
      ],
    },
  ],

  story: [
    { type: 'heading', text: 'The nests on the balcony' },
    {
      type: 'dialogue',
      lines: [
        { who: "Jane's aunty", text: 'What a mess! Look at my clean clothes! I have to remove the nests.' },
        { who: 'Children', text: "No! The birds are **protected**! It's **illegal** to remove the nests." },
        { who: 'Children', text: 'It takes a lot of effort to build the nests. The birds **return to them every year**.' },
        { who: 'Children', text: 'We can put your clothesline in the patio. There are no nests there!' },
        { who: '', text: 'They hear a sound and use **binoculars**.' },
        { who: 'Children', text: 'There are baby birds in the nest! Cheep, cheep!' },
        { who: 'Children', text: 'They sound hungry. Aunty! Have you got any worms for the birds?' },
        { who: "Jane's aunty", text: 'Ugh!' },
      ],
    },
    {
      type: 'list',
      items: [
        '**Why does the aunty want to move the nests?** The birds make her clean clothes dirty.',
        "**Why can't she?** Birds and nests are protected by law.",
        '**Solution:** move the clothesline to the patio.',
        '**How to help birds:** don\'t remove or disturb nests, put out water and feeders, keep cats away.',
      ],
    },
  ],

  map: [
    { type: 'note', text: 'En el libro, las palabras en negrita son huecos con "?" que hay que completar.' },
    {
      type: 'tree',
      root: {
        text: 'ANIMALS',
        items: [
          {
            text: 'Vital functions',
            items: [
              { text: '**Nutrition**', items: [{ text: 'Heterotrophs', items: ['**Carnivores**', 'Herbivores', '**Omnivores**'] }] },
              { text: 'Interaction', items: ['sense organs', 'nervous system', 'locomotor system'] },
              {
                text: 'Reproduction',
                items: ['Asexual', { text: '**Sexual**', items: ['Oviparous', '**Viviparous**'] }],
              },
            ],
          },
          {
            text: 'Types',
            items: [
              { text: '**Vertebrates**', items: ['fish', 'amphibians', 'reptiles', 'birds', 'mammals'] },
              { text: 'Invertebrates', items: ['cnidaria', 'worms', 'echinoderms', 'molluscs', 'arthropods'] },
            ],
          },
        ],
      },
    },
  ],

  review: [
    {
      type: 'table',
      head: ['Group', 'Vertebrate', 'Oviparous / viviparous', 'Examples'],
      rows: [
        ['Mammals', 'Yes', 'Viviparous (almost all)', 'dog, dolphin'],
        ['Birds', 'Yes', 'Oviparous', 'penguin, eagle'],
        ['Fish', 'Yes', 'Oviparous (most)', 'clownfish, shark'],
        ['Reptiles', 'Yes', 'Oviparous (most)', 'snake, tortoise'],
        ['Amphibians', 'Yes', 'Oviparous', 'frog'],
        ['Worms', 'No', 'Oviparous', 'earthworm, leech'],
        ['Cnidaria', 'No', 'Oviparous', 'jellyfish, coral'],
        ['Molluscs', 'No', 'Oviparous', 'snail, octopus'],
        ['Echinoderms', 'No', 'Oviparous', 'starfish, sea urchin'],
        ['Arthropods', 'No', 'Oviparous', 'crab, spider, bee'],
      ],
    },
    { type: 'heading', text: 'Word groups' },
    {
      type: 'list',
      items: [
        '**Nutrition**: autotroph, heterotroph, carnivore, herbivore, omnivore.',
        '**Reproduction**: sexual, asexual, viviparous, womb, oviparous.',
        '**Interaction**: sense organs, nervous system, locomotor system, muscles, glands.',
      ],
    },
    { type: 'heading', text: 'Simple definitions' },
    {
      type: 'pairs',
      items: [
        ['Nutrition', 'using food, water and oxygen to survive'],
        ['Interaction', 'getting information from the world and reacting to it'],
        ['Reproduction', 'producing new living organisms (offspring)'],
      ],
    },
  ],
};
