import handler, { config } from '../[...path].js';

export { config };

export default function adminLogout(req, res) {
  req.query = {
    ...req.query,
    path: ['admin', 'logout'],
  };

  return handler(req, res);
}