import geoip from 'geoip-lite';

/** Resolves client IP (honoring gateway X-Forwarded-For) + geo (rules/05). */
export const ipTracker = (req, _res, next) => {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  const rawIp = (forwardedIp || req.ip || req.socket?.remoteAddress || '').trim();
  const clientIp = rawIp.replace(/^::ffff:/, '');

  req.clientIp = clientIp;
  const geo = clientIp ? geoip.lookup(clientIp) : null;
  req.geo = geo ? { country: geo.country, region: geo.region, city: geo.city } : null;
  return next();
};
