import handler, { config } from './[...path].js';

export { config };

export default function socialLinks(req, res) {
  req.query = {
    ...req.query,
    path: ['social-links'],
  };

  return handler(req, res);
}