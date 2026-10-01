import { EventEmitter } from 'events';

export interface PipelineNotification {
  id: string;
  type: 'lead_discovered' | 'research_completed' | 'outreach_queued' | 'approval_needed' | 'budget_alert' | 'campaign_updated' | 'system';
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  read?: boolean;
  organizationId?: string;
  targetUserId?: string;
  minRole?: 'admin' | 'manager' | 'sdr' | 'viewer';
}

class RealtimeEventBus extends EventEmitter {
  private static instance: RealtimeEventBus;
  private recentNotifications: PipelineNotification[] = [];

  private constructor() {
    super();
    this.setMaxListeners(100);
    // Seed with high-impact realistic operational notifications
    this.recentNotifications = [
      {
        id: 'notif-1',
        type: 'approval_needed',
        title: 'High-Value Pitch Awaiting Approval',
        message: 'Personalized email draft ready for CEO at NexTech Solutions (Score: 92/100).',
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        priority: 'urgent',
        read: false,
      },
      {
        id: 'notif-2',
        type: 'research_completed',
        title: 'Deep Website Audit Completed',
        message: 'Identified 3 high-impact buying signals for FinServe Global (Missing CTA, outdated analytics).',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        priority: 'high',
        read: false,
      },
      {
        id: 'notif-3',
        type: 'lead_discovered',
        title: '14 New Leads Discovered',
        message: 'Campaign "Q4 Bangalore Tech Startups" ingested 14 verified decision makers.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        priority: 'normal',
        read: true,
      },
      {
        id: 'notif-4',
        type: 'budget_alert',
        title: 'Budget Rate Normal',
        message: 'Current spend ₹184 / ₹1,200 monthly cap (15.3% utilized). AI cost velocity optimal.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        priority: 'low',
        read: true,
      },
    ];
  }

  public static getInstance(): RealtimeEventBus {
    if (!RealtimeEventBus.instance) {
      RealtimeEventBus.instance = new RealtimeEventBus();
    }
    return RealtimeEventBus.instance;
  }

  public broadcast(notification: Omit<PipelineNotification, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) {
    const fullNotification: PipelineNotification = {
      id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false,
      ...notification,
    };

    this.recentNotifications.unshift(fullNotification);
    if (this.recentNotifications.length > 50) {
      this.recentNotifications.pop();
    }

    this.emit('pipeline_event', fullNotification);
    return fullNotification;
  }

  public getHistory(): PipelineNotification[] {
    return [...this.recentNotifications];
  }

  public markAsRead(id: string) {
    const item = this.recentNotifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
    }
  }

  public markAllAsRead() {
    this.recentNotifications.forEach((n) => {
      n.read = true;
    });
  }
}

export const realtimeBus = RealtimeEventBus.getInstance();
