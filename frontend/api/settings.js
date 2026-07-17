import handler, { config } from './[...path].js';

export { config };

export default function settings(req, res) {
  req.query = {
    ...req.query,
    path: ['settings'],
  };

  return handler(req, res);
}