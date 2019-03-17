export default {
  express: header => `\
// for all responses
app.use((req, res, next) => {
  res.set('Cache-Control', '${header}');
  next();
});

// for single response
res.set('Cache-Control', '${header}');`,

  koa: header => `\
// for all responses
app.use(async (ctx, next) => {
  ctx.set('Cache-Control', '${header}');
  await next();
});

// for single response
ctx.set('Cache-Control', '${header}');`,

  hapi: header => `\
// for all responses
server.ext('onPreResponse', (request, reply) => {
  request.response.header('Cache-Control', '${header}');
  reply();
});

// for single response
response.header('Cache-Control', '${header}');`,

  "hapi v17": header => `\
// for all responses
server.route({  
  method: 'GET',
  path: '*',
  handler: (request, h) => {
    const response = h.response();
    response.code(200);
    response.header('Cache-Control', '${header}');
    return response;
  }
});

// for single response
response.header('Cache-Control', '${header}');`,

  fastify: header => `\
// for all responses
fastify.use('*', (request, reply, next) => {
  reply.header('Cache-Control', '${header}');
  next();
});

// for single reponse
reply.header('Cache-Control', '${header}')`
};
