import handler, { config } from '../[...path].js';

export { config };

export default function adminSettings(req, res) {
  req.query = {
    ...req.query,
    path: ['admin', 'settings'],
  };

  return handler(req, res);
}