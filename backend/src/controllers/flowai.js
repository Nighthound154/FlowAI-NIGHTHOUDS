const OpenAI = require('openai');
const { validationResult } = require('express-validator');
const db = require('../db');

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Fetch image from Unsplash API (free)
const fetchImageUrl = async (query) => {
  try {
    const keywords = query.split(' ').slice(0, 3).join('%20');
    return `https://source.unsplash.com/800x600/?${keywords},startup,tech,business`;
  } catch {
    return 'https://source.unsplash.com/800x600/?startup';
  }
};

const buildQuickPrompt = (idea) => `For idea: "${idea}". Return ONLY a valid JSON object with NO markdown:
{"title":"a catchy 3-5 word project title","subtitle":"one line summary of the idea"}`;

const buildModulePrompt = (module, idea) => {
  const prompts = {
    research: `For idea: "${idea}". Return ONLY a valid JSON object with NO markdown formatting:
{
  "market_opportunity": "2-3 sentences describing the market gap and opportunity",
  "market_size": "estimated addressable market size",
  "target_audience": ["audience_segment_1", "audience_segment_2", "audience_segment_3"],
  "competitors": ["competitor_1", "competitor_2"],
  "competitive_edge": "unique differentiator or advantage",
  "pain_points": ["key_pain_point_1", "key_pain_point_2", "key_pain_point_3"]
}`,
    plan: `For idea: "${idea}". Return ONLY a valid JSON object with NO markdown formatting:
{
  "tech_stack": ["technology_1", "technology_2", "technology_3"],
  "mvp_features": ["feature_1", "feature_2", "feature_3"],
  "phases": [
    {"name": "Phase_1_name", "description": "phase description", "deliverable": "deliverable"},
    {"name": "Phase_2_name", "description": "phase description", "deliverable": "deliverable"}
  ],
  "risks": ["risk_1", "risk_2", "risk_3"]
}`,
    content: `For idea: "${idea}". Return ONLY a valid JSON object with NO markdown formatting:
{
  "elevator_pitch": "compelling 2-3 sentence pitch",
  "tagline": "short memorable tagline",
  "brand_voice": ["voice_characteristic_1", "voice_characteristic_2"],
  "social_posts": ["twitter_post", "linkedin_post", "instagram_post"],
  "pitch_deck_outline": ["slide_topic_1", "slide_topic_2", "slide_topic_3"]
}`,
    learning: `For idea: "${idea}". Return ONLY a valid JSON object with NO markdown formatting:
{
  "skills": [
    {"skill": "skill_name", "why": "why it's important", "resource": "where_to_learn", "time": "time_estimate"},
    {"skill": "skill_name", "why": "why it's important", "resource": "where_to_learn", "time": "time_estimate"}
  ],
  "timeline": "total_time_needed",
  "quick_wins": ["quick_win_1", "quick_win_2", "quick_win_3"]
}`
  };
  return prompts[module] || prompts.research;
};

const callAI = async (prompt, model = 'openai/gpt-4o-mini') => {
  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'Return ONLY valid JSON. No markdown, code blocks, or extra text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from AI');
    return content;
  } catch (err) {
    console.error('AI call failed:', err.message);
    throw new Error(`AI generation failed: ${err.message}`);
  }
};

const generate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { idea } = req.body;
  const userId = req.user.id;
  
  try {
    // Step 1: Quick title generation
    console.log('📝 Generating title...');
    const titleResponse = await callAI(buildQuickPrompt(idea));
    let titleData = { title: idea.slice(0, 80), subtitle: 'Generating...' };
    try { 
      const cleanTitle = titleResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanTitle);
      if (parsed.title && parsed.subtitle) titleData = parsed;
    } catch (e) { 
      console.log('⚠️ Title parse error, trying to extract JSON...');
      try {
        const jsonMatch = titleResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.title && parsed.subtitle) titleData = parsed;
        }
      } catch (e2) {
        console.log('⚠️ Title extraction failed, using fallback');
      }
    }
    
    console.log('✅ Title:', titleData.title);
    
    // Step 2: Save project immediately with status 'processing'
    console.log('💾 Saving project...');
    const projectResult = await db.query(
      `INSERT INTO projects (user_id, title, idea, status) VALUES ($1, $2, $3, 'processing') RETURNING id, title, idea, status, created_at`,
      [userId, titleData.title || idea.slice(0, 60), idea]
    );
    const project = projectResult.rows[0];
    console.log('✅ Project saved:', project.id);
    
    // Step 3: Fetch image in parallel with generation
    console.log('🖼️ Fetching image...');
    const imageUrl = await fetchImageUrl(titleData.title || idea);
    console.log('✅ Image URL:', imageUrl);
    
    // Step 4: Parallel generation of modules
    const modules = ['research', 'plan', 'content', 'learning'];
    console.log('🤖 Generating modules in parallel...');
    const generatePromises = modules.map(async (mod) => {
      try {
        console.log(`  ⏳ Generating ${mod}...`);
        const prompt = buildModulePrompt(mod, idea);
        const rawText = await callAI(prompt);
        let cleanText = rawText.replace(/```json|```/g, '').trim();
        
        // Try to extract JSON if it's embedded in markdown or extra text
        let data;
        try {
          data = JSON.parse(cleanText);
        } catch (parseErr) {
          // Try to find JSON object in the response
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              data = JSON.parse(jsonMatch[0]);
            } catch (e) {
              throw parseErr;
            }
          } else {
            throw parseErr;
          }
        }
        
        await db.query(
          'INSERT INTO project_results (project_id, module, data) VALUES ($1, $2, $3)',
          [project.id, mod, JSON.stringify(data)]
        );
        console.log(`  ✅ ${mod} done`);
        return { module: mod, data };
      } catch (err) {
        console.error(`  ❌ Failed to generate ${mod}:`, err.message);
        return { module: mod, data: null };
      }
    });
    
    const results = await Promise.allSettled(generatePromises);
    const generatedData = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value && r.value.data) {
        generatedData[r.value.module] = r.value.data;
      }
    });
    
    console.log('✅ Modules generated:', Object.keys(generatedData).join(', '));
    
    // Step 5: Update project status and add image
    await db.query(
      `UPDATE projects SET status = 'completed', image_url = $1 WHERE id = $2`,
      [imageUrl, project.id]
    );
    
    console.log('🎉 Generation complete!');
    res.status(201).json({
      project: { ...project, status: 'completed', image_url: imageUrl },
      results: generatedData
    });
  } catch (err) {
    console.error('❌ Generate error:', err);
    try {
      if (project?.id) {
        await db.query(`UPDATE projects SET status = 'failed' WHERE id = $1`, [project.id]);
      }
    } catch (e) {
      console.error('Failed to mark project as failed:', e);
    }
    const errorMsg = err.message?.includes('401') ? 'Invalid API key. Check OPENROUTER_API_KEY.' :
                     err.message?.includes('429') ? 'Rate limited. Please try again in a moment.' :
                     err.message || 'Generation failed. Please try again.';
    res.status(500).json({ error: errorMsg });
  }
};

const getProjects = async (req, res) => {
  try {
    const result = await db.query(`SELECT id, title, idea, status, image_url, created_at FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.id]);
    res.json({ projects: result.rows });
  } catch (err) { 
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' }); 
  }
};

const getProject = async (req, res) => {
  try {
    const projectResult = await db.query('SELECT id, title, idea, status, image_url, created_at FROM projects WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (projectResult.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const project = projectResult.rows[0];
    const resultsResult = await db.query('SELECT module, data FROM project_results WHERE project_id = $1 ORDER BY created_at', [project.id]);
    const results = {};
    resultsResult.rows.forEach((r) => { 
      try {
        results[r.module] = JSON.parse(r.data); 
      } catch (e) {
        console.error(`Failed to parse module ${r.module}:`, e);
        results[r.module] = r.data;
      }
    });
    res.json({ project, results });
  } catch (err) { 
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to fetch project' }); 
  }
};

const deleteProject = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { 
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project' }); 
  }
};

module.exports = { generate, getProjects, getProject, deleteProject };