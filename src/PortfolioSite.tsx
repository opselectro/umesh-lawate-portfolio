import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Code2,
  Database,
  Github,
  Linkedin,
  Mail,
  Menu,
  PanelsTopLeft,
  Server,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "./portfolio/Button";
import Chat from "./components/Chat";
import HeroScene from "./components/HeroScene";

import { config, experience, journey, projects, roles, skills, summary } from "./data/portfolio-content";

const navItems = [
  { label: "About", id: "about" },
  { label: "Toolkit", id: "toolkit" },
  { label: "Live work", id: "live-work" },
  { label: "Experience", id: "experience" },
  { label: "Résumé", id: "resume" },
  { label: "Contact", id: "contact" },
];
const skillIcons = { PanelsTopLeft, Server, Database, ShieldCheck, Wrench };

export default function PortfolioSite() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [skillGroup, setSkillGroup] = useState(Object.keys(skills)[0] ?? "Frontend");
  const [roleIndex, setRoleIndex] = useState(0);
 

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("has-motion");
    if (reduceMotion) document.documentElement.classList.add("reduce-motion");
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    ["home", ...navItems.map((item) => item.id)].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
    const interval = reduceMotion ? undefined : window.setInterval(() => setRoleIndex((index) => (index + 1) % roles.length), 3000);

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      if (interval !== undefined) window.clearInterval(interval);
      document.documentElement.classList.remove("has-motion", "reduce-motion");
    };
  }, []);

  

  const selectedSkills = skills[skillGroup]?.items ?? [];
  const SkillIcon = skillIcons[skills[skillGroup]?.icon as keyof typeof skillIcons] ?? Code2;

  return (
    <main className="portfolio-shell portfolio-theme">
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#home" className="brand-mark" aria-label="Umesh Lawate — home"><span>U</span><i>•</i></a>
        <div className={`site-nav-links ${menuOpen ? "is-open" : ""}`}>
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={activeSection === item.id ? "location" : undefined} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <Button asChild size="sm" variant="outline" className="nav-contact"><a href="#contact">Let’s talk <ArrowUpRight /></a></Button>
          <Button size="icon" variant="ghost" className="menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <header className="hero-section" id="home">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> {config.availableText} <span className="eyebrow-divider">/</span> {config.location}</p>
          <p className="hero-pretitle">Thoughtful engineering. Built for what’s next.</p>
          <h1>UMESH<br /><span>LAWATE</span></h1>
          <div className="role-line"><span className="role-prefix">01 /</span><span key={roleIndex} className="role-value">{roles[roleIndex]}</span></div>
          <p className="hero-description">I build secure digital experiences and transaction systems where every detail counts.</p>
          <div className="hero-actions">
            <Button asChild className="button-primary"><a href="#live-work">Explore my work <ArrowDownRight /></a></Button>
            <Button asChild variant="outline" className="button-quiet"><a href="#contact">Get in touch <ArrowUpRight /></a></Button>
          </div>
          <div className="hero-socials" aria-label="Social profiles">
            <a href={config.github} target="_blank" rel="noreferrer"><Github /> GitHub <ArrowUpRight /></a>
            <a href={config.linkedin} target="_blank" rel="noreferrer"><Linkedin /> LinkedIn <ArrowUpRight /></a>
          </div>
        </div>
        <HeroScene />

        <a href="#about" className="scroll-cue"><span>Scroll to explore</span><ArrowDown /></a>
      </header>

      <section className="portfolio-section about-section" id="about">
        <div className="section-heading reveal"><p className="eyebrow"><span>01</span> / A little context</p><h2>From machines<br />to software.</h2></div>
        <div className="about-copy reveal"><p className="section-lede">Engineering has always been about making complex systems work simply.</p><p>{summary}</p><div className="location-line"><span className="status-dot" /> Based in Pune, India <span>·</span> Open to new opportunities</div></div>
        <div className="journey-grid">
          {journey.map((step, index) => (
            <article className="journey-item reveal" key={step.t}>
              <div className="journey-index">0{index + 1} <span /></div>
              <h3>{step.t}</h3><p>{step.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-section toolkit-section" id="toolkit">
        <div className="section-heading reveal"><p className="eyebrow"><span>02</span> / Technical toolkit</p><h2>Tools for the<br />important details.</h2><p className="section-intro">A practical stack for secure, reliable product experiences.</p></div>
        <div className="toolkit-content reveal">
          <div className="skill-tabs" role="tablist" aria-label="Skill categories">
            {Object.keys(skills).map((category, index) => (
              <Button key={category} id={`skill-tab-${index}`} type="button" variant="ghost" className="skill-tab-control" role="tab" aria-selected={skillGroup === category} aria-controls="skill-panel" onClick={() => setSkillGroup(category)}>
                <span>0{index + 1}</span>{category}<ArrowUpRight />
              </Button>
            ))}
          </div>
          <div className="skill-panel" id="skill-panel" role="tabpanel" aria-labelledby={`skill-tab-${Object.keys(skills).indexOf(skillGroup)}`}>
            <div className="skill-panel-heading"><SkillIcon /><span>{skillGroup}</span><span className="skill-count">{String(selectedSkills.length).padStart(2, "0")} skills</span></div>
            <div className="skill-list">
              {selectedSkills.map(([name, description]) => (
                <article key={name} className="skill-row"><span className="skill-check"><Check /></span><div><h3>{name}</h3>{description && <p>{description}</p>}</div><ArrowUpRight className="skill-arrow" /></article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="portfolio-section projects-section" id="live-work">
        <div className="projects-heading reveal"><div className="section-heading"><p className="eyebrow"><span>03</span> / Selected work</p><h2>Live projects.</h2></div><p className="section-intro">A focused collection of projects, made to be explored.</p></div>
        <div className="project-grid">
          {projects.slice(0, 4).map((project, index) => (
            <article className="project-card reveal" key={project.id}>
              <div className="project-card-top"><span>LIVE PROJECT <b>0{index + 1}</b></span><ArrowUpRight /></div>
              <div className="project-card-main"><p className="project-kicker">PORTFOLIO / {String(index + 1).padStart(2, "0")}</p><h3>{project.title}</h3><p className="project-description">{project.description}</p></div>
              <div className="project-card-bottom">
                <div className="project-tags">{project.stack.length ? project.stack.slice(0, 3).map((technology) => <span key={technology}>{technology}</span>) : <span>Live preview</span>}</div>
                {project.url ? <Button asChild size="sm" variant="outline"><a href={project.url} target="_blank" rel="noreferrer">Visit project <ArrowUpRight /></a></Button> : <span className="project-awaiting">Link not added <span>↗</span></span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-section experience-section" id="experience">
        <div className="section-heading reveal"><p className="eyebrow"><span>04</span> / The work behind the work</p><h2>Experience that<br />keeps things moving.</h2></div>
        <div className="experience-list">
          {experience.map((item) => (
            <article className="experience-entry reveal" key={item.company}>
              <div className="experience-meta"><BriefcaseBusiness /><span>{item.period}</span><span>{item.location}</span></div>
              <div className="experience-detail"><p className="experience-company">{item.company}</p><h3>{item.role}</h3><ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul><div className="project-tags">{item.tech.map((technology) => <span key={technology}>{technology}</span>)}</div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-section resume-section" id="resume">
        <div className="section-heading reveal"><p className="eyebrow"><span>05</span> / Résumé</p><h2>Experience,<br />on one page.</h2></div>
       
<div className="resume-content reveal">
  <p>
    Indifly Ventures Pvt Ltd (Sec2Pay E-Services Pvt Ltd)
Software Development Engineer · June 2025 – Sept 2026 · Pune, India
  </p>

  <Button
    asChild
    variant="outline"
    className="resume-download"
  >
    <a
      href="/resume/Umesh-Lawate-Resume.pdf"
      download="Umesh-Lawate-Resume.pdf"
    >
      Download résumé <ArrowDown />
    </a>
  </Button>
</div>

      </section>

      <footer className="contact-section portfolio-footer" id="contact">
        <div className="contact-main reveal"><p className="eyebrow"><span>06</span> / Start a conversation</p><h2>Have something<br /><em>good</em> in mind?</h2><p className="contact-intro">For opportunities, collaborations or an interesting problem to solve.</p><a className="contact-email" href={`mailto:${config.email}`}><Mail /> {config.email} <ArrowUpRight /></a></div>
        <div className="contact-footer"><a className="brand-mark" href="#home" aria-label="Back to top"><span>U</span><i>•</i></a><p>© {new Date().getFullYear()} {config.name}</p><div className="footer-socials"><a href={config.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight /></a><a href={config.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight /></a><a href="#home">Back to top <ArrowUpRight /></a></div></div>
      </footer>
      <Chat />
    </main>
  );
}
