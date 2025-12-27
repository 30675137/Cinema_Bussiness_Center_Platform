/**
 * ReservationSettingsModal Component
 *
 * Modal wrapper for ReservationSettingsForm.
 * Provides a reusable modal for editing single store reservation settings.
 *
 * @feature 016-store-reservation-settings
 */

import React from 'react';
import { Modal } from 'antd';
import ReservationSettingsForm from './ReservationSettingsForm';
import type { StoreReservationSettings } from '../types/reservation-settings.types';
import type { ReservationSettingsFormData } from '../types/reservation-settings.schema';

interface ReservationSettingsModalProps {
  visible: boolean;
  storeId: string;
  storeName: string;
  initialData?: StoreReservationSettings;
  onSubmit: (data: ReservationSettingsFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Reservation Settings Modal Component
 * Wraps ReservationSettingsForm in a modal dialog
 */
const ReservationSettingsModal: React.FC<ReservationSettingsModalProps> = ({
  visible,
  storeId,
  storeName,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      title={`预约设置 - ${storeName}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' },
      }}
    >
      <ReservationSettingsForm
        storeId={storeId}
        storeName={storeName}
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        loading={loading}
      />
    </Modal>
  );
};

export default ReservationSettingsModal;
