import type { FieldValues } from 'react-hook-form';
import { Navigate, Route, Routes } from 'react-router';

import { AdminLayout } from './AdminLayout';
import { DashboardPage } from './DashboardPage';
import { LoginPage } from './LoginPage';
import { MessagesPage } from './MessagesPage';
import { RequireAuth } from './RequireAuth';
import type { ResourceConfig } from './resourceConfig';
import { ResourceEditPage } from './ResourceEditPage';
import { ResourceListPage } from './ResourceListPage';
import {
  blogResource,
  educationResource,
  experienceResource,
  projectsResource,
  servicesResource,
  skillsResource,
} from './resources';
import { SettingsPage } from './SettingsPage';

/** The list, create and edit routes for one content type. */
function resourceRoutes<T extends { id: number }, V extends FieldValues, Input>(
  config: ResourceConfig<T, V, Input>,
) {
  return (
    <Route key={config.path} path={config.path}>
      <Route index element={<ResourceListPage config={config} />} />
      <Route path="new" element={<ResourceEditPage key={`${config.path}-new`} config={config} />} />
      <Route
        path=":id"
        element={<ResourceEditPage key={`${config.path}-edit`} config={config} />}
      />
    </Route>
  );
}

/**
 * The whole admin area, loaded as its own chunk so visitors never download it. Everything
 * except the sign-in page sits behind the auth guard.
 */
export function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          {resourceRoutes(projectsResource)}
          {resourceRoutes(skillsResource)}
          {resourceRoutes(experienceResource)}
          {resourceRoutes(educationResource)}
          {resourceRoutes(servicesResource)}
          {resourceRoutes(blogResource)}
          <Route path="messages" element={<MessagesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
