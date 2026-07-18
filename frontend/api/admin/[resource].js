import handler, { config } from '../../server/router.js';

export { config };

export default function adminResource(req, res) {
  const rawResource = req.query?.resource;
  const resource = Array.isArray(rawResource) ? rawResource[0] : rawResource;

  req.query = {
    ...req.query,
    path: ['admin', resource].filter(Boolean),
  };

  return handler(req, res);
}
