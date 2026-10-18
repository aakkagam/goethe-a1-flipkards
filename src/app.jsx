import { useEffect, useMemo, useState } from 'preact/hooks';
import words from './data/words.json';
import { load, save } from './store.js';
import { Card } from './card.jsx';

const BATCH = 20;
const byId = new Map(words.map((w) => [w.id, w]));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function shuffled(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// deck 'learn' = everything not yet known; 'review' = only cards marked "not yet".
function poolFor(status, deck) {
  return words.filter((w) => (deck === 'review' ? status[w.id] === 'unknown' : status[w.id] !== 'known'));
}

function makeBatch(status, deck, order) {
  const pool = poolFor(status, deck);
  return (order === 'az' ? pool : shuffled(pool)).slice(0, BATCH).map((w) => w.id);
}

export function App() {
  const [saved] = useState(load);
  const [status, setStatus] = useState(saved.status ?? {});
  const [deck, setDeck] = useState(saved.deck ?? 'learn');
  const [order, setOrder] = useState(saved.order ?? 'shuffle');
  const [batch, setBatch] = useState(() => makeBatch(status, deck, order));
  const [pos, setPos] = useState(0);
  const [history, setHistory] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [showTr, setShowTr] = useState(false);
  const [exit, setExit] = useState(null);
  const [menu, setMenu] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => save({ status, deck, order }), [status, deck, order]);

  const { known, learning } = useMemo(() => {
    let known = 0;
    let learning = 0;
    for (const [id, s] of Object.entries(status)) {
      if (!byId.has(id)) continue;
      if (s === 'known') known++;
      else if (s === 'unknown') learning++;
    }
    return { known, learning };
  }, [status]);

  const word = byId.get(batch[pos]);
  const done = !word;

  function resetCard() {
    setFlipped(false);
    setShowTr(false);
    setExit(null);
  }

  function startBatch(nextDeck = deck, nextOrder = order, nextStatus = status) {
    setBatch(makeBatch(nextStatus, nextDeck, nextOrder));
    setPos(0);
    setHistory([]);
    resetCard();
  }

  function commit(result) {
    const id = batch[pos];
    setHistory((h) => [...h, { id, prev: status[id], result }]);
    setStatus((s) => ({ ...s, [id]: result }));
    setPos((p) => p + 1);
    resetCard();
  }

  function mark(result) {
    if (done || exit) return;
    if (reducedMotion()) return commit(result);
    setExit(result);
    setTimeout(() => commit(result), 220);
  }

  function undo() {
    if (exit || !history.length) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setStatus((s) => {
      const next = { ...s };
      if (last.prev) next[last.id] = last.prev;
      else delete next[last.id];
      return next;
    });
    setPos((p) => p - 1);
    resetCard();
  }

  function chooseDeck(d) {
    setDeck(d);
    startBatch(d);
  }

  function chooseOrder(o) {
    setOrder(o);
    startBatch(deck, o);
  }

  function reset() {
    if (!confirmReset) return setConfirmReset(true);
    setConfirmReset(false);
    setStatus({});
    setDeck('learn');
    startBatch('learn', order, {});
  }

  useEffect(() => {
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') return setMenu(false);
      const onControl = e.target.closest?.('button, input, select, textarea');
      const k = e.key.toLowerCase();
      if (k === 'u') return undo();
      if (done) return;
      if ((k === ' ' || k === 'enter') && !onControl) {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (k === 'arrowright') mark('known');
      else if (k === 'arrowleft') mark('unknown');
      else if (k === 't') {
        setFlipped(true);
        setShowTr(true);
      }
    }
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const batchKnown = history.filter((h) => h.result === 'known').length;
  const batchLearning = history.length - batchKnown;
  const poolLeft = poolFor(status, deck).length;

  return (
    <>
      <header class="top">
        <p class="tally">
          <strong>{known}</strong> of {words.length} known
          {learning > 0 && <span> · {learning} learning</span>}
        </p>
        <button
          class="options-btn"
          type="button"
          aria-expanded={menu}
          aria-controls="options"
          onClick={() => {
            setMenu((m) => !m);
            setConfirmReset(false);
          }}
        >
          {menu ? 'Done' : 'Options'}
        </button>
      </header>
      <div class="meter" aria-hidden="true">
        <span style={{ transform: `scaleX(${known / words.length})` }} />
      </div>

      {menu && (
        <section id="options" class="options" aria-label="Options">
          <div class="opt">
            <span class="opt-label" id="deck-label">Cards</span>
            <div class="seg" role="group" aria-labelledby="deck-label">
              <button type="button" aria-pressed={deck === 'learn'} onClick={() => chooseDeck('learn')}>
                All not known
              </button>
              <button type="button" aria-pressed={deck === 'review'} onClick={() => chooseDeck('review')}>
                Learning ({learning})
              </button>
            </div>
          </div>
          <div class="opt">
            <span class="opt-label" id="order-label">Order</span>
            <div class="seg" role="group" aria-labelledby="order-label">
              <button type="button" aria-pressed={order === 'shuffle'} onClick={() => chooseOrder('shuffle')}>
                Shuffled
              </button>
              <button type="button" aria-pressed={order === 'az'} onClick={() => chooseOrder('az')}>
                List order
              </button>
            </div>
          </div>
          <button class={`reset${confirmReset ? ' confirm' : ''}`} type="button" onClick={reset}>
            {confirmReset ? 'Tap again to clear all progress' : 'Reset progress'}
          </button>
        </section>
      )}

      <main class="stage">
        {word ? (
          <>
            <p class="batch-pos">
              {pos + 1} / {batch.length}
            </p>
            <Card
              key={word.id}
              word={word}
              flipped={flipped}
              showTr={showTr}
              exit={exit}
              onFlip={() => setFlipped((f) => !f)}
              onReveal={() => setShowTr(true)}
              onSwipe={mark}
            />
          </>
        ) : (
          <Done
            batchSize={history.length}
            batchKnown={batchKnown}
            batchLearning={batchLearning}
            deck={deck}
            learning={learning}
            poolLeft={poolLeft}
            total={words.length}
            onNext={() => startBatch()}
            onReview={() => chooseDeck('review')}
            onLearn={() => chooseDeck('learn')}
          />
        )}
      </main>

      <footer class="controls">
        {word && (
          <div class="row">
            <button class="btn ghost" type="button" onClick={() => mark('unknown')}>
              <Arrow dir="left" /> Not yet
            </button>
            <button
              class="btn flip"
              type="button"
              aria-label={flipped ? 'Show front' : 'Flip card'}
              onClick={() => setFlipped((f) => !f)}
            >
              <FlipIcon />
            </button>
            <button class="btn solid" type="button" onClick={() => mark('known')}>
              Know it <Arrow dir="right" />
            </button>
          </div>
        )}
        <div class="sub">
          <button class="link" type="button" disabled={!history.length} onClick={undo}>
            Undo
          </button>
          <span class="keys">Space flip · ← → mark · T translation · U undo</span>
        </div>
      </footer>
    </>
  );
}

function Done({ batchSize, batchKnown, batchLearning, deck, learning, poolLeft, total, onNext, onReview, onLearn }) {
  if (batchSize === 0 && deck === 'review') {
    return (
      <div class="done">
        <h2>Nothing to review</h2>
        <p>No cards are marked "not yet".</p>
        <div class="actions">
          <button class="btn solid" type="button" onClick={onLearn}>Back to new cards</button>
        </div>
      </div>
    );
  }
  if (batchSize === 0) {
    return (
      <div class="done">
        <h2>All {total} known</h2>
        <p>That's the whole A1 list. Reset progress in Options to go again.</p>
      </div>
    );
  }
  return (
    <div class="done">
      <h2>Batch done</h2>
      <p>
        {batchKnown} known · {batchLearning} not yet
      </p>
      <div class="actions">
        {poolLeft > 0 && (
          <button class="btn solid" type="button" onClick={onNext}>
            {deck === 'review' ? 'Review more' : 'Next batch'}
          </button>
        )}
        {deck === 'learn' && learning > 0 && (
          <button class="btn ghost" type="button" onClick={onReview}>
            Review learning ({learning})
          </button>
        )}
        {deck === 'review' && (
          <button class="btn ghost" type="button" onClick={onLearn}>
            Back to new cards
          </button>
        )}
      </div>
    </div>
  );
}

function Arrow({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5" />
      <path d="M20 4v4.5h-4.5" />
      <path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5" />
      <path d="M4 20v-4.5h4.5" />
    </svg>
  );
}
