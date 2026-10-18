import { useRef, useState } from 'preact/hooks';

const SWIPE = 90;

export function Card({ word, flipped, showTr, exit, onFlip, onReveal, onSwipe }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);

  function down(e) {
    if (exit) return;
    start.current = { x: e.clientX, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e) {
    const s = start.current;
    if (!s) return;
    const d = e.clientX - s.x;
    if (!s.moved && Math.abs(d) > 6) {
      s.moved = true;
      setDragging(true);
    }
    if (s.moved) setDx(d);
  }

  function up() {
    const s = start.current;
    start.current = null;
    if (!s) return;
    setDragging(false);
    if (!s.moved) onFlip();
    else if (Math.abs(dx) > SWIPE) onSwipe(dx > 0 ? 'known' : 'unknown');
    setDx(0);
  }

  function cancel() {
    start.current = null;
    setDragging(false);
    setDx(0);
  }

  const transform = exit
    ? `translateX(${exit === 'known' ? 130 : -130}vw) rotate(${exit === 'known' ? 10 : -10}deg)`
    : `translateX(${dx}px) rotate(${dx * 0.04}deg)`;
  const pull = Math.min(1, Math.abs(dx) / SWIPE);
  const stop = (e) => e.stopPropagation();

  return (
    <div
      class={`card-wrap${dragging ? ' drag' : ''}`}
      style={{ transform }}
      role="group"
      aria-roledescription="flashcard"
      aria-label={word.de}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={cancel}
    >
      <div class={`card${flipped ? ' is-flipped' : ''}`}>
        <section class="face front" inert={flipped}>
          {word.article && <span class="article" lang="de">{word.article}</span>}
          <h2 class="word" lang="de" style={{ '--len': Math.max(word.de.length, 7) }}>
            {word.de}
          </h2>
          {word.plural && (
            <p class="plural">
              <span class="pl-label">Plural</span> <span lang="de">{word.plural}</span>
            </p>
          )}
          <p class="hint">Tap to flip</p>
        </section>

        <section class="face back" inert={!flipped}>
          <p class="back-word" lang="de">
            {word.article && `${word.article} `}
            {word.de}
            {word.plural && <span class="back-plural">, {word.plural}</span>}
          </p>
          <p class="meaning">{word.meaning}</p>
          <div class="example-block">
            <p class="example" lang="de">{word.example_de}</p>
            {showTr ? (
              <p class="translation">{word.example_en}</p>
            ) : (
              <button
                class="reveal"
                type="button"
                onPointerDown={stop}
                onClick={(e) => {
                  stop(e);
                  onReveal();
                }}
              >
                Show translation
              </button>
            )}
          </div>
        </section>
      </div>

      {dx !== 0 && (
        <span class={`swipe-label ${dx > 0 ? 'right' : 'left'}`} style={{ opacity: pull }} aria-hidden="true">
          {dx > 0 ? 'Know it' : 'Not yet'}
        </span>
      )}
    </div>
  );
}
