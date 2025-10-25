export const successResponse = (data, message = null, meta = {}) => {
  const response = { success: true };
  
  if (message) response.message = message;
  
  if (Array.isArray(data)) {
    response.count = data.length;
    response.data = data;
  } else {
    response.data = data;
  }
  
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }
  
  return response;
};

export const errorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

export const paginatedResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};
