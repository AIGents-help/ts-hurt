import Image from 'next/image';
import {ProductGrid} from '../components/ProductGrid';
import {InlineCapture} from '../components/EmailCapture';

export default function Home() {
  return (
    <main>
      <section className="hero" id="top">
        <div className="heroText">
          <p className="eyebrow">● TRANSMITTING FROM THE UNDERGROUND / EST. 2026</p>
          <h1>FEELINGS<br /><em>SOLD</em><br />SEPARATELY<span>.</span></h1>
          <p className="tagline">Politically incorrect. Socially questionable.<br />Uncomfortably original.</p>
          <a className="action" href="#inventory">ENTER THE INVENTORY ↗</a>
          <p className="disclaimer">WARNING: CONTENT MAY CAUSE UNAUTHORIZED THINKING.</p>
        </div>
        <div className="heroMark">
          <div className="barbed">×━━━━━━━━×━━━━━━━━×</div>
          <Image className="officialHeroLogo" src="/brand/ts-hurt-primary.png" alt="TS-HURT — Feelings Sold Separately" width={1536} height={1024} priority sizes="(max-width: 860px) 90vw, 44vw" />
          <div className="heroSub">FEELINGS SOLD SEPARATELY</div>
          <div className="barbed">×━━━━━━━━×━━━━━━━━×</div>
          <p>TS-HURT // UNDERGROUND PRINT OPERATION</p>
        </div>
      </section>
      <div className="marquee">/// NEW DROPS EVERY WEEK /// FREE SHIPPING OVER $60 /// FEELINGS SOLD SEPARATELY /// PRINTED TO ORDER ///</div>
      <section id="inventory" className="inventory"><ProductGrid /></section>
      <section id="operation" className="operation">
        <div className="stamp"><Image className="officialBadge" src="/brand/ts-hurt-badge.png" alt="TS-HURT Underground Print Operation badge" width={1254} height={1254} sizes="(max-width: 860px) 65vw, 30vw" /><span>TS-HURT</span><strong>UNDERGROUND<br />PRINT OPERATION</strong><small>FEELINGS SOLD SEPARATELY</small></div>
        <div>
          <p className="eyebrow">DEPARTMENT 02 / WHAT YOU WALKED INTO</p>
          <h2>YOU FOUND<br />THE <span>OPERATION.</span></h2>
          <p>Somewhere between a basement print shop and a very bad idea, TS-HURT was born. We make shirts that start conversations, stop conversations, and sometimes make a room go silent.</p>
          <p>Satire, grit, uncomfortable truths, and motivational damage. We print the ideas. You decide what to do with them.</p>
        </div>
      </section>
      <section id="manifesto" className="manifesto">
        <div><p className="eyebrow">DEPARTMENT 03 / INTERNAL MEMORANDUM</p><h2>THIS ISN&apos;T FOR <em>EVERYONE.</em></h2><p>We&apos;re fine with that.</p><a className="action" href="#inventory">FIND YOUR SHIRT ↗</a></div>
        <div className="press"><Image className="officialPress" src="/brand/ts-hurt-press.png" alt="TS-HURT printing press brand illustration" width={1536} height={1024} sizes="(max-width: 860px) 80vw, 35vw" />▰<span>TS-HURT</span><small>PRINTED UNDER PRESSURE</small></div>
      </section>
      <InlineCapture />
    </main>
  );
}
