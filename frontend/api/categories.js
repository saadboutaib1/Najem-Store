import handler, { config } from './[...path].js';

export { config };

export default function categories(req, res) {
  req.query = {
    ...req.query,
    path: ['categories'],
  };

  return handler(req, res);
}