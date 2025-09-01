import React, { useState, useEffect } from 'react';
import { memoryMonitor, performanceMetrics } from '../../services/performanceOptimizer';

interface MetricData {
    avg: number;
    min: number;
    max: number;
    count: number;
}

interface PerformanceData {
    memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    };
    metrics: Record<string, MetricData | null>;
    fps: number;
}

export const PerformanceMonitor: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [performanceData, setPerformanceData] = useState<PerformanceData>({
        metrics: {},
        fps: 0
    });

    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationId: number;

        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                setPerformanceData(prev => ({ ...prev, fps }));
                frameCount = 0;
                lastTime = currentTime;
            }

            animationId = requestAnimationFrame(updateFPS);
        };

        const memoryCallback = (memoryInfo: any) => {
            setPerformanceData(prev => ({
                ...prev,
                memory: memoryInfo
            }));
        };

        const updateMetrics = () => {
            const metrics = performanceMetrics.getAllMetrics();
            setPerformanceData(prev => ({ ...prev, metrics }));
        };

        // Start monitoring
        memoryMonitor.subscribe(memoryCallback);
        updateFPS();

        const metricsInterval = setInterval(updateMetrics, 2000);

        return () => {
            memoryMonitor.unsubscribe(memoryCallback);
            cancelAnimationFrame(animationId);
            clearInterval(metricsInterval);
        };
    }, []);

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatMs = (ms: number): string => {
        return `${ms.toFixed(2)}ms`;
    };

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
                title="Afficher le moniteur de performance"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm z-50">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Performance Monitor</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-3 text-sm">
                {/* FPS */}
                <div className="flex justify-between">
                    <span className="text-gray-600">FPS:</span>
                    <span className={`font-mono ${performanceData.fps < 30 ? 'text-red-600' : performanceData.fps < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {performanceData.fps}
                    </span>
                </div>

                {/* Memory Usage */}
                {performanceData.memory && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mémoire utilisée:</span>
                            <span className="font-mono text-blue-600">
                                {formatBytes(performanceData.memory.usedJSHeapSize)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mémoire totale:</span>
                            <span className="font-mono text-gray-700">
                                {formatBytes(performanceData.memory.totalJSHeapSize)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(performanceData.memory.usedJSHeapSize / performanceData.memory.totalJSHeapSize) * 100}%`
                                }}
                            ></div>
                        </div>
                    </>
                )}

                {/* Performance Metrics */}
                {Object.keys(performanceData.metrics).length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                        <div className="text-gray-700 font-medium mb-2">Métriques:</div>
                        {Object.entries(performanceData.metrics).map(([label, data]) => {
                            if (!data || typeof data !== 'object' || !('avg' in data)) {
                                return (
                                    <div key={label} className="flex justify-between text-xs">
                                        <span className="text-gray-600 truncate">{label}:</span>
                                        <span className="font-mono text-gray-500 ml-2">N/A</span>
                                    </div>
                                );
                            }

                            const metricData = data as MetricData;
                            return (
                                <div key={label} className="text-xs mb-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 truncate">{label}:</span>
                                        <span className="font-mono text-gray-700 ml-2">
                                            {formatMs(metricData.avg)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Min: {formatMs(metricData.min)}</span>
                                        <span>Max: {formatMs(metricData.max)}</span>
                                        <span>({metricData.count})</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-3 flex space-x-2">
                    <button
                        onClick={() => performanceMetrics.clearMetrics()}
                        className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => {
                            const data = {
                                timestamp: new Date().toISOString(),
                                ...performanceData
                            };
                            console.log('Performance Data:', data);
                        }}
                        className="flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                    >
                        Log
                    </button>
                </div>
            </div>
        </div>
    );
};