# Schoolwork

Un solo repositorio para las apps de estudio del cole, ordenadas por **asignatura** y **unidad**. Cada asignatura tiene su mascota y sus colores; cada unidad trae sus temas, fichas de estudio, preguntas y glosario. Funciona en móvil, tablet y ordenador, se puede instalar en la pantalla de inicio y va sin conexión.

Publicada en **https://javiercastillomejia.github.io/schoolwork/**

## Qué hay ahora

| Asignatura | Mascota | Unidades |
| --- | --- | --- |
| Natural Science (4º de Primaria, Anaya) | 🐨 **Koa, el koala** (gana una hoja de eucalipto por cada acierto a la primera) | Unit 2 · *Animals and human beings*: 10 temas, 114 preguntas y 25 palabras |

## Cómo funciona

- **Nombre y edad**: se piden la primera vez y sirven para todas las asignaturas. La mascota llama al alumno por su nombre.
- **Adaptado a la edad**:
  - hasta 8 años: 3 opciones por pregunta, 5 preguntas nuevas al día, quiz de 8 preguntas y pistas;
  - 9 y 10 años: 4 opciones, 6 nuevas al día, quiz de 10 y pistas (quitan una opción incorrecta);
  - 11 y 12: 8 nuevas al día y sin pistas;
  - 13 o más: 10 nuevas al día.
- **Reto de hoy** (unos minutos): los repasos que tocan y las preguntas nuevas del día, en el orden del libro. Primero salen las de los temas que ya se han abierto (lo que se está viendo en clase). Al terminar, **¡Quiero más!** sigue sin límite.
- **Cajas de Leitner** (como en la app de verbos): cada pregunta sube de caja al acertarla y tarda más en volver (1, 3, 7 y 21 días). Si se falla, vuelve a la caja 1 y se repite unas preguntas después en la misma sesión.
- **Tu camino**: los 10 temas, cada uno con su ficha de estudio (palabras clave resaltadas, tablas, cómic, mapa conceptual…), botón **Escuchar** (lee la ficha en inglés británico y va marcando lo que lee) y **Practise this topic**: 10 preguntas al azar del tema, con la explicación de cada respuesta. Estrellas según la mejor nota: ★★★ con 90 % o más, ★★ con 70 % (tema aprobado), ★ con 50 %.
- **Mapa conceptual con huecos**: en *Map your ideas!* se pueden esconder las palabras clave y destaparlas tocando, como los huecos del libro.
- **Fichas**: el glosario en tarjetas que se giran (palabra y traducción delante, definición detrás), barajadas, con audio.
- **Mis fallos**: repasa las preguntas que más cuestan.
- **Examen final**: 20 preguntas al azar de toda la unidad, sin corrección hasta el final, nota sobre 10 (Sobresaliente, Notable, Bien, Suficiente, Insuficiente), corrección completa y "Practicar mis fallos". Los fallos vuelven al reto.
- **Racha** de días seguidos estudiando (común a todas las asignaturas) y premios de la mascota.

El progreso se guarda en el navegador del dispositivo (localStorage). Se puede borrar por unidad desde **Ajustes**.

## Estructura

```
src/
  subjects/
    index.ts                     lista de asignaturas (SUBJECTS)
    natural-science/
      index.ts                   asignatura: nombre, colores y mascota
      unit-2/
        CONTENT.md               contenido de la unidad tal y como se preparó (fuente)
        study.ts                 TOPICS (temas) y STUDY (fichas de estudio)
        questions.ts             QUESTIONS (la primera opción es la correcta)
        glossary.ts              GLOSSARY
        index.ts                 junta todo en la unidad
        content.test.ts          comprueba que coincide con CONTENT.md
  core/                          motor común a todas las unidades
    types.ts                     forma del contenido de una unidad
    srs.ts                       cajas de Leitner
    session.ts                   reto del día, quiz de tema y repaso de fallos
    quiz.ts                      opciones, estrellas, notas y examen
    profile.ts                   ajustes según la edad
    stats.ts                     racha y progreso de cada tema
  mascots/                       dibujos de las mascotas (Koa, el koala)
  components/                    piezas de la interfaz (ficha, pregunta, corrección…)
  screens/                       inicio, unidad, tema, preguntas, examen, fichas y ajustes
  storage/store.ts               guardado del progreso
```

Las direcciones son del tipo `#/natural-science/unit-2/topic/char`, así que se puede guardar el enlace a un tema concreto.

## Cómo añadir una unidad

1. Crea la carpeta `src/subjects/<asignatura>/unit-N/` copiando `natural-science/unit-2/` como plantilla.
2. Rellena `study.ts` (temas y fichas), `questions.ts` y `glossary.ts`. En cada pregunta, la **primera opción es la correcta** y lleva su explicación en `why`. Los `id` de las preguntas (`tema-01`, `tema-02`…) no deben cambiar después: el progreso guardado depende de ellos (añade las nuevas al final).
3. En `unit-N/index.ts` exporta la unidad (`id`, `label`, `title`, `subtitle`, `book`, `lang`).
4. Añádela a la lista `units` de la asignatura en `src/subjects/<asignatura>/index.ts`.
5. `npm test` comprueba los datos. Si guardas también el `CONTENT.md` de la unidad, copia `content.test.ts` y ajusta los números.

Las fichas de estudio admiten estos bloques (ver `src/core/types.ts`): `heading`, `p`, `list`, `table`, `pairs`, `tip`, `note` (nota en español para la familia, no se lee en voz alta), `dialogue` (cómic), `tree` (mapa conceptual) y `steps`. Las palabras clave se escriben entre `**dobles asteriscos**`.

## Cómo añadir una asignatura

1. Crea `src/subjects/<asignatura>/index.ts` con su nombre, su tema de colores y su mascota (nombre, cómo se presenta y qué premio gana).
2. Si lleva mascota nueva, dibújala en `src/mascots/` (con los ánimos `normal`, `happy`, `oops` y `party`) y añádela en `src/components/Mascot.tsx`.
3. Añade sus colores en `src/styles.css` con `:root[data-theme='<tema>']` (claro y oscuro).
4. Añádela a `SUBJECTS` en `src/subjects/index.ts`.

## Desarrollo

Requisitos: Node 22.

```bash
npm ci          # instalar dependencias
npm run dev     # servidor de desarrollo
npm test        # tests (Vitest)
npm run build   # compilación de producción en dist/
```

## Publicación

GitHub Actions pasa los tests, compila y publica en GitHub Pages cada vez que se sube algo a la rama por defecto del repositorio (`.github/workflows/deploy.yml`). Pages tiene que estar en **Settings → Pages → Build and deployment → Source: GitHub Actions**.

Si el repositorio cambia de nombre, hay que actualizar `BASE` en `vite.config.ts`.
