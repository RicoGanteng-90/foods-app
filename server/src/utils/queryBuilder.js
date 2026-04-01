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

  // Search
  if (queryParams.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: queryParams.search, $options: 'i' },
    }));
  }

  // Filter
  allowedFilters.each((field) => {
    if (queryParams[field] !== undefined) {
      filter[field] = queryParams[field];
    }
  });
};
