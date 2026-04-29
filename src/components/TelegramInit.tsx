'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: (params?: { return_back?: boolean }) => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        setBottomBarColor: (color: string) => void;
        isVersionAtLeast: (version: string) => boolean;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
          header_bg_color?: string;
          bottom_bar_bg_color?: string;
          accent_text_color?: string;
          section_bg_color?: string;
          section_header_text_color?: string;
          section_separator_color?: string;
          subtitle_text_color?: string;
          destructive_text_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        bottomBarColor: string;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
          }) => void;
        };
        SecondaryButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          setText: (text: string) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          setParams: (params: {
            text?: string;
            color?: string;
            text_color?: string;
            is_active?: boolean;
            is_visible?: boolean;
            position?: string;
          }) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        SettingsButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        CloudStorage: {
          setItem: (key: string, value: string, cb?: (err: Error | null, stored?: boolean) => void) => void;
          getItem: (key: string, cb: (err: Error | null, value?: string) => void) => void;
          getItems: (keys: string[], cb: (err: Error | null, values?: Record<string, string>) => void) => void;
          removeItem: (key: string, cb?: (err: Error | null, removed?: boolean) => void) => void;
          removeItems: (keys: string[], cb?: (err: Error | null, removed?: boolean) => void) => void;
          getKeys: (cb: (err: Error | null, keys?: string[]) => void) => void;
        };
        sendData: (data: string) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        showPopup: (params: {
          title?: string;
          message: string;
          buttons?: Array<{ id?: string; type?: string; text: string }>;
        }, cb?: (button_id: string) => void) => void;
        showAlert: (message: string, cb?: () => void) => void;
        showConfirm: (message: string, cb?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, cb?: (text: string) => boolean) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (cb?: (text: string | null) => void) => void;
        requestWriteAccess: (cb?: (granted: boolean) => void) => void;
        requestContact: (cb?: (sent: boolean) => void) => void;
        onEvent: (eventType: string, handler: (...args: unknown[]) => void) => void;
        offEvent: (eventType: string, handler: (...args: unknown[]) => void) => void;
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: {
            id: number;
            is_bot?: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            added_to_attachment_menu?: boolean;
            allows_write_to_pm?: boolean;
            photo_url?: string;
          };
          receiver?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          chat?: {
            id: number;
            type: string;
            title: string;
            username?: string;
            photo_url?: string;
          };
          chat_type?: string;
          chat_instance?: string;
          start_param?: string;
          can_send_after?: number;
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
      };
    };
  }
}

export function TelegramInit() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Signal ready to Telegram
    tg.ready();

    // Expand to full height
    tg.expand();

    // Sync theme colors to CSS custom properties
    const applyTheme = () => {
      const params = tg.themeParams;
      if (params.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', params.bg_color);
      }
      if (params.text_color) {
        document.documentElement.style.setProperty('--tg-text-color', params.text_color);
      }
      if (params.button_color) {
        document.documentElement.style.setProperty('--tg-button-color', params.button_color);
      }
      if (params.button_text_color) {
        document.documentElement.style.setProperty('--tg-button-text-color', params.button_text_color);
      }
      if (params.secondary_bg_color) {
        document.documentElement.style.setProperty('--tg-secondary-bg-color', params.secondary_bg_color);
      }
      if (params.hint_color) {
        document.documentElement.style.setProperty('--tg-hint-color', params.hint_color);
      }
      if (params.link_color) {
        document.documentElement.style.setProperty('--tg-link-color', params.link_color);
      }
      if (params.accent_text_color) {
        document.documentElement.style.setProperty('--tg-accent-text-color', params.accent_text_color);
      }
      if (params.destructive_text_color) {
        document.documentElement.style.setProperty('--tg-destructive-text-color', params.destructive_text_color);
      }
    };

    // Apply theme immediately
    applyTheme();

    // Listen for theme changes
    const themeHandler = () => applyTheme();
    tg.onEvent('themeChanged', themeHandler);

    // Set up MainButton
    const mainBtn = tg.MainButton;
    mainBtn.setText('SPIN!');
    mainBtn.setParams({
      color: '#FFD700',
      text_color: '#0A0F26',
      is_visible: false,
      is_active: true,
    });

    // Set up BackButton
    const backBtn = tg.BackButton;
    backBtn.onClick(() => {
      tg.close({ return_back: true });
    });

    // Enable closing confirmation for game flow
    tg.enableClosingConfirmation();

    // Set header and background colors
    if (tg.isVersionAtLeast('6.1')) {
      tg.setHeaderColor('bg_color');
      tg.setBackgroundColor('#0A0F26');
    }
    if (tg.isVersionAtLeast('7.10')) {
      tg.setBottomBarColor('#0A0F26');
    }

    // Cleanup
    return () => {
      tg.offEvent('themeChanged', themeHandler);
    };
  }, []);

  return null;
}
