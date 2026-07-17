import handler, { config } from '../[...path].js';

export { config };

export default function adminChangePassword(req, res) {
  req.query = {
    ...req.query,
    path: ['admin', 'change-password'],
  };

  return handler(req, res);
}