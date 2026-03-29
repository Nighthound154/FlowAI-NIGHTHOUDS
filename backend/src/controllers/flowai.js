const OpenAI = require('openai');
const { validationResult } = require('express-validator');
const db = require('../db');

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const buildPrompt = (idea) => `Idea: "${idea}". Return ONLY valid JSON no markdown no extra text: {"title":"short title","research":{"market_opportunity":"2-3 sentences","target_audience":["s1","s2","s3"],"competitors":["A","B","C"],"competitive_edge":"2 sentences","market_size":"market size","pain_points":["p1","p2","p3"]},"plan":{"tech_stack":["T1","T2","T3","T4"],"mvp_features":["f1","f2","f3","f4"],"phases":[{"name":"Phase 1","description":"desc","deliverable":"output"},{"name":"Phase 2","description":"desc","deliverable":"output"},{"name":"Phase 3","description":"desc","deliverable":"output"}],"risks":["r1","r2","r3"]},"content":{"elevator_pitch":"one sentence","tagline":"short tagline","brand_voice":["t1","t2","t3"],"social_posts":["linkedin","twitter","instagram"],"pitch_deck_outline":["s1","s2","s3","s4","s5"]},"learning":{"skills":[{"skill":"name","why":"reason","resource":"where","time":"duration"},{"skill":"name","why":"reason","resource":"where","time":"duration"},{"skill":"name","why":"reason","resource":"where","time":"duration"}],"timeline":"total time","quick_wins":["today","this week","this month"]}}`;

const generate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { idea } = req.body;
  const userId = req.user.id;
  try {
    const completion = await client.chat.completions.create({
      model: 'nvidia/nemotron-3-super-120b-a12b:free',
      messages: [
        { role: 'system', content: 'You are FlowAI. Return ONLY valid JSON. No markdown, no explanation.' },
        { role: 'user', content: buildPrompt(idea) }
      ],
    });
    const rawText = completion.choices[0].message.content;
    let data;
    try { data = JSON.parse(rawText.replace(/```json|```/g, '').trim()); }
    catch { return res.status(500).json({ error: 'AI returned bad response. Try again.' }); }
    const projectResult = await db.query(
      `INSERT INTO projects (user_id, title, idea, status) VALUES ($1, $2, $3, 'completed') RETURNING id, title, idea, status, created_at`,
      [userId, data.title || idea.slice(0, 80), idea]
    );
    const project = projectResult.rows[0];
    for (const mod of ['research','plan','content','learning']) {
      if (data[mod]) await db.query('INSERT INTO project_results (project_id, module, data) VALUES ($1, $2, $3)', [project.id, mod, JSON.stringify(data[mod])]);
    }
    res.status(201).json({ project, results: data });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
};

const getProjects = async (req, res) => {
  try {
    const result = await db.query(`SELECT id, title, idea, status, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.id]);
    res.json({ projects: result.rows });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch projects' }); }
};

const getProject = async (req, res) => {
  try {
    const projectResult = await db.query('SELECT id, title, idea, status, created_at FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (projectResult.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const project = projectResult.rows[0];
    const resultsResult = await db.query('SELECT module, data FROM project_results WHERE project_id = $1', [project.id]);
    const results = {};
    resultsResult.rows.forEach((r) => { results[r.module] = r.data; });
    res.json({ project, results });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch project' }); }
};

const deleteProject = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete project' }); }
};

module.exports = { generate, getProjects, getProject, deleteProject };