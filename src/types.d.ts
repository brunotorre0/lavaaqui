declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options?: any) => any;
        Marker: new (options?: any) => any;
        InfoWindow: new (options?: any) => any;
        Size: new (width: number, height: number) => any;
        Animation: {
          DROP: any;
        };
        event: {
          addListenerOnce: (instance: any, eventName: string, callback: () => void) => void;
        };
      };
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    FB?: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
      api: (path: string, params: any, callback: (response: any) => void) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export {};

