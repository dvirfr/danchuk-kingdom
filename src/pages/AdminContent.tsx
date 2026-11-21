import { useState } from 'react'
import { useKingdom } from '../data/KingdomData'
import { newId } from '../data/backend'
import { compressPhoto } from '../lib/image'
import { CHAPTER_ICON } from '../data/chapters'
import type { ChapterContent, PhotoMeta } from '../types'
import { DEFAULT_PIN, hashPin } from '../data/afterDark'

// Admin-only tools (English UI on purpose). Photos + chapter texts and dates.

export function PhotoAdmin() {
  const { backend, photos, chapters } = useKingdom()
  const [chapter, setChapter] = useState(1)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function upload(files: FileList) {
    setBusy(true)
    let ok = 0
    const list = Array.from(files)
    for (const [i, f] of list.entries()) {
      setStatus(`Compressing & uploading ${i + 1} / ${list.length}…`)
      try {
        const { full, thumb, w, h } = await compressPhoto(f)
        await backend.addPhoto({ id: newId(), chapter, createdAt: Date.now(), w, h, thumb }, full)
        ok++
      } catch (e) {
        console.error(e)
        setStatus(`Failed on ${f.name}: ${(e as Error).message ?? e}`)
      }
    }
    setStatus(`Uploaded ${ok} of ${list.length} photos to chapter ${chapter} ✨`)
    setBusy(false)
  }

  return (
    <section className="card left">
      <h2>Photos</h2>
      <p className="muted small-text">
        Photos are resized and compressed on your device, then stored privately in Firebase (never on GitHub). Aim for
        6–8 per chapter. HEIC files from iPhone work in Safari.
      </p>
      <div className="admin-row">
        <select value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
          {chapters.map((c) => (
            <option key={c.n} value={c.n}>
              {CHAPTER_ICON[c.n]} {c.n}. {c.title_en}
            </option>
          ))}
        </select>
        <label className={`btn-outline small file ${busy ? 'disabled' : ''}`}>
          Add photos…
          <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>
      {status && <p className="small-text">{status}</p>}

      {chapters.map((c) => {
        const list = photos.filter((p) => p.chapter === c.n)
        return (
          <details key={c.n} className="admin-group" open={list.length > 0 && list.length < 4}>
            <summary>
              {CHAPTER_ICON[c.n]} Chapter {c.n} · {list.length} photo{list.length === 1 ? '' : 's'}
            </summary>
            <div className="photo-admin-list">
              {list.map((p) => (
                <PhotoRow key={p.id} p={p} />
              ))}
              {list.length === 0 && <p className="muted small-text">No photos yet.</p>}
            </div>
          </details>
        )
      })}
    </section>
  )
}

function PhotoRow({ p }: { p: PhotoMeta }) {
  const { backend, chapters } = useKingdom()
  const [f, setF] = useState({ caption: p.caption ?? '', quizQ: p.quizQ ?? '', quizA: p.quizA ?? '', quizW1: p.quizW1 ?? '', quizW2: p.quizW2 ?? '' })
  const [saved, setSaved] = useState(false)
  const dirty = Object.entries(f).some(([k, v]) => v !== ((p as Record<string, unknown>)[k] ?? ''))

  const save = async () => {
    await backend.updatePhoto(p.id, f)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="photo-row">
      <img src={p.thumb} alt="" />
      <div className="photo-fields">
        <div className="admin-row">
          <select value={p.chapter} onChange={(e) => backend.updatePhoto(p.id, { chapter: Number(e.target.value) })}>
            {chapters.map((c) => (
              <option key={c.n} value={c.n}>
                Ch. {c.n}
              </option>
            ))}
          </select>
          <button
            className="btn-link danger-link"
            onClick={() => window.confirm('Delete this photo?') && backend.deletePhoto(p.id)}
          >
            Delete
          </button>
        </div>
        <input placeholder="Caption (optional, shown in scratch cards)" value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} />
        <details>
          <summary className="small-text">Quiz question (optional)</summary>
          <input placeholder="Question, e.g. איפה זה היה?" value={f.quizQ} onChange={(e) => setF({ ...f, quizQ: e.target.value })} />
          <input placeholder="✓ Right answer" value={f.quizA} onChange={(e) => setF({ ...f, quizA: e.target.value })} />
          <input placeholder="✗ Wrong answer 1" value={f.quizW1} onChange={(e) => setF({ ...f, quizW1: e.target.value })} />
          <input placeholder="✗ Wrong answer 2" value={f.quizW2} onChange={(e) => setF({ ...f, quizW2: e.target.value })} />
        </details>
        {(dirty || saved) && (
          <button className="btn-gold small" onClick={save} disabled={!dirty}>
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

const toLocal = (ms: number) => {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ChapterAdmin() {
  const { chapters } = useKingdom()
  return (
    <section className="card left">
      <h2>Chapters</h2>
      <p className="muted small-text">
        Story = shown before the game. Love note = revealed after she wins. Line breaks are kept. Empty fields fall back to
        the placeholder text.
      </p>
      {chapters.map((c) => (
        <ChapterForm key={c.n} c={c} />
      ))}
    </section>
  )
}

function ChapterForm({ c }: { c: ChapterContent }) {
  const { backend } = useKingdom()
  const [f, setF] = useState(c)
  const [saved, setSaved] = useState(false)
  const set = (k: keyof ChapterContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value })

  const save = async () => {
    await backend.saveChapter({ ...f, opensAt: Number(f.opensAt) })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <details className="admin-group">
      <summary>
        {CHAPTER_ICON[c.n]} {c.n}. {c.title_en} — opens {new Date(c.opensAt).toLocaleDateString('en-GB')}
      </summary>
      <div className="chapter-form">
        <label>Title (HE)<input dir="rtl" value={f.title_he} onChange={set('title_he')} /></label>
        <label>Title (EN)<input value={f.title_en} onChange={set('title_en')} /></label>
        <label>Story (HE)<textarea dir="rtl" rows={4} value={f.story_he} onChange={set('story_he')} /></label>
        <label>Story (EN)<textarea rows={4} value={f.story_en} onChange={set('story_en')} /></label>
        <label>Love note (HE)<textarea dir="rtl" rows={4} value={f.note_he} onChange={set('note_he')} /></label>
        <label>Love note (EN)<textarea rows={4} value={f.note_en} onChange={set('note_en')} /></label>
        <label>
          Opens at (your local time)
          <input
            type="datetime-local"
            value={toLocal(Number(f.opensAt))}
            onChange={(e) => setF({ ...f, opensAt: new Date(e.target.value).getTime() })}
          />
        </label>
        <button className="btn-gold small" onClick={save}>
          {saved ? 'Saved ✓' : `Save chapter ${c.n}`}
        </button>
      </div>
    </details>
  )
}

export function PinAdmin() {
  const { backend, settings } = useKingdom()
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const valid = /^\d{4,8}$/.test(pin)
  return (
    <section className="card left">
      <h2>🌙 After Dark</h2>
      <p className="muted small-text">
        Secret entrance: on the Kingdom Map, press and hold the small 🌙 in the top corner for about a second.
        {settings.pinHash ? ' A custom PIN is set.' : ` No custom PIN yet — the default is ${DEFAULT_PIN}.`} The PIN is stored
        only as a hash.
      </p>
      <div className="admin-row">
        <input
          inputMode="numeric"
          placeholder="New PIN (4–8 digits)"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          style={{ flex: 1 }}
        />
        <button
          className="btn-gold small"
          disabled={!valid}
          onClick={async () => {
            await backend.savePinHash(await hashPin(pin))
            setPin('')
            setMsg('PIN saved ✓')
          }}
        >
          Save PIN
        </button>
      </div>
      {msg && <p className="ok small-text">{msg}</p>}
    </section>
  )
}
