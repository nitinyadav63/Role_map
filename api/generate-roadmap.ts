import type { VercelRequest, VercelResponse } from '@vercel/node';

// Support modern Gemini flash models with fallback redundancy
const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Server configuration error: GEMINI_API_KEY environment variable is missing or empty in .env.',
    });
  }

  const { targetRole, currentSkills, hoursPerWeek, timelineMonths } = req.body || {};

  if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
    return res.status(400).json({ error: 'targetRole is required and cannot be empty.' });
  }

  const safeSkills: string[] = Array.isArray(currentSkills) ? currentSkills : [];
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

You MUST respond ONLY with a raw, valid JSON object matching this exact TypeScript schema:

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
      "referenceSites": [
        {
          "title": string,
          "url": string,
          "type": "docs" | "article" | "course" | "github" | "official"
        }
      ],
      "handsOnExercises": [
        {
          "title": string,
          "prompt": string,
          "difficulty": "Easy" | "Medium" | "Hard"
        }
      ],
      "practiceStrategy": string[],
      "interviewQuestions": [
        {
          "question": string,
          "topic": string,
          "difficulty": "Junior" | "Mid" | "Senior" | "Staff",
          "answerHint": string
        }
      ],
      "recommendedProjects": [
        {
          "title": string,
          "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Production",
          "description": string,
          "deliverables": string[],
          "skillsCovered": string[]
        }
      ]
    }
  ],
  "edges": [
    {
      "id": string,
      "source": string,
      "target": string,
      "label": string
    }
  ]
}

DO NOT include markdown formatting like \`\`\`json. Return only pure parseable JSON.
`;

  let lastError = '';

  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `Model ${modelName} returned ${response.status}: ${errorText}`;
        console.warn(lastError);
        continue; // Try next model in fallback list
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastError = `Empty output received from model ${modelName}`;
        continue;
      }

      const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsedData = JSON.parse(cleanedText);

      return res.status(200).json(parsedData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown model fetch error';
      lastError = `Execution error with ${modelName}: ${errorMessage}`;
      console.warn(lastError);
    }
  }

  // If all models failed, return real descriptive error
  return res.status(502).json({
    error: 'Failed to generate roadmap from Gemini API across all models.',
    details: lastError,
  });
}
