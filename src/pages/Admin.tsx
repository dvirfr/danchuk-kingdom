import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useKingdom } from '../data/KingdomData'
import { parseCsv } from '../lib/csv'
import { rowToCoupon } from '../data/coupons'
import type { Coupon } from '../types'
import { ChapterAdmin, PhotoAdmin, PinAdmin } from './AdminContent'

// Admin tools are for Dvir only and stay in English on purpose.
export function Admin() {
  const { backend, coupons, previewAll, setPreviewAll, simAt, setSimAt } = useKingdom()
  const [pending, setPending] = useState<Coupon[] | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(file: File) {
    setMsg(null)
    setErr(null)
    setPending(null)
    try {
      const text = await file.text()
      const rows = file.name.endsWith('.json') ? (JSON.parse(text) as Record<string, string>[]) : parseCsv(text)
      const list = rows.map((r, i) => rowToCoupon(
        Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '')])),
        i + 2,
      ))
      const ids = new Set<string>()
      for (const c of list) {
        if (ids.has(c.id)) throw new Error(`Duplicate id ${c.id}`)
        ids.add(c.id)
      }
      setPending(list)
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  async function doImport() {
    if (!pending) return
    setBusy(true)
    try {
      const n = await backend.importCoupons(pending)
      setMsg(`Imported ${n} coupons ✨`)
      setPending(null)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function doReset() {
    if (!window.confirm('Reset ALL redemptions, ratings and chapter progress? Coupons stay.')) return
    setBusy(true)
    try {
      await backend.resetAllState()
      setMsg('All game state reset.')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const count = (section: string) => coupons.filter((c) => c.section === section).length

  return (
    <main className="page admin" dir="ltr">
      <header className="page-head">
        <Link to="/" className="back">
          ←
        </Link>
        <h1 className="title small">Royal Admin</h1>
      </header>

      <section className="card left">
        <h2>Coupons</h2>
        <p className="muted">
          In the kingdom now: {count('regular')} regular · {count('after_dark')} After Dark
        </p>
        <p className="muted small-text">
          Upload <b>coupons.csv</b> (save as "CSV UTF-8" from Excel/Sheets) or coupons.json. Importing updates
          coupon texts by id; it never touches redemptions.
        </p>
        <label className="btn-outline file">
          Choose file…
          <input type="file" accept=".csv,.json,text/csv,application/json" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} hidden />
        </label>
        {pending && (
          <div className="import-preview">
            <p>
              Ready: <b>{pending.length}</b> coupons ({pending.filter((c) => c.section === 'regular').length} regular,{' '}
              {pending.filter((c) => c.section === 'after_dark').length} After Dark).
            </p>
            <ul>
              {pending.slice(0, 3).map((c) => (
                <li key={c.id}>
                  {c.icon} {c.id} · {c.title_en} / {c.title_he}
                </li>
              ))}
              {pending.length > 3 && <li>…</li>}
            </ul>
            <button className="btn-gold" onClick={doImport} disabled={busy}>
              Import {pending.length} coupons
            </button>
          </div>
        )}
      </section>

      <PhotoAdmin />
      <ChapterAdmin />
      <PinAdmin />

      <section className="card left">
        <h2>Preview</h2>
        <label className="toggle">
          <input type="checkbox" checked={previewAll} onChange={(e) => setPreviewAll(e.target.checked)} />
          Show everything unlocked on this device (only you see this)
        </label>
        <h3 className="admin-h3">See it exactly as Dana will</h3>
        <p className="muted small-text">
          Turn preview off and pick a moment. Your phone pretends it's that time, so you see her real view (locks, unlocked
          coupons, night cards). Only on your device; turn it off when done.
        </p>
        <div className="sim-buttons">
          {[
            ['Birthday morning', '2026-11-25T08:00:00+02:00'],
            ['Birthday 21:00 (1st night card)', '2026-11-25T21:00:00+02:00'],
            ['3 Dec (chapter 4 open)', '2026-12-03T12:00:00+02:00'],
            ['17 Dec (all chapters)', '2026-12-17T12:00:00+02:00'],
          ].map(([label, iso]) => (
            <button
              key={label}
              className={`chip ${simAt === new Date(iso).getTime() ? 'on' : ''}`}
              onClick={() => {
                setPreviewAll(false)
                setSimAt(new Date(iso).getTime())
              }}
            >
              {label}
            </button>
          ))}
          {simAt && (
            <button className="chip" onClick={() => setSimAt(null)}>
              ✕ Real time
            </button>
          )}
        </div>
        {simAt && <p className="small-text ok">Pretending it's {new Date(simAt).toLocaleString('en-GB')}</p>}
      </section>

      <section className="card left">
        <h2>Danger zone</h2>
        <button className="btn-outline danger" onClick={doReset} disabled={busy}>
          Reset all game state
        </button>
      </section>

      {msg && <p className="ok">{msg}</p>}
      {err && <p className="error">{err}</p>}
    </main>
  )
}
