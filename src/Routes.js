import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Main as MainLayout } from './layouts';

import {
  Dashboard as DashboardView,
  EvaluateEvent as EvaluateEventView,
  Account as AccountView,
  Settings as SettingsView,
  SignUp as SignUpView,
  SignIn as SignInView,
  SignOut as SignOutView,
  NotFound as NotFoundView,
  Calendar as CalendarView,
  Search as SearchView,
  DayView
} from './views';

const Routes = () => {
  return (
    <Switch>
      <Redirect exact from="/" to="/calendar" />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/dashboard"
      />
      <RouteWithLayout
        component={CalendarView}
        exact
        layout={MainLayout}
        path="/calendar"
      />
      <RouteWithLayout
        component={SearchView}
        exact
        layout={MainLayout}
        path="/search"
      />
      <RouteWithLayout
        component={DayView}
        exact
        layout={MainLayout}
        path="/day/:day"
      />
      <RouteWithLayout
        component={DayView}
        exact
        layout={MainLayout}
        path="/day/:day/event/:event"
      />
      <RouteWithLayout
        component={EvaluateEventView}
        exact
        layout={MainLayout}
        path="/evaluate/:eventId"
      />
      <RouteWithLayout
        component={AccountView}
        exact
        layout={MainLayout}
        path="/account/:userId"
      />
      <RouteWithLayout
        component={SettingsView}
        exact
        layout={MainLayout}
        path="/settings"
      />
      <RouteWithLayout
        component={SignUpView}
        exact
        layout={MainLayout}
        path="/sign-up"
      />
      <RouteWithLayout
        component={SignInView}
        exact
        layout={MainLayout}
        path="/sign-in"
      />
      <RouteWithLayout
        component={SignOutView}
        exact
        layout={MainLayout}
        path="/sign-out"
      />
      <RouteWithLayout
        component={NotFoundView}
        exact
        layout={MainLayout}
        path="/not-found"
      />
      <Redirect to="/not-found" />
    </Switch>
  );
};

export default Routes;
