import compression from 'compression';
import express from 'express';
// import favicon from 'serve-favicon';
import config from '../config';
import render from './render';

const app = express();

app.use(compression());
// TODO: Add favicon.
// app.use(favicon('assets/img/favicon.ico'))
// TODO: Move to CDN.
app.use('/build', express.static('build'));
app.use('/assets', express.static('assets'));

// Example how initialState, which is the same for all users, is enriched with
// user state. With state-less Flux, we don't need instances.
app.use(function(req, res, next) {

  const acceptsLanguages = req.acceptsLanguages(config.appLocales);

  req.userState = {
    i18n: {
      locales: acceptsLanguages || config.defaultLocale
    }
  };

  // Simulate async loading from DB.
  setTimeout(() => {
    next();
  }, 20);

});

app.get('*', (req, res, next) => {
  render(req, res, req.userState).catch(next);
});

app.on('mount', () => {
  console.log('Este.js app is now available at path %s', app.mountpath);
});

export default app;
