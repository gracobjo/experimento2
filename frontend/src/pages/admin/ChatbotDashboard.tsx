import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  MessageSquare, 
  Mail, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { api } from '../../api/api';

interface ChatbotAnalytics {
  totalConversations: number;
  completedConversations: number;
  abandonedConversations: number;
  totalMessages: number;
  appointmentBookings: number;
  emailLogs: number;
  conversionRate: number;
  averageMessagesPerConversation: number;
  topIntents: Array<{ intent: string; count: number }>;
  languageDistribution: Array<{ language: string; count: number }>;
}

interface ChatbotConversation {
  id: string;
  sessionId: string;
  userEmail?: string;
  userPhone?: string;
  conversationType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalMessages: number;
  userMessages: number;
  botMessages: number;
  lastActivity: string;
  language: string;
  messages: Array<{
    id: string;
    messageType: string;
    content: string;
    intent?: string;
    confidence?: number;
    sentiment?: string;
    timestamp: string;
  }>;
  appointment?: {
    id: string;
    fullName: string;
    consultationReason: string;
    status: string;
  };
}

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: string;
  sentAt: string;
  deliveredAt?: string;
  failedAt?: string;
  error?: string;
  retryCount: number;
  appointment?: {
    id: string;
    fullName: string;
    consultationReason: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const ChatbotDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, conversationsRes, emailLogsRes] = await Promise.all([
        api.get(`/chatbot/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get('/chatbot/conversations?limit=20'),
        api.get('/chatbot/email-logs?limit=20')
      ]);

      setAnalytics(analyticsRes.data);
      setConversations(conversationsRes.data);
      setEmailLogs(emailLogsRes.data);
    } catch (error) {
      console.error('Error fetching chatbot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-blue-500', icon: Clock },
      'COMPLETED': { color: 'bg-green-500', icon: CheckCircle },
      'ABANDONED': { color: 'bg-red-500', icon: XCircle },
      'PENDIENTE': { color: 'bg-yellow-500', icon: AlertCircle },
      'CONFIRMADA': { color: 'bg-green-500', icon: CheckCircle },
      'CANCELADA': { color: 'bg-red-500', icon: XCircle },
      'COMPLETADA': { color: 'bg-blue-500', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ACTIVE'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getEmailStatusBadge = (status: string) => {
    const statusConfig = {
      'SENT': { color: 'bg-blue-500', icon: Mail },
      'DELIVERED': { color: 'bg-green-500', icon: CheckCircle },
      'FAILED': { color: 'bg-red-500', icon: XCircle },
      'BOUNCED': { color: 'bg-orange-500', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['SENT'];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Cargando dashboard del chatbot...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard del Chatbot</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversaciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.completedConversations || 0} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.appointmentBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.conversionRate || 0}% tasa de conversión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.averageMessagesPerConversation || 0} por conversación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.emailLogs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Confirmaciones y notificaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="emails">Logs de Emails</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Detallados</TabsTrigger>
        </TabsList>

        {/* Tab de Conversaciones */}
        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversaciones Recientes del Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Sesión: {conversation.sessionId.slice(0, 8)}...</span>
                          {getStatusBadge(conversation.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {conversation.userEmail && `Email: ${conversation.userEmail}`}
                          {conversation.userPhone && ` | Tel: ${conversation.userPhone}`}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Iniciada: {formatDate(conversation.startedAt)}</div>
                        <div>Última actividad: {formatDate(conversation.lastActivity)}</div>
                      </div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <span>Mensajes: {conversation.totalMessages}</span>
                      <span>Usuario: {conversation.userMessages}</span>
                      <span>Bot: {conversation.botMessages}</span>
                      <span>Idioma: {conversation.language}</span>
                    </div>

                    {conversation.appointment && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="font-medium text-green-800">Cita Agendada</div>
                        <div className="text-sm text-green-600">
                          {conversation.appointment.fullName} - {conversation.appointment.consultationReason}
                        </div>
                      </div>
                    )}

                    {/* Últimos mensajes */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Últimos mensajes:</div>
                      {conversation.messages.slice(0, 3).map((message) => (
                        <div key={message.id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">{message.messageType}</span>
                            <span>{formatDate(message.timestamp)}</span>
                          </div>
                          <div className="text-gray-600 mt-1">{message.content}</div>
                          {message.intent && (
                            <div className="text-blue-600 mt-1">
                              Intención: {message.intent} 
                              {message.confidence && ` (${Math.round(message.confidence * 100)}%)`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Emails */}
        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Emails Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailLogs.map((emailLog) => (
                  <div key={emailLog.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{emailLog.recipient}</span>
                          {getEmailStatusBadge(emailLog.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Asunto: {emailLog.subject}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Plantilla: {emailLog.template}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Enviado: {formatDate(emailLog.sentAt)}</div>
                        {emailLog.deliveredAt && (
                          <div>Entregado: {formatDate(emailLog.deliveredAt)}</div>
                        )}
                        {emailLog.failedAt && (
                          <div>Falló: {formatDate(emailLog.failedAt)}</div>
                        )}
                      </div>
                    </div>

                    {emailLog.appointment && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="font-medium text-blue-800">Relacionado con Cita</div>
                        <div className="text-sm text-blue-600">
                          {emailLog.appointment.fullName} - {emailLog.appointment.consultationReason}
                        </div>
                      </div>
                    )}

                    {emailLog.error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="font-medium text-red-800">Error</div>
                        <div className="text-sm text-red-600">{emailLog.error}</div>
                      </div>
                    )}

                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Reintentos: {emailLog.retryCount}</span>
                      <span>ID: {emailLog.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intenciones más comunes */}
            <Card>
              <CardHeader>
                <CardTitle>Intenciones Más Comunes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topIntents.map((intent, index) => (
                    <div key={intent.intent} className="flex justify-between items-center">
                      <span className="text-sm">{intent.intent}</span>
                      <Badge variant="secondary">{intent.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por idiomas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Idiomas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.languageDistribution.map((lang) => (
                    <div key={lang.language} className="flex justify-between items-center">
                      <span className="text-sm">{lang.language}</span>
                      <Badge variant="outline">{lang.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de tendencias */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias del Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Gráficos de tendencias próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatbotDashboard;
