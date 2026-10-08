import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
];

// Development middleware to serve /api/generate-roadmap during `npm run dev`
function roadmapApiDevPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'roadmap-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (url.startsWith('/api/generate-roadmap') && req.method === 'POST') {
          const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

          const chunks: Buffer[] = [];
          req.on('data', (chunk) => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });

          req.on('error', (err) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');

            if (!apiKey) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  error: 'GEMINI_API_KEY is not configured in your .env file.',
                })
              );
              return;
            }

            try {
              const bodyStr = Buffer.concat(chunks).toString('utf8');
              const body = JSON.parse(bodyStr || '{}');
              const { targetRole, currentSkills, hoursPerWeek, timelineMonths } = body;

              if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'targetRole is required and cannot be empty.' }));
                return;
              }

              const safeSkills = Array.isArray(currentSkills) ? currentSkills : [];
              const safeHours = Number(hoursPerWeek) || 15;
              const safeTimeline = Number(timelineMonths) || 12;

              const prompt = `
You are an expert Principal Engineer, Tech Recruiter, and Staff Career Coach building a structured roadmap.sh / GitBook / Notion style interactive documentation curriculum.
Generate a comprehensive, structured JSON career roadmap customized specifically for this candidate:

Candidate Profile & Goal:
- Target Role / Career Goal: "${targetRole.trim()}"
- Verified Current Skills: ${JSON.stringify(safeSkills)}
- Available Study Hours per Week: ${safeHours} hours/week
- Target Timeline to Job-Readiness: ${safeTimeline} months

Curriculum Requirements:
1. Organize into 4 sequential Phase Folders:
   - "Phase 1: Fundamentals & Prerequisites" (Core language/domain foundations, memory models, primitives, environment)
   - "Phase 2: Core Engineering & Service Architecture" (Core tools, services, architecture, testing, API design)
   - "Phase 3: High-Scale Specialization" (Advanced niche skills, distributed systems/concurrency/AI/crypto, performance)
   - "Phase 4: Capstone Architecture & Executive Readiness" (Flagship production capstone, Staff-level system design, interview prep, Target Role achievement)
2. Generate 6 to 10 comprehensive skill/milestone nodes across these phases.
3. Node details MUST include:
   - "quickNotes": 3-4 bullet points summarizing key concepts, mental models, and gotchas.
   - "referenceSites": 2-3 high quality URLs/docs (e.g. Official Docs, GitHub references, RFCs, MDN).
   - "handsOnExercises": 1-2 practical coding challenges or architectural tasks.
   - "whyItMatters": Industry significance & leveling leverage.
   - "practiceStrategy": 2-3 actionable deliberate practice steps.
   - "interviewQuestions": 2 realistic technical questions with detailed answer hints.
   - "recommendedProjects": 1 portfolio-ready proof-of-work project brief.
4. If a skill is in Verified Current Skills (${JSON.stringify(safeSkills)}), mark its status as "completed".
5. Mark 1-2 immediate next focus skills as "active".
6. Missing required skills must have status "missing".
7. The peak target role milestone in Phase 4 has status "target".

You MUST respond ONLY with a raw, valid JSON object matching this schema:
{
  "targetSummary": {
    "targetRole": "${targetRole.trim()}",
    "timelineMonths": ${safeTimeline},
    "hoursPerWeek": ${safeHours},
    "estimatedTotalHours": number,
    "targetSalaryRange": string,
    "marketDemand": string,
    "keyGrowthAreas": string[],
    "readinessScore": number
  },
  "phases": [
    {
      "id": "phase-1",
      "title": "Phase 1: Fundamentals & Prerequisites",
      "timeframe": string,
      "description": string,
      "nodeIds": string[]
    },
    {
      "id": "phase-2",
      "title": "Phase 2: Core Engineering & Service Architecture",
      "timeframe": string,
      "description": string,
      "nodeIds": string[]
    },
    {
      "id": "phase-3",
      "title": "Phase 3: High-Scale Specialization",
      "timeframe": string,
      "description": string,
      "nodeIds": string[]
    },
    {
      "id": "phase-4",
      "title": "Phase 4: Capstone Architecture & Executive Readiness",
      "timeframe": string,
      "description": string,
      "nodeIds": string[]
    }
  ],
  "nodes": [
    {
      "id": string,
      "title": string,
      "category": string,
      "phase": "Phase 1: Fundamentals & Prerequisites" | "Phase 2: Core Engineering & Service Architecture" | "Phase 3: High-Scale Specialization" | "Phase 4: Capstone Architecture & Executive Readiness",
      "status": "completed" | "active" | "missing" | "target",
      "estimatedHours": number,
      "priority": "critical" | "high" | "medium",
      "description": string,
      "whyItMatters": string,
      "prerequisites": string[],
      "quickNotes": string[],
      "referenceSites": [{ "title": string, "url": string, "type": "docs" | "article" | "course" | "github" | "official" }],
      "handsOnExercises": [{ "title": string, "prompt": string, "difficulty": "Easy" | "Medium" | "Hard" }],
      "practiceStrategy": string[],
      "interviewQuestions": [{ "question": string, "topic": string, "difficulty": "Junior" | "Mid" | "Senior" | "Staff", "answerHint": string }],
      "recommendedProjects": [{ "title": string, "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Production", "description": string, "deliverables": string[], "skillsCovered": string[] }]
    }
  ],
  "edges": [
    { "id": string, "source": string, "target": string, "label": string }
  ]
}
Respond ONLY with raw, valid JSON. No markdown formatting.
`;

              let lastError = '';

              for (const modelName of GEMINI_MODELS) {
                try {
                  const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                          temperature: 0.3,
                          responseMimeType: 'application/json',
                        },
                      }),
                    }
                  );

                  if (!geminiRes.ok) {
                    const errText = await geminiRes.text();
                    lastError = `Model ${modelName} returned ${geminiRes.status}: ${errText}`;
                    console.warn(lastError);
                    continue;
                  }

                  const geminiData = (await geminiRes.json()) as {
                    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
                  };
                  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                  const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
                  const parsed = JSON.parse(cleanedText);

                  res.statusCode = 200;
                  res.end(JSON.stringify(parsed));
                  return;
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : 'Unknown error';
                  lastError = `Execution error with ${modelName}: ${msg}`;
                }
              }

              res.statusCode = 502;
              res.end(
                JSON.stringify({
                  error: 'Gemini upstream error across all models.',
                  details: lastError,
                })
              );
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Internal dev server error';
              res.statusCode = 500;
              res.end(JSON.stringify({ error: msg }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      roadmapApiDevPlugin(env),
    ],
  };
});
