import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Notification, NotificationType } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly endpoint = '/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Get user notifications
  getNotifications(page = 0, size = 20): Observable<Notification[]> {
    return this.apiService.get<Notification[]>(this.endpoint, { page, size });
  }

  // Get unread notifications count
  getUnreadCount(): Observable<number> {
    return this.apiService.get<number>(`${this.endpoint}/unread/count`);
  }

  // Mark notification as read
  markAsRead(id: string): Observable<void> {
    return this.apiService.patch<void>(`${this.endpoint}/${id}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<void> {
    return this.apiService.patch<void>(`${this.endpoint}/read-all`, {});
  }

  // Delete notification
  deleteNotification(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  // Load notifications into local state
  loadNotifications(): void {
    this.getNotifications().subscribe(notifications => {
      this.notificationsSubject.next(notifications);
    });

    this.getUnreadCount().subscribe(count => {
      this.unreadCountSubject.next(count);
    });
  }

  // Update local notification state
  updateLocalNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    const index = current.findIndex(n => n.id === notification.id);
    
    if (index > -1) {
      current[index] = notification;
    } else {
      current.unshift(notification);
    }
    
    this.notificationsSubject.next([...current]);
    
    // Update unread count
    const unreadCount = current.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Remove notification from local state
  removeLocalNotification(id: string): void {
    const current = this.notificationsSubject.value;
    const filtered = current.filter(n => n.id !== id);
    this.notificationsSubject.next(filtered);
    
    const unreadCount = filtered.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Create local notification (for real-time updates)
  addLocalNotification(type: NotificationType, title: string, message: string, data?: any): void {
    const notification: Notification = {
      id: Date.now().toString(),
      userId: '',
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date()
    };
    
    this.updateLocalNotification(notification);
  }

  // Subscribe to real-time notifications (WebSocket)
  subscribeToRealTimeNotifications(): void {
    // This would be implemented with WebSocket connection
    // For now, we'll poll every 30 seconds
    setInterval(() => {
      this.loadNotifications();
    }, 30000);
  }

  // Initialize notification service
  initialize(): void {
    this.loadNotifications();
    this.subscribeToRealTimeNotifications();
  }
}