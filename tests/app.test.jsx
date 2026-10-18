import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import words from '../src/data/words.json';
import { App } from '../src/app.jsx';

const KEY = 'a1-flipkards:v1';
const saved = () => JSON.parse(localStorage.getItem(KEY));
const first = words[0];
const second = words[1];

function setup(state = { order: 'az' }) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return render(<App />);
}

const card = () => document.querySelector('.card');
const front = () => document.querySelector('.front .word').textContent;

beforeEach(() => {
  localStorage.clear();
  // Reduced motion makes marking synchronous (no exit animation timer).
  window.matchMedia = vi.fn(() => ({ matches: true }));
});
afterEach(cleanup);

describe('App', () => {
  it('starts a 20-card batch in list order', () => {
    setup();
    expect(screen.getByText(/1 \/ 20/)).toBeTruthy();
    expect(front()).toBe(first.de);
  });

  it('flips with the button and reveals the translation only on request', () => {
    setup();
    expect(card().classList.contains('is-flipped')).toBe(false);
    fireEvent.click(screen.getByLabelText('Flip card'));
    expect(card().classList.contains('is-flipped')).toBe(true);
    expect(screen.queryByText(first.example_en)).toBeNull();
    fireEvent.click(screen.getByText('Show translation'));
    expect(screen.getByText(first.example_en)).toBeTruthy();
  });

  it('marks known, advances, persists, and undo restores', () => {
    setup();
    fireEvent.click(screen.getByText('Know it'));
    expect(front()).toBe(second.de);
    expect(saved().status[first.id]).toBe('known');
    expect(document.querySelector('.tally strong').textContent).toBe('1');

    fireEvent.click(screen.getByText('Undo'));
    expect(front()).toBe(first.de);
    expect(saved().status[first.id]).toBeUndefined();
  });

  it('keyboard: arrows mark, T reveals translation', () => {
    setup();
    fireEvent.keyDown(window, { key: 't' });
    expect(screen.getByText(first.example_en)).toBeTruthy();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(saved().status[first.id]).toBe('unknown');
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(saved().status[second.id]).toBe('known');
  });

  it('skips known cards in new batches', () => {
    setup({ order: 'az', status: { [first.id]: 'known' } });
    expect(front()).toBe(second.de);
  });

  it('review deck shows only "not yet" cards, then the batch-end screen', () => {
    setup({ order: 'az', deck: 'review', status: { [second.id]: 'unknown' } });
    expect(screen.getByText(/1 \/ 1/)).toBeTruthy();
    expect(front()).toBe(second.de);
    fireEvent.click(screen.getByText('Know it'));
    expect(screen.getByRole('heading', { name: 'Batch done' })).toBeTruthy();
  });

  it('empty review deck says so', () => {
    setup({ order: 'az', deck: 'review' });
    expect(screen.getByText('Nothing to review')).toBeTruthy();
  });

  it('reset needs a second tap', () => {
    setup({ order: 'az', status: { [first.id]: 'known' } });
    fireEvent.click(screen.getByText('Options'));
    fireEvent.click(screen.getByText('Reset progress'));
    expect(saved().status[first.id]).toBe('known');
    fireEvent.click(screen.getByText('Clear all progress'));
    expect(saved().status).toEqual({});
    expect(front()).toBe(first.de);
  });

  it('new batches skip cards marked "not yet"', () => {
    setup({ order: 'az', status: { [first.id]: 'unknown' } });
    expect(front()).toBe(second.de);
  });

  it('ignores key auto-repeat', () => {
    setup();
    fireEvent.keyDown(window, { key: 'ArrowRight', repeat: true });
    expect(saved().status[first.id]).toBeUndefined();
  });

  it('tapping the active order keeps the current card', () => {
    setup();
    fireEvent.click(screen.getByText('Know it'));
    fireEvent.click(screen.getByText('Options'));
    fireEvent.click(screen.getByText('List order'));
    expect(screen.getByText(/2 \/ 20/)).toBeTruthy();
  });

  it('switching batch during the exit animation cancels the pending mark', () => {
    window.matchMedia = vi.fn(() => ({ matches: false }));
    vi.useFakeTimers();
    setup();
    fireEvent.click(screen.getByText('Know it'));
    fireEvent.click(screen.getByText('Options'));
    fireEvent.click(screen.getByText('Shuffled'));
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
    expect(saved().status[first.id]).toBeUndefined();
    expect(screen.getByText(/1 \/ 20/)).toBeTruthy();
  });

  it('reset can be cancelled', () => {
    setup({ order: 'az', status: { [first.id]: 'known' } });
    fireEvent.click(screen.getByText('Options'));
    fireEvent.click(screen.getByText('Reset progress'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(saved().status[first.id]).toBe('known');
  });

  it('drops invalid stored state', () => {
    setup({ deck: 'bogus', order: 'az', status: { [first.id]: 'maybe' } });
    expect(front()).toBe(first.de);
    expect(screen.getByText(/1 \/ 20/)).toBeTruthy();
  });

  it('still works when localStorage throws', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(<App />);
    fireEvent.click(screen.getByText('Know it'));
    expect(screen.getByText(/2 \/ 20/)).toBeTruthy();
    get.mockRestore();
    set.mockRestore();
  });
});
