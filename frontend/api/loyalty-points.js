import handler, { config } from './[...path].js';

export { config };

export default function loyaltyPoints(req, res) {
  req.query = {
    ...req.query,
    path: ['loyalty-points'],
  };

  return handler(req, res);
}