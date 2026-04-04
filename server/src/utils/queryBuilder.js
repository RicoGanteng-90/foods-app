export const queryBuilder = async (model, queryParams, options = {}) => {
  const {
    allowedFilters = [],
    allowedSorts = [],
    searchFields = [],
    defaultSort = { createdAt: -1 },
    defaultLimit = 10,
    populate = [],
  } = options;

  const filter = {};

  if (queryParams.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: queryParams.search, $options: 'i' },
    }));
  }

  allowedFilters.forEach((field) => {
    if (queryParams[field] !== undefined) {
      filter[field] = queryParams[field];
    }
  });

  allowedFilters.forEach((field) => {
    const min = queryParams[`min_${field}`];
    const max = queryParams[`max_${field}`];

    if (min !== undefined || max !== undefined) {
      filter[field] = {};
      if (min !== undefined) filter[field].$gte = Number(min);
      if (max !== undefined) filter[field].$lte = Number(max);
    }
  });

  let sort = defaultSort;
  if (queryParams.sort && allowedSorts.includes(queryParams.sort)) {
    sort = {
      [queryParams.sort]: queryParams.direction === 'desc' ? -1 : 1,
    };
  }

  const page = Math.max(1, parseInt(queryParams.page) || 1);
  const limit = Math.min(100, parseInt(queryParams.limit) || defaultLimit);
  const skip = (page - 1) * limit;

  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  if (populate.length > 0) {
    populate.forEach((p) => {
      query = query.populate(p);
    });
  }

  const [data, total] = await Promise.all([
    query,
    model.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      totalPages: total === 0 ? 1 : Math.ceil(total / limit),
      currentPage: page,
      limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};
