const { pool } = require('../CONFIG/db');

const mapProjectRow = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  category: row.category,
  featured: row.featured,
  image_url: row.image_url,
  short_description: row.short_description,
  description: row.description,
  challenge: row.challenge,
  solution: row.solution,
  impact: row.impact,
  tech_stack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
  live_demo: row.live_demo,
  github_link: row.github_link,
  created_at: row.created_at,
});

const sanitizeProjectPayload = (payload = {}) => {
  const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
  const techStackInput = Array.isArray(payload.tech_stack)
    ? payload.tech_stack
    : typeof payload.tech_stack === 'string'
      ? payload.tech_stack.split(',')
      : [];

  return {
    slug: normalizeText(payload.slug),
    title: normalizeText(payload.title),
    category: normalizeText(payload.category),
    featured: Boolean(payload.featured),
    image_url: normalizeText(payload.image_url),
    short_description: normalizeText(payload.short_description),
    description: normalizeText(payload.description),
    challenge: normalizeText(payload.challenge),
    solution: normalizeText(payload.solution),
    impact: normalizeText(payload.impact),
    tech_stack: techStackInput.map((item) => String(item).trim()).filter(Boolean),
    live_demo: normalizeText(payload.live_demo),
    github_link: normalizeText(payload.github_link),
  };
};

const getAllProjects = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM projects ORDER BY featured DESC, created_at DESC, id DESC'
  );

  return rows.map(mapProjectRow);
};

const getProjectBySlug = async (slug) => {
  const { rows } = await pool.query('SELECT * FROM projects WHERE slug = $1 LIMIT 1', [slug]);
  return rows[0] ? mapProjectRow(rows[0]) : null;
};

const countProjects = async () => {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM projects');
  return rows[0]?.count || 0;
};

const createProject = async (payload) => {
  const project = sanitizeProjectPayload(payload);
  const { rows } = await pool.query(
    `
      INSERT INTO projects (
        slug,
        title,
        category,
        featured,
        image_url,
        short_description,
        description,
        challenge,
        solution,
        impact,
        tech_stack,
        live_demo,
        github_link
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `,
    [
      project.slug,
      project.title,
      project.category,
      project.featured,
      project.image_url,
      project.short_description,
      project.description,
      project.challenge,
      project.solution,
      project.impact,
      project.tech_stack,
      project.live_demo,
      project.github_link,
    ]
  );

  return mapProjectRow(rows[0]);
};

const updateProject = async (id, payload) => {
  const project = sanitizeProjectPayload(payload);
  const { rows } = await pool.query(
    `
      UPDATE projects
      SET slug = $2,
          title = $3,
          category = $4,
          featured = $5,
          image_url = $6,
          short_description = $7,
          description = $8,
          challenge = $9,
          solution = $10,
          impact = $11,
          tech_stack = $12,
          live_demo = $13,
          github_link = $14
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      project.slug,
      project.title,
      project.category,
      project.featured,
      project.image_url,
      project.short_description,
      project.description,
      project.challenge,
      project.solution,
      project.impact,
      project.tech_stack,
      project.live_demo,
      project.github_link,
    ]
  );

  return rows[0] ? mapProjectRow(rows[0]) : null;
};

const deleteProject = async (id) => {
  const { rows } = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
  return rows[0] ? mapProjectRow(rows[0]) : null;
};

module.exports = {
  getAllProjects,
  getProjectBySlug,
  countProjects,
  createProject,
  updateProject,
  deleteProject,
};
