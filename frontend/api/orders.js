import handler, { config } from './[...path].js';

export { config };

export default function orders(req, res) {
  req.query = {
    ...req.query,
    path: ['orders'],
  };

  return handler(req, res);
}