import handler, { config } from '../[...path].js';

export { config };

export default function products(req, res) {
  req.query = {
    ...req.query,
    path: ['products'],
  };

  return handler(req, res);
}