import handler, { config } from '../../[...path].js';

export { config };

export default function adminOrders(req, res) {
  req.query = {
    ...req.query,
    path: ['admin', 'orders'],
  };

  return handler(req, res);
}