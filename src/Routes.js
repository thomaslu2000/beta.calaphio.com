import React from 'react';
import { Switch, Redirect } from 'react-router-dom';

import { RouteWithLayout } from './components';
import { Main as MainLayout, Blank as BlankLayout } from './layouts';

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
  Admin as AdminView,
  WikiEdit as WikiEditView,
  WikiTables as WikiTableView,
  DayView
} from './views';

const Routes = () => {
  return (
    <Switch>
      <Redirect exact from="/" to="/dashboard" />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/dashboard"
      />
      <RouteWithLayout
        component={DashboardView}
        exact
        layout={MainLayout}
        path="/blank"
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
        component={WikiTableView}
        exact
        layout={BlankLayout}
        path="/wiki/:year/:semester/:postype"
      />
      <RouteWithLayout
        component={WikiTableView}
        exact
        layout={BlankLayout}
        path="/wiki/:year/:semester/:postype/:searchTitle/:searchParent"
      />
      <RouteWithLayout
        component={WikiEditView}
        exact
        layout={MainLayout}
        path="/wiki"
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
        component={AdminView}
        exact
        layout={MainLayout}
        path="/admin"
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
