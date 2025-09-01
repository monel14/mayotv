import type { LiveMatch } from '../domain/models';

export class NotificationService {
    private static instance: NotificationService;
    private permission: NotificationPermission = 'default';

    private constructor() {
        this.requestPermission();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async requestPermission(): Promise<void> {
        if ('Notification' in window) {
            this.permission = await Notification.requestPermission();
        }
    }

    public async notifyMatchStart(match: LiveMatch): Promise<void> {
        if (this.permission !== 'granted') return;

        const notification = new Notification(`⚽ Match commence !`, {
            body: `${match.homeTeam.name} vs ${match.awayTeam.name}\n${match.league}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `match-${match.id}`,
            requireInteraction: false,
            silent: false
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);
    }

    public async notifyGoal(match: LiveMatch, team: 'home' | 'away'): Promise<void> {
        if (this.permission !== 'granted') return;

        const scoringTeam = team === 'home' ? match.homeTeam : match.awayTeam;
        const score = match.score;

        if (!score) return;

        const notification = new Notification(`⚽ BUUUUT !`, {
            body: `${scoringTeam.name} marque !\n${match.homeTeam.name} ${score.home} - ${score.away} ${match.awayTeam.name}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `goal-${match.id}-${Date.now()}`,
            requireInteraction: false,
            silent: false
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        setTimeout(() => {
            notification.close();
        }, 8000);
    }

    public async notifyHalfTime(match: LiveMatch): Promise<void> {
        if (this.permission !== 'granted') return;

        const score = match.score;
        const scoreText = score ? `${score.home} - ${score.away}` : '0 - 0';

        const notification = new Notification(`⏱️ Mi-temps`, {
            body: `${match.homeTeam.name} ${scoreText} ${match.awayTeam.name}\n${match.league}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `halftime-${match.id}`,
            requireInteraction: false,
            silent: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        setTimeout(() => {
            notification.close();
        }, 4000);
    }

    public async notifyMatchEnd(match: LiveMatch): Promise<void> {
        if (this.permission !== 'granted') return;

        const score = match.score;
        const scoreText = score ? `${score.home} - ${score.away}` : '0 - 0';

        const notification = new Notification(`🏁 Match terminé`, {
            body: `${match.homeTeam.name} ${scoreText} ${match.awayTeam.name}\n${match.league}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `fulltime-${match.id}`,
            requireInteraction: false,
            silent: true
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        setTimeout(() => {
            notification.close();
        }, 6000);
    }

    public async scheduleMatchReminder(match: LiveMatch, minutesBefore: number = 15): Promise<void> {
        if (this.permission !== 'granted') return;

        const now = new Date();
        const matchTime = new Date(match.kickoffTime);
        const reminderTime = new Date(matchTime.getTime() - minutesBefore * 60000);

        if (reminderTime <= now) return; // Too late to schedule

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            const notification = new Notification(`⏰ Match bientôt !`, {
                body: `${match.homeTeam.name} vs ${match.awayTeam.name}\nDans ${minutesBefore} minutes - ${match.league}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `reminder-${match.id}`,
                requireInteraction: true,
                silent: false
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            setTimeout(() => {
                notification.close();
            }, 10000);
        }, timeUntilReminder);
    }

    public isSupported(): boolean {
        return 'Notification' in window;
    }

    public getPermission(): NotificationPermission {
        return this.permission;
    }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();