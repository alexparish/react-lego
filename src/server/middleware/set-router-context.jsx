import React from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import StaticRouter from 'react-router-dom/StaticRouter';
import matchPath from 'react-router-dom/matchPath';
import { Provider } from 'react-redux';

import { makeRoutes, getRoutesConfig } from '../../app/routes';
import configureStore from '../../app/store/configure-store';

const store = configureStore();

function getMatch(routesArray, url) {
  return routesArray
    .find((route) => matchPath(url, { path: route.path, exact: true, strict: false }));
}

const Markup = ({ url, context }) => (
  <Provider store={store}>
    <StaticRouter location={url} context={context}>
      {makeRoutes()}
    </StaticRouter>
  </Provider>
);

Markup.propTypes = {
  url: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

function setRouterContext() {
  const routesArray = getRoutesConfig();
  return async (ctx, next) => {
    const routerContext = {};
    const markup = renderToString(Markup({ url: ctx.request.url, context: routerContext }));
    const match = getMatch(routesArray, ctx.request.url);
    if (routerContext.url) {
      ctx.status = 301;
      ctx.redirect(routerContext.location.pathname + routerContext.location.search);
    } else {
      ctx.status = match ? 200 : 404;
      ctx.markup = markup;
    }
    await next();
  };
}

export default setRouterContext;
