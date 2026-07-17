import handler, { config } from '../[...path].js';

export { config };

export default function adminSocialLinks(req, res) {
  req.query = {
    ...req.query,
    path: ['admin', 'social-links'],
  };

  return handler(req, res);
}