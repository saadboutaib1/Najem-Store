import handler, { config } from '../../../server/router.js';

export { config };

export default function adminResourceItem(req, res) {
  const rawResource = req.query?.resource;
  const rawId = req.query?.id;
  const resource = Array.isArray(rawResource) ? rawResource[0] : rawResource;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  req.query = {
    ...req.query,
    path: ['admin', resource, id].filter(Boolean),
  };

  return handler(req, res);
}
