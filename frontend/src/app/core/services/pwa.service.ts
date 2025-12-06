import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface InstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: InstallPromptEvent | null = null;
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  private isInstalledSubject = new BehaviorSubject<boolean>(false);
  private isStandaloneSubject = new BehaviorSubject<boolean>(false);

  public isOnline$ = this.isOnlineSubject.asObservable();
  public isInstallable$ = this.isInstallableSubject.asObservable();
  public isInstalled$ = this.isInstalledSubject.asObservable();
  public isStandalone$ = this.isStandaloneSubject.asObservable();

  constructor(
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar
  ) {
    this.initializeNetworkStatus();
    this.initializeInstallPrompt();
    this.initializeStandaloneMode();
    this.initializeServiceWorkerUpdates();
  }

  private initializeNetworkStatus(): void {
    // Monitor online/offline status
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      startWith(navigator.onLine),
      distinctUntilChanged()
    ).subscribe(isOnline => {
      this.isOnlineSubject.next(isOnline);
      
      if (isOnline) {
        this.showSnackBar('🌐 You are back online!', 'success');
      } else {
        this.showSnackBar('📱 You are offline. Some features may be limited.', 'warning');
      }
    });
  }

  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.promptEvent = e as InstallPromptEvent;
      this.isInstallableSubject.next(true);
      
      this.showSnackBar(
        '📲 Install NebulaMart for a better experience!', 
        'info',
        'Install',
        () => this.promptInstall()
      );
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalledSubject.next(true);
      this.isInstallableSubject.next(false);
      this.promptEvent = null;
      this.showSnackBar('🎉 NebulaMart has been installed successfully!', 'success');
    });
  }

  private initializeStandaloneMode(): void {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://');
    
    this.isStandaloneSubject.next(isStandalone);

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)')
      .addEventListener('change', (e) => {
        this.isStandaloneSubject.next(e.matches);
      });
  }

  private initializeServiceWorkerUpdates(): void {
    if (this.swUpdate.isEnabled) {
      // Check for updates every 30 minutes
      setInterval(() => {
        this.swUpdate.checkForUpdate();
      }, 30 * 60 * 1000);

      // Handle available updates
      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        switch (event.type) {
          case 'VERSION_DETECTED':
            console.log('Downloading new app version:', event.version.hash);
            break;
          case 'VERSION_READY':
            this.handleUpdateAvailable();
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.error('Failed to install app version:', event.error);
            this.showSnackBar('❌ Failed to update the app. Please refresh manually.', 'error');
            break;
        }
      });

      // Handle unrecoverable state
      this.swUpdate.unrecoverable.subscribe(event => {
        this.showSnackBar(
          '🔄 An error occurred. The page will reload to fix the issue.',
          'error',
          'Reload',
          () => window.location.reload()
        );
      });
    }
  }

  private handleUpdateAvailable(): void {
    this.showSnackBar(
      '🆕 A new version is available!',
      'info',
      'Update',
      () => {
        this.swUpdate.activateUpdate().then(() => {
          window.location.reload();
        });
      },
      8000 // Show for 8 seconds
    );
  }

  async promptInstall(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    try {
      await this.promptEvent.prompt();
      const choiceResult = await this.promptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.isInstallableSubject.next(false);
        this.promptEvent = null;
        return true;
      }
    } catch (error) {
      console.error('Error during installation:', error);
      this.showSnackBar('❌ Installation failed. Please try again.', 'error');
    }

    return false;
  }

  requestPersistentStorage(): void {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().then(granted => {
        if (granted) {
          console.log('Persistent storage granted');
          this.showSnackBar('💾 Storage permission granted for offline use', 'success');
        } else {
          console.log('Persistent storage denied');
        }
      });
    }
  }

  async getStorageUsage(): Promise<{ used: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        };
      } catch (error) {
        console.error('Failed to get storage estimate:', error);
      }
    }
    return null;
  }

  share(data: ShareData): Promise<void> {
    if (navigator.share) {
      return navigator.share(data);
    } else {
      // Fallback for browsers that don't support Web Share API
      return this.fallbackShare(data);
    }
  }

  private async fallbackShare(data: ShareData): Promise<void> {
    const text = `${data.title}\n${data.text}\n${data.url}`;
    
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      this.showSnackBar('📋 Link copied to clipboard!', 'success');
    } else {
      // Further fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showSnackBar('📋 Link copied to clipboard!', 'success');
    }
  }

  enableNotifications(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    return Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        this.showSnackBar('🔔 Notifications enabled!', 'success');
      } else {
        this.showSnackBar('🔕 Notification permission denied', 'warning');
      }
      return permission;
    });
  }

  sendNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: 'nebulamart',
        requireInteraction: false,
        silent: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }

  registerPeriodicBackgroundSync(tag: string): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        return (registration as any).periodicSync?.register(tag, {
          minInterval: 24 * 60 * 60 * 1000 // 24 hours
        });
      });
    }
  }

  addToHomeScreen(): void {
    if (this.isInstallableSubject.value) {
      this.promptInstall();
    } else {
      // Show instructions for manual installation
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';

      if (userAgent.includes('chrome')) {
        instructions = 'Tap the menu (⋮) and select "Add to Home screen"';
      } else if (userAgent.includes('firefox')) {
        instructions = 'Tap the menu and select "Install"';
      } else if (userAgent.includes('safari')) {
        instructions = 'Tap the share button and select "Add to Home Screen"';
      } else {
        instructions = 'Look for "Add to Home Screen" or "Install" in your browser menu';
      }

      this.showSnackBar(`📱 ${instructions}`, 'info', 'Got it', undefined, 10000);
    }
  }

  private showSnackBar(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info',
    actionLabel?: string,
    actionHandler?: () => void,
    duration: number = 4000
  ): void {
    const config = {
      duration,
      verticalPosition: 'bottom' as const,
      horizontalPosition: 'center' as const,
      panelClass: [`snackbar-${type}`]
    };

    const snackBarRef = this.snackBar.open(message, actionLabel || 'Dismiss', config);
    
    if (actionHandler) {
      snackBarRef.onAction().subscribe(actionHandler);
    }
  }

  // PWA Analytics
  trackPwaUsage(event: string, data?: any): void {
    // Track PWA specific events
    if ((window as any).gtag) {
      (window as any).gtag('event', event, {
        event_category: 'PWA',
        event_label: this.isStandaloneSubject.value ? 'Standalone' : 'Browser',
        custom_parameter_1: data
      });
    }
  }

  checkCapabilities(): { [key: string]: boolean } {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      webShare: 'share' in navigator,
      clipboard: 'clipboard' in navigator,
      persistentStorage: 'storage' in navigator && 'persist' in navigator.storage,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      periodicBackgroundSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
      webUsb: 'usb' in navigator,
      webBluetooth: 'bluetooth' in navigator,
      geolocation: 'geolocation' in navigator,
      deviceMotion: 'DeviceMotionEvent' in window,
      fullscreen: 'requestFullscreen' in document.documentElement,
      wakeLock: 'wakeLock' in navigator
    };
  }
}