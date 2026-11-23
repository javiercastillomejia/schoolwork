import { describe, expect, it } from 'vitest';
import { checkTask, emptyResponse, solvedResponse, type Response, type Task } from '../../../core/task';
import type { TaskQuestion } from '../../../core/types';
import { seededRng } from '../../../lib/random';
import { PRACTICE, SHEET, unidad3 } from '.';

const make = (q: TaskQuestion, seed = 1, choices = 4) => q.make(seededRng(seed), { choices });
const sheet = (id: string) => make(SHEET.find((q) => q.id === id)!);

/** Valores de las casillas de la solución (para comparar con la hoja). */
function solvedFields(task: Task): string[] {
  const r = solvedResponse(task);
  return r.type === 'fields' ? r.values.map((v) => v.join('/')) : [];
}

/** Estropea una respuesta buena para comprobar que se marca como mal. */
function spoil(task: Task, r: Response): Response {
  switch (r.type) {
    case 'choice': {
      const body = task.body.type === 'choice' ? task.body : null;
      return { type: 'choice', value: body?.options.find((o) => o !== body.correct) ?? null };
    }
    case 'fields':
      return { type: 'fields', values: r.values.map((v, i) => (i === 0 ? v.map((s, j) => (j === 0 ? String(Number(s) + 1) : s)) : v)) };
    case 'rows':
      return { type: 'rows', values: r.values.map((v, i) => (i === 0 ? ((v ?? 0) + 1) % 2 : v)) };
    case 'order':
      return { type: 'order', value: [...r.value].reverse() };
    case 'classify':
      return { type: 'classify', values: r.values.map((v, i) => (i === 0 ? ((v ?? 0) + 1) % 3 : v)) };
    case 'pairs':
      return { type: 'pairs', partner: r.partner.map(() => -1) };
    case 'color':
      return { type: 'color', values: r.values.map((fig) => fig.map(() => true)) };
  }
}

describe('Matemáticas · Unidad 3 (fracciones)', () => {
  it('tiene los 7 apartados del temario y la hoja de repaso, cada uno con su ficha y ejercicios', () => {
    expect(unidad3.topics.map((t) => t.id)).toEqual(['que', 'leer', 'dec', 'equiv', 'orden', 'suma', 'cantidad', 'repaso']);
    for (const topic of unidad3.topics) {
      expect(unidad3.study[topic.id]?.length, topic.id).toBeGreaterThan(0);
      expect(unidad3.questions.filter((q) => q.topic === topic.id).length, topic.id).toBeGreaterThan(0);
    }
  });

  it('los ids son únicos y empiezan por su tema', () => {
    const ids = unidad3.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of unidad3.questions) expect(q.id.startsWith(`${q.topic}-`), q.id).toBe(true);
  });

  it('cada ejercicio se puede resolver y una respuesta mala se marca como mal (300 versiones de los que cambian)', () => {
    for (const q of [...PRACTICE, ...SHEET]) {
      const seeds = q.generated ? 300 : 1;
      for (let seed = 1; seed <= seeds; seed++) {
        for (const choices of [3, 4]) {
          const task = make(q, seed, choices);
          const solved = solvedResponse(task);
          expect(checkTask(task, solved).correct, `${q.id} #${seed}`).toBe(true);
          expect(checkTask(task, emptyResponse(task)).correct, `${q.id} vacía`).toBe(false);
          expect(checkTask(task, spoil(task, solved)).correct, `${q.id} estropeada #${seed}`).toBe(false);
          if (task.body.type === 'choice') {
            expect(new Set(task.body.options).size, `${q.id} opciones repetidas #${seed}`).toBe(task.body.options.length);
            expect(task.body.options).toContain(task.body.correct);
            expect(task.body.options.length).toBeGreaterThanOrEqual(2);
          }
          if (task.body.type === 'fields') {
            for (const field of task.body.fields) {
              if (field.expect.type === 'number') expect(Number.isFinite(field.expect.value)).toBe(true);
              if (field.expect.type !== 'number') expect(field.expect.d, q.id).toBeGreaterThan(0);
            }
          }
          if (task.body.type === 'order') {
            const values = task.body.items.map(([n, d]) => n / d);
            expect(new Set(values).size, `${q.id} ordenar sin empates #${seed}`).toBe(values.length);
          }
        }
      }
    }
  });

  it('la hoja tiene los 26 ejercicios en orden', () => {
    const numbers = SHEET.map((q) => Number(q.id.slice('repaso-'.length, 'repaso-'.length + 2)));
    expect([...new Set(numbers)]).toEqual(Array.from({ length: 26 }, (_, i) => i + 1));
  });

  describe('soluciones de la hoja de repaso', () => {
    it('1 y 17: clasificar (unitarias = iguales a la unidad)', () => {
      const one = sheet('repaso-01').body;
      expect(one.type === 'classify' && one.answers).toEqual([0, 1, 2, 0, 1, 2, 1, 0, 2, 1]);
      const seventeen = sheet('repaso-17').body;
      expect(seventeen.type === 'classify' && seventeen.answers).toEqual([2, 0, 1, 0, 2, 1, 0, 1, 0, 2]);
    });

    it('3, 10, 20 y 22: fracción de una cantidad', () => {
      expect(solvedFields(sheet('repaso-03'))).toEqual(['15', '20', '6', '18']);
      expect(solvedFields(sheet('repaso-10'))).toEqual(['200']);
      expect(solvedFields(sheet('repaso-20'))).toEqual(['10', '30', '5', '25']);
      expect(solvedFields(sheet('repaso-22'))).toEqual(['9']);
    });

    it('4 y 15: decimales', () => {
      expect(solvedFields(sheet('repaso-04'))).toEqual(['0.5', '0.25', '0.008', '0.09']);
      expect(solvedFields(sheet('repaso-15'))).toEqual(['3/10', '25/100', '7/1000', '9/10']);
    });

    it('5 y 21: parejas de equivalentes', () => {
      const five = sheet('repaso-05').body;
      expect(five.type === 'pairs' && five.pairs).toEqual([
        [0, 4],
        [1, 7],
        [2, 5],
        [3, 6],
      ]);
      const twentyOne = sheet('repaso-21').body;
      expect(twentyOne.type === 'pairs' && twentyOne.pairs).toEqual([
        [0, 5],
        [1, 4],
        [2, 7],
        [3, 6],
      ]);
    });

    it('6: comparar', () => {
      const body = sheet('repaso-06').body;
      expect(body.type === 'rows' && body.rows.map((r) => r.options[r.answer])).toEqual(['<', '<', '=', '>']);
    });

    it('9 y 26: números mixtos', () => {
      expect(solvedFields(sheet('repaso-09'))).toEqual(['2/2/3', '2/2/4', '1/4/5', '1/5/9']);
      expect(solvedFields(sheet('repaso-26'))).toEqual(['3/1/2', '2/3/4', '2/3/5', '2/5/6']);
    });

    it('12, 24 y 25: sumas y restas', () => {
      expect(solvedFields(sheet('repaso-12'))).toEqual(['5/6', '3/4', '5/10', '13/6']);
      expect(solvedFields(sheet('repaso-24'))).toEqual(['5/8', '3/8']);
      expect(solvedFields(sheet('repaso-25'))).toEqual(['6/7', '5/10', '6/12', '3/4']);
    });

    it('16 y 18: huecos y recta numérica', () => {
      expect(solvedFields(sheet('repaso-16'))).toEqual(['4', '15', '8', '3']);
      expect(solvedFields(sheet('repaso-18'))).toEqual(['1/6', '4/6', '5/6']);
    });

    it('en sumar se acepta cualquier equivalente, y en amplificar/simplificar se exige el sentido', () => {
      const twelve = sheet('repaso-12');
      const solved = solvedResponse(twelve);
      if (solved.type !== 'fields') throw new Error();
      const alt: Response = { type: 'fields', values: solved.values.map((v, i) => (i === 2 ? ['1', '2'] : v)) };
      expect(checkTask(twelve, alt).correct).toBe(true);

      const eleven = sheet('repaso-11');
      const ok = solvedResponse(eleven);
      if (ok.type !== 'fields') throw new Error();
      const swapped: Response = { type: 'fields', values: ok.values.map((v, i) => (i === 0 ? ['2', '3'] : v)) };
      expect(checkTask(eleven, swapped).correct).toBe(false);
    });
  });
});
