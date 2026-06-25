export const getPagination = ({ page = 1, limit = 20 } = {}) => {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const current = Math.max(Number(page) || 1, 1);
  const skip = (current - 1) * take;
  return { skip, take, page: current, limit: take };
};

export const buildPageMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
