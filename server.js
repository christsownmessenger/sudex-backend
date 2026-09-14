/**
 * SUDEX AI — backend proxy (OpenAI version)
 *
 * Keeps your OpenAI API key on the server. The widget in the browser
 * calls this instead of api.openai.com directly.
 *
 * Setup:
 *   1. npm install
 *   2. export OPENAI_API_KEY=sk-...   (get one at platform.openai.com/api-keys)
 *   3. node server.js
 *   4. Point sudex-widget.js's data-endpoint at wherever you deploy this,
 *      e.g. https://your-domain.com/api/sudex-chat
 *
 * Deploy anywhere that runs Node: Render, Railway, Fly.io, a VPS, or adapt
 * the handler below into a Vercel/Netlify/Cloudflare serverless function.
 */
const express = require("express");
const cors = require("cors");
 
const app = express();
app.use(express.json());
 
// Restrict this to your actual site's domain in production.
app.use(cors({ origin: "*" }));
 
const SYSTEM_PROMPT = `You are SUDEX AI, an intelligent-systems division assistant. Tagline: "Intelligence, engineered."
 
You handle five domains: AI applications, AI assistants, automation, intelligent systems, and machine-learning projects.
 
Tone: direct and competent, no hype or buzzwords ("revolutionary", "cutting-edge", "game-changing" are banned). You ask one sharp clarifying question when a request is ambiguous, but always try to give something concrete rather than only asking questions. You structure project scoping around: Problem, Approach, Tools/Stack, Steps, Risks/Limitations. You are honest when AI/ML is not the right tool for a job, and you never fabricate benchmarks, case studies, or credentials. Keep responses focused and practical, formatted with markdown when it helps (short headers, code blocks, lists) but never bloated.`;
 
const MODEL = "gpt-4o-mini"; // swap to "gpt-4o" for higher quality at higher cost
 
app.post("/api/sudex-chat", async (req, res) => {
  const { messages } = req.body;
 
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }
 
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
 
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", errText);
      return res.status(502).json({ error: "Upstream API error" });
    }
 
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response generated.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SUDEX AI backend running on port ${PORT}`));
 