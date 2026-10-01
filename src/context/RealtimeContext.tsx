'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { PipelineNotification } from '@/lib/realtime/event-bus';

interface RealtimeContextType {
  notifications: PipelineNotification[];
  unreadCount: number;
  isConnected: boolean;
  activeToast: PipelineNotification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  triggerNotification: (data: {
    title: string;
    message: string;
    type?: PipelineNotification['type'];
    priority?: PipelineNotification['priority'];
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<PipelineNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeToast, setActiveToast] = useState<PipelineNotification | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch('/api/realtime/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id }),
      });
    } catch {
      // ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch('/api/realtime/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });
    } catch {
      // ignore
    }
  }, []);

  const triggerNotification = useCallback(
    async (data: {
      title: string;
      message: string;
      type?: PipelineNotification['type'];
      priority?: PipelineNotification['priority'];
      metadata?: Record<string, unknown>;
    }) => {
      try {
        await fetch('/api/realtime/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error('Failed to trigger notification:', err);
      }
    },
    []
  );

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'sync' && Array.isArray(data.notifications)) {
              setNotifications(data.notifications);
            } else if (data.type === 'notification' && data.notification) {
              const newNotif = data.notification as PipelineNotification;
              setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
              // Display toast alert for new event
              setActiveToast(newNotif);
            }
          } catch {
            // Heartbeats or unparsed messages
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
          }
          // Attempt reconnect after 5s
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      if (eventSource) eventSource.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  return (
    <RealtimeContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        triggerNotification,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
