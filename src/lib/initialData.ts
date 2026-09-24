import {
  EANUploadItem,
  ProductInventoryItem,
  ImageDataItem,
  PhotoDelegationItem,
  CreativeDepartmentItem,
  ActivityLogItem,
  WorkflowState,
} from '../types';

import {
  initialRealEanList,
  initialRealInventoryList,
  initialRealImageList,
  initialRealPhotoList,
  initialRealCreativeList,
} from './realDataset';

export const initialEanList: EANUploadItem[] = initialRealEanList;
export const initialInventoryList: ProductInventoryItem[] = initialRealInventoryList;
export const initialImageList: ImageDataItem[] = initialRealImageList;
export const initialPhotoList: PhotoDelegationItem[] = initialRealPhotoList;
export const initialCreativeList: CreativeDepartmentItem[] = initialRealCreativeList;

export const initialActivityLogs: ActivityLogItem[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-08 09:30',
    role: 'it_admin',
    userName: 'IT Department',
    action: 'UPLOAD_EAN',
    details: 'Uploaded real company EAN catalog and inventory dataset.',
  },
  {
    id: 'log-002',
    timestamp: '2026-09-08 14:00',
    role: 'it_admin',
    userName: 'IT Department',
    action: 'SHARE_TO_PHOTO',
    details: 'Forwarded selected catalog items to Photo Studio Tracking Sheet.',
  },
];

export const defaultWorkflowState: WorkflowState = {
  eanList: initialEanList,
  inventoryList: initialInventoryList,
  imageList: initialImageList,
  photoList: initialPhotoList,
  creativeList: initialCreativeList,
  activityLogs: initialActivityLogs,
};
