// Advanced notification system for MAYO TV

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    persistent?: boolean;
    actions?: NotificationAction[];
    timestamp: Date;
}

export interface NotificationAction {
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
}

class NotificationManager {
    private static instance: NotificationManager;
    private notifications: Notification[] = [];
    private callbacks: ((notifications: Notification[]) => void)[] = [];
    private idCounter = 0;

    private constructor() {}

    public static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    private generateId(): string {
        return `notification-${++this.idCounter}-${Date.now()}`;
    }

    private notifyCallbacks(): void {
        this.callbacks.forEach(callback => callback([...this.notifications]));
    }

    public show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
        const id = this.generateId();
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
            duration: notification.duration ?? (notification.persistent ? undefined : 5000)
        };

        this.notifications.unshift(newNotification);
        this.notifyCallbacks();

        // Auto-dismiss if not persistent
        if (!notification.persistent && newNotification.duration) {
            setTimeout(() => {
                this.dismiss(id);
            }, newNotification.duration);
        }

        return id;
    }

    public dismiss(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notifyCallbacks();
    }

    public dismissAll(): void {
        this.notifications = [];
        this.notifyCallbacks();
    }

    public dismissByType(type: NotificationType): void {
        this.notifications = this.notifications.filter(n => n.type !== type);
        this.notifyCallbacks();
    }

    public getNotifications(): Notification[] {
        return [...this.notifications];
    }

    public subscribe(callback: (notifications: Notification[]) => void): () => void {
        this.callbacks.push(callback);
        callback([...this.notifications]);
        
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    // Convenience methods
    public success(title: string, message: string, options?: Partial<Notification>): string {
        return this.show({
            type: 'success',
            title,
            message,
            ...options
        });
    }

    public error(title: string, message: string, options?: Partial<Notification>): string {
        return this.show({
            type: 'error',
            title,
            message,
            persistent: true, // Errors should be persistent by default
            ...options
        });
    }

    public warning(title: string, message: string, options?: Partial<Notification>): string {
        return this.show({
            type: 'warning',
            title,
            message,
            ...options
        });
    }

    public info(title: string, message: string, options?: Partial<Notification>): string {
        return this.show({
            type: 'info',
            title,
            message,
            ...options
        });
    }

    // Channel-specific notifications
    public channelError(channelName: string, error: string): string {
        return this.error(
            'Erreur de chaîne',
            `Impossible de lire "${channelName}": ${error}`,
            {
                actions: [
                    {
                        label: 'Réessayer',
                        action: () => {
                            // This would be handled by the calling component
                            console.log('Retry channel:', channelName);
                        },
                        style: 'primary'
                    },
                    {
                        label: 'Signaler',
                        action: () => {
                            // This would open a report dialog
                            console.log('Report channel issue:', channelName);
                        },
                        style: 'secondary'
                    }
                ]
            }
        );
    }

    public channelLoaded(channelName: string): string {
        return this.success(
            'Chaîne chargée',
            `"${channelName}" est maintenant disponible`,
            { duration: 3000 }
        );
    }

    public networkError(): string {
        return this.error(
            'Problème de connexion',
            'Vérifiez votre connexion internet et réessayez',
            {
                actions: [
                    {
                        label: 'Réessayer',
                        action: () => {
                            window.location.reload();
                        },
                        style: 'primary'
                    }
                ]
            }
        );
    }

    public updateAvailable(version: string): string {
        return this.info(
            'Mise à jour disponible',
            `Une nouvelle version (${version}) de MAYO TV est disponible`,
            {
                persistent: true,
                actions: [
                    {
                        label: 'Mettre à jour',
                        action: () => {
                            window.location.reload();
                        },
                        style: 'primary'
                    },
                    {
                        label: 'Plus tard',
                        action: () => {
                            // Dismiss notification
                        },
                        style: 'secondary'
                    }
                ]
            }
        );
    }

    public maintenanceMode(): string {
        return this.warning(
            'Maintenance en cours',
            'Certaines fonctionnalités peuvent être temporairement indisponibles',
            {
                persistent: true
            }
        );
    }

    public performanceWarning(metric: string, value: number): string {
        return this.warning(
            'Performance dégradée',
            `${metric}: ${value}. L'expérience peut être affectée.`,
            {
                duration: 8000,
                actions: [
                    {
                        label: 'Optimiser',
                        action: () => {
                            // This would open performance settings
                            console.log('Open performance settings');
                        },
                        style: 'primary'
                    }
                ]
            }
        );
    }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// React hook for notifications
export const useNotifications = () => {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    React.useEffect(() => {
        return notificationManager.subscribe(setNotifications);
    }, []);

    return {
        notifications,
        show: notificationManager.show.bind(notificationManager),
        dismiss: notificationManager.dismiss.bind(notificationManager),
        dismissAll: notificationManager.dismissAll.bind(notificationManager),
        success: notificationManager.success.bind(notificationManager),
        error: notificationManager.error.bind(notificationManager),
        warning: notificationManager.warning.bind(notificationManager),
        info: notificationManager.info.bind(notificationManager)
    };
};