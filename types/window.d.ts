declare global {
    interface Window {
        api: {
            send: (channel: string, data?: any) => void;
            sendSync: (channel: string, data: any) => any;
            on: (channel: string, func: any) => void;
        };
    }
}

export {};
