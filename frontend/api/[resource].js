import handler, { config } from '../server/router.js';

export { config };

export default function publicResource(req, res) {
  const rawResource = req.query?.resource;
  const resource = Array.isArray(rawResource) ? rawResource[0] : rawResource;

  req.query = {
    ...req.query,
    path: resource ? [resource] : [],
  };

  return handler(req, res);
}
