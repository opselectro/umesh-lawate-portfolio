import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "../portfolio/Button";
import {
  config,
  projects,
  skills,
  experience,
  journey,
  summary,
} from "../data/portfolio-content";

type Message = { role: "user" | "assistant"; content: string };
const suggestions = ["What technologies does Umesh use?", "Tell me about his fintech experience", "How can I contact him?"];


function localAnswer(question: string): string {
  const text = question.toLowerCase();

  const allSkills = Object.entries(skills)
    .map(([category, group]) =>
      `${category}: ${group.items.map(([name]) => name).join(", ")}`
    )
    .join("\n");

  if (/hello|hi|hey|good morning|good evening/.test(text)) {
    return "Hello! I'm Umesh's portfolio assistant. I can help you learn about his professional experience, technical skills, projects and career background.";
  }

  if (/education|degree|college|university|mechanical|qualification/.test(text)) {
    return journey
      .map((item) => `${item.t}: ${item.d}`)
      .join("\n\n");
  }

  if (/skill|technology|technologies|tech stack|programming language|frontend|backend|database/.test(text)) {
    return `Umesh's technical skills include:\n\n${allSkills}`;
  }

  if (/fintech|wallet|ledger|fund transfer|reconciliation|transaction|otp|kyc/.test(text)) {
    const job = experience[0];

    return `${job.role} at ${job.company} (${job.period}).\n\n${job.points.join("\n")}`;
  }

  if (/project|portfolio work|website|developed|built|application/.test(text)) {
    return projects
      .map((project) =>
        `${project.title}\n${project.description}\nTechnologies: ${project.stack.join(", ")}\nLive: ${project.url}`
      )
      .join("\n\n");
  }

  if (/experience|career|company|employment|worked|professional background/.test(text)) {
    return experience
      .map((job) =>
        `${job.role}\n${job.company}\n${job.location}\n${job.period}\n${job.points.join("\n")}`
      )
      .join("\n\n");
  }

  if (/contact|email|phone|linkedin|github|hire|reach/.test(text)) {
    return `You can contact Umesh through:\n\nEmail: ${config.email}\nPhone: ${config.phone}\nLinkedIn: ${config.linkedin}\nGitHub: ${config.github}`;
  }

  if (/available|opportunity|job|hiring|join/.test(text)) {
    return `Umesh is ${config.availableText} and is based in ${config.location}.`;
  }

  if (/who is|about umesh|tell me about umesh|introduce/.test(text)) {
    return summary;
  }

  return "I can help you with Umesh's professional experience, education, technical skills, fintech background, projects and contact information. Could you please ask a more specific question?";
}


export default function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I'm Umesh's portfolio assistant. Ask me about his skills, projects or experience." },
  ]);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"connected" | "offline">("connected");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("open-ai", show);
    return () => window.removeEventListener("open-ai", show);
  }, []);

  async function send(question: string) {
    const value = question.trim().slice(0, 500);
    if (!value || busy) return;
    const next = [...messages, { role: "user" as const, content: value }];
    setMessages(next);
    setText("");
    setBusy(true);
    let answer = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  messages: next
    .filter((message, index) =>
      !(index === 0 && message.role === "assistant")
    )
    .slice(-10),
})
      });
      if (!response.ok) throw new Error("Assistant service unavailable");
      const result = await response.json();
      if (typeof result.reply !== "string") throw new Error("No assistant reply");
      answer = result.reply;
      setMode("connected");
    } catch {
      answer = localAnswer(value);
      setMode("offline");
    }
    setMessages((current) => [...current, { role: "assistant", content: answer }]);
    setBusy(false);
  }

  return (
    <>
      <Button className="assistant-launch" size="icon" aria-label={open ? "Close Umesh AI assistant" : "Open Umesh AI assistant"} onClick={() => setOpen((value) => !value)}>
        {open ? <X /> : <Sparkles />}
      </Button>
      {open && (
          <section className="assistant-panel" role="dialog" aria-label="Umesh AI assistant">
            <header className="assistant-header">
              <span className="assistant-title"><Bot size={17} /> Umesh AI</span>
              <span className="assistant-mode"><i /> {mode === "offline" ? "Quick answers" : "Ready to help"}</span>
            </header>
            <div className="assistant-messages" aria-live="polite">
              {messages.map((message, index) => (
                <p className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</p>
              ))}
              {busy && <p className="assistant-message assistant"><span className="assistant-loading">Thinking…</span></p>}
              <div ref={end} />
            </div>
            {messages.length < 3 && (
              <div className="assistant-suggestions">
                {suggestions.map((suggestion) => <Button key={suggestion} variant="outline" className="assistant-suggestion" onClick={() => void send(suggestion)}>{suggestion}</Button>)}
              </div>
            )}
            <form className="assistant-form" onSubmit={(event) => { event.preventDefault(); void send(text); }}>
              <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Ask about Umesh…" maxLength={500} aria-label="Message Umesh AI" />
              <Button size="icon" aria-label="Send message" disabled={busy || !text.trim()}><Send /></Button>
            </form>
          </section>
      )}
    </>
  );
}
