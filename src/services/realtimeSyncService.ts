import { ChatMessage } from '../types';

export interface ApplicantChatContextEvent {
  id: string;
  applicantRef: string;
  applicantName: string;
  destinationCountry: string;
  timestamp: string;
  eventType: 'chat_query' | 'auto_resolved_error' | 'proactive_idp_alert' | 'escalation_requested' | 'biometric_guidance';
  summary: string;
  resolvedDiscrepancy?: string;
  fullMessage?: ChatMessage;
  severity: 'info' | 'resolved' | 'warning' | 'critical';
}

export type RealtimeSubscriber = (event: ApplicantChatContextEvent) => void;

class RealtimeSyncBus {
  private subscribers: Set<RealtimeSubscriber> = new Set();
  private eventHistory: ApplicantChatContextEvent[] = [
    {
      id: 'event-init-1',
      applicantRef: 'VFS-2026-LON-9824',
      applicantName: 'Elena Rostova',
      destinationCountry: 'France / Schengen Area',
      timestamp: '14:12:05 UTC',
      eventType: 'auto_resolved_error',
      summary: 'Applicant auto-corrected 3-Month Bank Statement continuity discrepancy after AI Guidance prompt.',
      resolvedDiscrepancy: 'Financial Statement Period Gap < 30 days verified',
      severity: 'resolved'
    },
    {
      id: 'event-init-2',
      applicantRef: 'VFS-2026-DXB-4102',
      applicantName: 'Tariq Al-Mansoor',
      destinationCountry: 'United Kingdom',
      timestamp: '14:14:22 UTC',
      eventType: 'chat_query',
      summary: 'Queried Travel Health Insurance repatriation clause minimum coverage (€30,000 SLA confirmed).',
      severity: 'info'
    },
    {
      id: 'event-init-3',
      applicantRef: 'VFS-2026-DEL-1049',
      applicantName: 'Aarav Patel',
      destinationCountry: 'Germany',
      timestamp: '14:15:40 UTC',
      eventType: 'proactive_idp_alert',
      summary: 'Proactive Alert Dispatched: Flight return date exceeds insurance policy expiry by 2 days.',
      severity: 'warning'
    }
  ];

  public subscribe(callback: RealtimeSubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public publish(event: Omit<ApplicantChatContextEvent, 'id' | 'timestamp'>): ApplicantChatContextEvent {
    const fullEvent: ApplicantChatContextEvent = {
      ...event,
      id: `sse-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
    };

    this.eventHistory = [fullEvent, ...this.eventHistory.slice(0, 49)];
    
    // Notify all active WebSocket / SSE channel subscribers
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(fullEvent);
      } catch (err) {
        console.error('SSE Subscriber notification error:', err);
      }
    });

    return fullEvent;
  }

  public getHistory(filterRef?: string): ApplicantChatContextEvent[] {
    if (filterRef) {
      return this.eventHistory.filter(e => e.applicantRef === filterRef);
    }
    return this.eventHistory;
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const realtimeSyncBus = new RealtimeSyncBus();
