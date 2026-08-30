import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',

  {
    name: 'strapi::cors',
    config: {
      enabled: true,

      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:1337',
        'https://cps-lms.up.railway.app',
      ],

      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'HEAD',
        'OPTIONS',
      ],

      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
      ],

      credentials: true,
    },
  },

  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;





// import type { Core } from '@strapi/strapi';

// const config: Core.Config.Middlewares = [
//   'strapi::logger',
//   'strapi::errors',
//   'strapi::security',
//   {
//     name: 'strapi::cors',
//     config: {
//       enabled: true,
//       headers: ['*'],
//       origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:1337', 'https://cps-lms.up.railway.app', '*'],
//       methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
//       credentials: true,
//     },
//   },
//   'strapi::poweredBy',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];

// export default config;
