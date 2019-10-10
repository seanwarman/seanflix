import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from './components/NotFound';
import AppliedRoute from './components/AppliedRoute';
import Seanflix from './containers/Seanflix';
import Scriptix from './containers/Scriptix';

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Seanflix} props={childProps} />
    <AppliedRoute path="/scriptix" exact component={Scriptix} props={childProps} />

    { /* Finally, catch all unmatched routes */}
    <Route component={NotFound} />
  </Switch>;
