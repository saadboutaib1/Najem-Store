import handler, { config } from '../../../../server/router.js';

export { config };

export default function adminResourceItemAction(req, res) {
  const rawResource = req.query?.resource;
  const rawId = req.query?.id;
  const rawAction = req.query?.action;
  const resource = Array.isArray(rawResource) ? rawResource[0] : rawResource;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const action = Array.isArray(rawAction) ? rawAction[0] : rawAction;

  req.query = {
    ...req.query,
    path: ['admin', resource, id, action].filter(Boolean),
  };

  return handler(req, res);
}
