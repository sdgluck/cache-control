export const libraryLanguage = lang =>
  ({
    apache: "apache",
    nginx: "nginx"
  }[lang] || "javascript");

export const libraryComment = lang =>
  ({
    // apache doesn't allow comments on same line as directive?
    apache: "<no directives configured>",
    nginx: "# no directives configured"
  }[lang] || "/* no directives configured */");

export const libraryCode = {
  express: directives => `\
// for all responses
app.use((req, res, next) => {
  res.set('Cache-Control', ${directives});
  next();
});

// for single response
res.set('Cache-Control', ${directives});`,

  koa: directives => `\
// for all responses
app.use(async (ctx, next) => {
  ctx.set('Cache-Control', ${directives});
  await next();
});

// for single response
ctx.set('Cache-Control', ${directives});`,

  hapi: directives => `\
// for all responses
server.ext('onPreResponse', (request, reply) => {
  request.response.header('Cache-Control', ${directives});
  reply();
});

// for single response
response.header('Cache-Control', ${directives});`,

  "hapi v17": directives => `\
// for all responses
server.route({  
  method: 'GET',
  path: '*',
  handler: (request, h) => {
    const response = h.response();
    response.code(200);
    response.header('Cache-Control', ${directives});
    return response;
  }
});

// for single response
response.header('Cache-Control', ${directives});`,

  fastify: directives => `\
// for all responses
fastify.use('*', (request, reply, next) => {
  reply.header('Cache-Control', ${directives});
  next();
});

// for single reponse
reply.header('Cache-Control', ${directives})`,

  nginx: directives => `\
# for all responses
location / {
  add_header 'Cache-Control' ${directives};
}

# for single response
add_header 'Cache-Control' ${directives};`,

  apache: directives => `\
# for all responses
<IfModule mod_headers.c>
  Header set "Cache-Control" ${directives}
</IfModule>

# for single response
Header set "Cache-Control" ${directives}`
};
