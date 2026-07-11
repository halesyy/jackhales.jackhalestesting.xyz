import { ArrowUpRight, BookOpen, Boxes, CloudCog, Code2, Database, PlugZap, TrendingUp } from "lucide-react";
import Head from "next/head";
import Image from "next/image";

import { MotionLink, Reveal, Stagger, StaggerItem } from "../components/Motion";
import { SiteShell } from "../components/SiteShell";

const languages = ["JavaScript", "TypeScript", "Python", "Rust", "SQL", "Bash", "PHP", "HTML", "CSS"];
const platforms = ["Machine learning", "Model evaluation", "Scikit-learn", "Optuna", "LangChain", "OpenAI API", "Anthropic API", "Agent workflows", "MCP", "Embeddings", "Vector search", "Next.js", "React", "Node.js", "FastAPI", "MongoDB", "PostgreSQL", "Docker", "AWS", "GCP"];
const integrations = [
  { title: "Pharmacy", values: ["Z Software", "Minfos", "Fred Office", "Fred NXT", "Simple", "RxOne", "Surefire"] },
  { title: "Logistics", values: ["Logwin", "DP World", "CHR", "Röhlig"] },
  { title: "Commerce & CRM", values: ["Shopify", "Salesforce", "Stripe"] },
];

export default function BackgroundPage() {
  return (
    <SiteShell>
      <Head>
        <title>Experience — Jack Hales</title>
        <meta name="description" content="Jack Hales' experience across software products, data platforms, integrations and technical research." />
      </Head>

      <Reveal className="page-hero page-hero-row">
        <div>
          <p className="eyebrow">Background & experience</p>
          <h1 className="display-title">Building from principles to <span className="accent">production.</span></h1>
        </div>
        <p className="lead page-side-lead">I work primarily as an AI engineer, designing intelligent flows and solving technical problems across product, data, backend and infrastructure boundaries.</p>
      </Reveal>

      <section className="experience-intro-grid">
        <Reveal className="experience-statement card">
          <span className="icon-tile icon-blue"><Code2 size={21} /></span>
          <p className="eyebrow">How I work</p>
          <h2>AI engineering without language dogma.</h2>
          <p>I work across languages and frameworks according to the needs of each project. My focus is building useful AI flows, connecting models to reliable systems and solving the surrounding technical problems from product definition through deployment and iteration.</p>
        </Reveal>
        <Reveal className="skill-panel card" delay={0.08}>
          <div><span className="icon-tile icon-mint"><Boxes size={21} /></span><p className="eyebrow">Project-dependent languages</p></div>
          <div className="tag-list">{languages.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
        </Reveal>
        <Reveal className="skill-panel card" delay={0.16}>
          <div><span className="icon-tile icon-peach"><CloudCog size={21} /></span><p className="eyebrow">AI, frameworks & platforms</p></div>
          <div className="tag-list">{platforms.map((item) => <span className="tag" key={item}>{item}</span>)}</div>
        </Reveal>
      </section>

      <section className="section-block">
        <Reveal className="section-heading">
          <div><p className="eyebrow">Selected product work</p><h2>Long-running systems, not just launches.</h2></div>
          <p>Products developed around the day-to-day realities of Australian pharmacy and supply-chain operations.</p>
        </Reveal>
        <div className="case-study-stack">
          <Reveal>
            <MotionLink href="https://www.pharmaportal.com.au" target="_blank" rel="noreferrer" className="case-study card" whileHover={{ y: -6 }}>
              <div className="case-study-image"><Image src="/pharma-portal-landing.png" fill sizes="(max-width: 768px) 100vw, 48vw" alt="Pharma Portal landing page" /></div>
              <div className="case-study-copy">
                <div className="case-label"><span>2021 — current</span><ArrowUpRight size={18} /></div>
                <p className="eyebrow">Data & reporting platform</p>
                <h3>Pharma Portal</h3>
                <p>A pharmacy operations and reporting platform integrating major POS and dispensing systems. I developed the system end to end, including secure data transfer, processing pipelines and decision-focused reporting.</p>
                <div className="tag-list"><span className="tag">Data pipelines</span><span className="tag">Reporting</span><span className="tag">Infrastructure</span></div>
              </div>
            </MotionLink>
          </Reveal>
          <Reveal>
            <MotionLink href="https://www.shreem.au" target="_blank" rel="noreferrer" className="case-study card case-study-reverse" whileHover={{ y: -6 }}>
              <div className="case-study-copy">
                <div className="case-label"><span>2024 — 2025</span><ArrowUpRight size={18} /></div>
                <p className="eyebrow">Marketplace engineering</p>
                <h3>Shreem</h3>
                <p>An Australian pharmacy marketplace connecting pharmacies directly with suppliers. I translated client wireframes into a complete system with dynamic pricing, multi-supplier carts, stock synchronisation and payments.</p>
                <div className="tag-list"><span className="tag">Product system</span><span className="tag">Supplier integrations</span><span className="tag">Stripe</span></div>
              </div>
              <div className="case-study-image"><Image src="/shreem-landing.png" fill sizes="(max-width: 768px) 100vw, 48vw" alt="Shreem supplier marketplace landing page" /></div>
            </MotionLink>
          </Reveal>
        </div>
      </section>

      <section className="section-block">
        <Reveal className="section-heading">
          <div><p className="eyebrow">Integration experience</p><h2>Connecting the operational stack.</h2></div>
          <p>Experience joining systems across pharmacy, logistics, payments, commerce and CRM.</p>
        </Reveal>
        <Stagger className="integration-grid">
          {integrations.map((group, index) => (
            <StaggerItem key={group.title}>
              <div className={`integration-card card integration-${index}`}>
                <span className="icon-tile">{index === 0 ? <Database size={20} /> : index === 1 ? <PlugZap size={20} /> : <CloudCog size={20} />}</span>
                <h3>{group.title}</h3>
                <div className="tag-list">{group.values.map((value) => <span className="tag" key={value}>{value}</span>)}</div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section-block experiments-grid">
        <Reveal className="experiment-card card">
          <span className="icon-tile icon-peach"><TrendingUp size={20} /></span>
          <p className="eyebrow">Early experiments · 2020</p>
          <h3>Betfair automation</h3>
          <p>While still in high school, I built a browser extension to model live race progress and automate a betting strategy. The project evolved from page-level data extraction into a proper API integration—and an early lesson in the distance between a model and a market.</p>
          <div className="tag-list"><span className="tag">Chrome extensions</span><span className="tag">APIs</span><span className="tag">Multivariate problems</span></div>
        </Reveal>
        <Reveal className="experiment-card card" delay={0.08}>
          <span className="icon-tile icon-blue"><TrendingUp size={20} /></span>
          <p className="eyebrow">Systems research · 2022—23</p>
          <h3>Binance arbitrage</h3>
          <p>I explored N-dimensional arbitrage by calculating trading graphs and reacting to live order-book updates. Implemented in Python and Rust, it became a practical study in optimisation, edge risk and the failure modes that appear when theory meets a live market.</p>
          <div className="tag-list"><span className="tag">Python</span><span className="tag">Rust</span><span className="tag">Graph optimisation</span></div>
        </Reveal>
      </section>

      <Reveal className="book-card card">
        <div className="book-cover"><Image src="/black-swan-book.jpg" fill sizes="220px" alt="The Black Swan by Nassim Nicholas Taleb" /></div>
        <div className="book-copy">
          <p className="eyebrow">Most impactful book</p>
          <h2>The Black Swan</h2>
          <p className="book-author">Nassim Nicholas Taleb</p>
          <p>It fundamentally changed how I think about models, extreme events and the limits of prediction. Its ideas continue to shape how I approach raw data, uncertainty and technical decision-making.</p>
          <div className="tag-list mt-4"><span className="tag">Probability</span><span className="tag">Risk</span><span className="tag">Complex systems</span><span className="tag">Epistemology</span></div>
          <span className="book-mark"><BookOpen size={16} /> Read 5+ times — and not counting.</span>
        </div>
      </Reveal>
    </SiteShell>
  );
}
