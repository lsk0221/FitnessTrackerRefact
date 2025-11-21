/**
 * useAppAlert Hook
 * 應用提示框 Hook
 * 
 * Provides a unified interface for showing alerts and action sheets
 * 提供統一的介面來顯示提示框和操作表
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import CustomAlert, { AlertButton } from '../components/CustomAlert';
import Popover, { PopoverOption } from '../components/Popover';

export interface ShowConfirmationOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmStyle?: 'default' | 'destructive';
}

export interface ShowOptionsOptions {
  title?: string;
  options: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'destructive';
  }>;
  cancelText?: string;
  onCancel?: () => void;
}

export interface ShowAlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export interface ShowPopoverOptions {
  anchorRect: { x: number; y: number; width: number; height: number };
  options: Array<{
    text: string;
    onPress: () => void;
    isDestructive?: boolean;
  }>;
  title?: string;
  cancelText?: string;
  onCancel?: () => void;
}

/**
 * Hook for showing custom alerts and action sheets
 * 顯示自定義提示框和操作表的 Hook
 */
export const useAppAlert = (): {
  showConfirmation: (options: ShowConfirmationOptions) => void;
  showOptions: (options: ShowOptionsOptions) => void;
  showAlert: (options: ShowAlertOptions) => void;
  showPopover: (options: ShowPopoverOptions) => void;
  closeAlert: () => void;
  renderAlert: () => React.ReactElement | null;
} => {
  const themeContext = useTheme();
  const theme = themeContext?.theme;
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons: AlertButton[];
    mode: 'alert' | 'actionsheet';
    cancelText?: string;
    onCancel?: () => void;
  }>({
    visible: false,
    title: '',
    buttons: [],
    mode: 'alert',
  });

  const [popoverState, setPopoverState] = useState<{
    visible: boolean;
    anchorRect: { x: number; y: number; width: number; height: number } | null;
    options: PopoverOption[];
    title?: string;
  }>({
    visible: false,
    anchorRect: null,
    options: [],
  });

  /**
   * Show a confirmation dialog
   * 顯示確認對話框
   */
  const showConfirmation = useCallback(
    (options: ShowConfirmationOptions) => {
      const {
        title,
        message,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        onConfirm,
        onCancel,
        confirmStyle = 'default',
      } = options;

      setAlertState({
        visible: true,
        title,
        message,
        buttons: [
          {
            text: cancelText,
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: confirmText,
            style: confirmStyle,
            onPress: onConfirm,
          },
        ],
        mode: 'alert',
      });
    },
    []
  );

  /**
   * Show an action sheet (vertical button list in centered modal)
   * 顯示操作表（居中模態框中的垂直按鈕列表）
   */
  const showOptions = useCallback(
    (options: ShowOptionsOptions) => {
      const { title, options: optionList, cancelText = 'Cancel', onCancel } = options;

      const buttons: AlertButton[] = optionList.map((opt) => ({
        text: opt.text,
        onPress: opt.onPress,
        style: opt.style || 'default',
      }));

      // Add cancel button as the last option in the list
      buttons.push({
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      });

      // Use actionsheet mode to render as vertical list in centered modal
      setAlertState({
        visible: true,
        title: title || '',
        buttons,
        mode: 'actionsheet',
        cancelText, // Keep for backward compatibility
        onCancel, // Keep for backward compatibility
      } as any);
    },
    []
  );

  /**
   * Show a simple alert
   * 顯示簡單提示框
   */
  const showAlert = useCallback((options: ShowAlertOptions) => {
    const { title, message, buttons = [{ text: 'OK' }] } = options;

    setAlertState({
      visible: true,
      title,
      message,
      buttons,
      mode: 'alert',
    });
  }, []);

  /**
   * Show a popover near a trigger element
   * 在觸發元素附近顯示彈出式選單
   */
  const showPopover = useCallback(
    (options: ShowPopoverOptions) => {
      const { anchorRect, options: optionList, title } = options;

      const popoverOptions: PopoverOption[] = optionList.map((opt) => ({
        text: opt.text,
        onPress: opt.onPress,
        isDestructive: opt.isDestructive,
      }));

      // No cancel option - user can click outside to close
      // 不添加取消選項 - 用戶可以點擊外部關閉

      setPopoverState({
        visible: true,
        anchorRect,
        options: popoverOptions,
        title,
      });
    },
    []
  );

  /**
   * Close the alert
   * 關閉提示框
   */
  const closeAlert = useCallback(() => {
    setAlertState((prev) => ({
      ...prev,
      visible: false,
    }));
    setPopoverState((prev) => ({
      ...prev,
      visible: false,
    }));
  }, []);

  /**
   * Render the alert component
   * 渲染提示框組件
   */
  const renderAlert = useCallback(() => {
    if (!theme) return null;

    const handleClose = () => {
      if (alertState.mode === 'actionsheet' && alertState.onCancel) {
        alertState.onCancel();
      }
      closeAlert();
    };

    const handlePopoverClose = () => {
      closeAlert();
    };

    return (
      <>
        <CustomAlert
          visible={alertState.visible}
          title={alertState.title}
          message={alertState.message}
          buttons={alertState.buttons}
          theme={theme}
          mode={alertState.mode}
          onClose={handleClose}
          cancelText={alertState.mode === 'actionsheet' ? (alertState.cancelText || 'Cancel') : undefined}
        />
        <Popover
          isVisible={popoverState.visible}
          anchorRect={popoverState.anchorRect}
          options={popoverState.options}
          onClose={handlePopoverClose}
          title={popoverState.title}
          theme={theme}
        />
      </>
    );
  }, [alertState, popoverState, theme, closeAlert]);

  return {
    showConfirmation,
    showOptions,
    showAlert,
    showPopover,
    closeAlert,
    renderAlert,
  };
};

