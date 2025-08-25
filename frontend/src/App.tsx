import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Contact from './pages/public/Contact';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute, { RoleRoute } from './components/layout/PrivateRoute';
import PlaceholderPage from './components/PlaceholderPage';
import { AuthProvider } from './context/AuthContext';

// Importar páginas de expedientes
import CasesPage from './pages/lawyer/CasesPage';
import CreateCasePage from './pages/lawyer/CreateCasePage';
import CaseDetailPage from './pages/lawyer/CaseDetailPage';
import ClientCasesPage from './pages/client/CasesPage';
import ClientCaseDetailPage from './pages/client/CaseDetailPage';

// Importar páginas de documentos
import DocumentsPage from './pages/lawyer/DocumentsPage';
import ClientDocumentsPage from './pages/client/DocumentsPage';

import EditCasePage from './pages/lawyer/EditCasePage';

import AppointmentsCalendarPage from './pages/lawyer/AppointmentsCalendarPage';

import ClientsPage from './pages/lawyer/ClientsPage';

import TasksPage from './pages/lawyer/TasksPage';

import ReportsPage from './pages/lawyer/ReportsPage';

// Importar páginas de administrador
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import CasesManagementPage from './pages/admin/CasesManagementPage';
import AppointmentsManagementPage from './pages/admin/AppointmentsManagementPage';
import TasksManagementPage from './pages/admin/TasksManagementPage';
import DocumentsManagementPage from './pages/admin/DocumentsManagementPage';
import InvoicesManagementPage from './pages/admin/InvoicesManagementPage';
import AdminReportsPage from './pages/admin/ReportsPage';
import ParametrosConfigPage from './pages/admin/ParametrosConfigPage';
import ServicesManagementPage from './pages/admin/ServicesManagementPage';
import HomeBuilderPage from './pages/admin/HomeBuilderPage';
import MenuConfigPage from './pages/admin/MenuConfigPage';
import SiteConfigPage from './pages/admin/SiteConfigPage';
import GuidedConfigPage from './pages/admin/GuidedConfigPage';
import TeleassistancePage from './pages/admin/TeleassistancePage';

import ChatPage from './pages/client/ChatPage';
import LawyerChatPage from './pages/lawyer/ChatPage';
import InvoicesPage from './pages/lawyer/InvoicesPage';
import ProvisionFondosPage from './pages/lawyer/ProvisionFondosPage';
import ProvisionesPage from './pages/client/ProvisionesPage';
import AppointmentsPage from './pages/client/AppointmentsPage';
import AppointmentDetailPage from './pages/client/AppointmentDetailPage';
import DashboardLawyer from './pages/lawyer/DashboardLawyer';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import PaymentsPage from './pages/client/PaymentsPage';
import ClientInvoicesPage from './pages/client/InvoicesPage';

// Importar páginas legales
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';
import CookiesPage from './pages/public/CookiesPage';

// Importar páginas de teleasistencia
import ClientTeleassistancePage from './pages/client/TeleassistancePage';
import TeleassistanceRequestPage from './pages/client/TeleassistanceRequestPage';
import ProfilePage from './pages/client/ProfilePage';
import AuthDebug from './components/AuthDebug';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<Home />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="privacidad" element={<PrivacyPage />} />
            <Route path="terminos" element={<TermsPage />} />
            <Route path="cookies" element={<CookiesPage />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              {/* Admin routes - Solo para administradores */}
              <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                <Route path="admin">
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UsersManagementPage />} />
                  <Route path="cases" element={<CasesManagementPage />} />
                  {/* Añade esta nueva ruta */}
                  <Route path="cases/:id" element={<CaseDetailPage />} />
                  <Route path="appointments" element={<AppointmentsManagementPage />} />
                  <Route path="tasks" element={<TasksManagementPage />} />
                  <Route path="documents" element={<DocumentsManagementPage />} />
                  <Route path="invoices" element={<InvoicesManagementPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
                  <Route path="home-builder" element={<HomeBuilderPage />} />
                  <Route path="menu-config" element={<MenuConfigPage />} />
                  <Route path="site-config" element={<SiteConfigPage />} />
                  <Route path="guided-config" element={<GuidedConfigPage />} />
                  <Route path="teleassistance" element={<TeleassistancePage />} />
                  <Route path="services" element={<ServicesManagementPage />} />
                  <Route path="settings" element={<PlaceholderPage title="Configuración del Sistema" description="Configurar parámetros generales" icon="⚙️" />} />
                  <Route path="audit" element={<PlaceholderPage title="Auditoría" description="Registros de actividad del sistema" icon="🔍" />} />
                  <Route path="backup" element={<PlaceholderPage title="Backup y Restauración" description="Gestionar copias de seguridad" icon="💾" />} />
                  <Route path="/admin/parametros" element={<ParametrosConfigPage />} />
                </Route>
              </Route>

              {/* Lawyer routes - Solo para abogados */}
              <Route element={<RoleRoute allowedRoles={['ABOGADO']} />}>
                <Route path="lawyer">
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="facturacion" element={<InvoicesPage />} />
                  <Route path="provisiones" element={<ProvisionFondosPage />} />
                  <Route path="cases">
                    <Route index element={<CasesPage />} />
                    <Route path="new" element={<CreateCasePage />} />
                    <Route path=":id" element={<CaseDetailPage />} />
                    <Route path=":id/edit" element={<EditCasePage />} />
                  </Route>
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="appointments" element={<AppointmentsCalendarPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="chat" element={<LawyerChatPage />} />
                  <Route path="teleassistance" element={<TeleassistancePage />} />
                </Route>
              </Route>

              {/* Client routes - Solo para clientes */}
              <Route element={<RoleRoute allowedRoles={['CLIENTE']} />}>
                <Route path="client">
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="cases" element={<ClientCasesPage />} />
                  <Route path="cases/:id" element={<ClientCaseDetailPage />} />
                  <Route path="documents" element={<ClientDocumentsPage />} />
                  <Route path="provisiones" element={<ProvisionesPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="appointments/:id" element={<AppointmentDetailPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="teleassistance" element={<ClientTeleassistancePage />} />
                  <Route path="teleassistance/request" element={<TeleassistanceRequestPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="invoices" element={<ClientInvoicesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>
              </Route>
            </Route>
            {/* Catch-all route for not found pages */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
      <AuthDebug />
    </AuthProvider>
  );
}

export default App; 