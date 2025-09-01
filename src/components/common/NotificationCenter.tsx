import React from 'react';
import { useNotifications, type Notification, type NotificationType } from '../../services/notificationManager';

interface NotificationItemProps {
    notification: Notification;
    onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9 1.5a9 9 0 1118 0 9 9 0 01-18 0zm9-3.75h.008v.008H12v-.008z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getStyles = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return {
                    container: 'bg-green-50 border-green-200',
                    icon: 'text-green-400',
                    title: 'text-green-800',
                    message: 'text-green-700'
                };
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200',
                    icon: 'text-red-400',
                    title: 'text-red-800',
                    message: 'text-red-700'
                };
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200',
                    icon: 'text-yellow-400',
                    title: 'text-yellow-800',
                    message: 'text-yellow-700'
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-400',
                    title: 'text-blue-800',
                    message: 'text-blue-700'
                };
        }
    };

    const styles = getStyles(notification.type);

    const getActionButtonStyle = (style?: string) => {
        switch (style) {
            case 'primary':
                return 'bg-primary text-white hover:bg-secondary';
            case 'danger':
                return 'bg-red-600 text-white hover:bg-red-700';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    return (
        <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${styles.container} animate-fade-in`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        {getIcon(notification.type)}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className={`text-sm font-medium ${styles.title}`}>
                            {notification.title}
                        </p>
                        <p className={`mt-1 text-sm ${styles.message}`}>
                            {notification.message}
                        </p>
                        
                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                            <div className="mt-3 flex space-x-2">
                                {notification.actions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            action.action();
                                            onDismiss(notification.id);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${getActionButtonStyle(action.style)}`}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        {/* Timestamp */}
                        <p className="mt-2 text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={() => onDismiss(notification.id)}
                            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NotificationCenter: React.FC = () => {
    const { notifications, dismiss, dismissAll } = useNotifications();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-h-screen overflow-y-auto">
            {/* Clear All Button */}
            {notifications.length > 1 && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={dismissAll}
                        className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded shadow border border-gray-200 transition-colors"
                    >
                        Tout effacer ({notifications.length})
                    </button>
                </div>
            )}
            
            {/* Notifications */}
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismiss}
                />
            ))}
        </div>
    );
};