import handler, { config } from '../../server/router.js';

export { config };

export default function productsIndex(req, res) {
  req.query = {
    ...req.query,
    path: ['products'],
  };

  return handler(req, res);
}
