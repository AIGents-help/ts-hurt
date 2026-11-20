'use client';
import {useState, type FormEvent} from 'react';
import {supabaseBrowser} from '../lib/supabase/client';
import {SIZES} from '../lib/products';
import type {Profile} from '../lib/supabase/server';

const FIELDS: [keyof Profile, string, string?][] = [
  ['full_name', 'Full name', 'name'], ['phone', 'Phone', 'tel'],
  ['address_line1', 'Address', 'address-line1'], ['address_line2', 'Apt / unit', 'address-line2'],
  ['city', 'City', 'address-level2'], ['state', 'State / province', 'address-level1'], ['postal_code', 'ZIP / postal', 'postal-code'],
];

export function ProfileForm({profile}: {profile: Profile}) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const clean = (k: string) => { const v = String(f.get(k) ?? '').trim().slice(0, 120); return v || null; };
    setState('saving');
    const {error} = await supabaseBrowser().from('profiles').update({
      ...Object.fromEntries(FIELDS.map(([k]) => [k, clean(k)])),
      country: f.get('country') === 'CA' ? 'CA' : 'US',
      shirt_size: clean('shirt_size'),
      marketing_opt_in: f.get('marketing_opt_in') === 'on',
    }).eq('id', profile.id);
    setState(error ? 'error' : 'saved');
  }
  return (
    <form className="profileForm" onSubmit={save} onChange={() => state === 'saved' && setState('idle')}>
      <label>Email<input value={profile.email} disabled /></label>
      {FIELDS.map(([k, label, ac]) => <label key={k}>{label}<input name={k} defaultValue={(profile[k] as string) ?? ''} autoComplete={ac} maxLength={120} /></label>)}
      <label>Country<select name="country" defaultValue={profile.country}><option value="US">United States</option><option value="CA">Canada</option></select></label>
      <label>Your size<select name="shirt_size" defaultValue={profile.shirt_size ?? ''}><option value="">—</option>{SIZES.map(s => <option key={s}>{s}</option>)}</select></label>
      <label className="check"><input type="checkbox" name="marketing_opt_in" defaultChecked={profile.marketing_opt_in} /> Email me new drops and deals</label>
      <button className="action" disabled={state === 'saving'}>{state === 'saving' ? 'SAVING…' : state === 'saved' ? 'SAVED ✓' : 'SAVE PROFILE'}</button>
      {state === 'error' && <small style={{color: 'var(--red)'}}>Couldn&apos;t save. Try again.</small>}
    </form>
  );
}
