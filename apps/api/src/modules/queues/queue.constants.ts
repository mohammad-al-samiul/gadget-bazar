export const QUEUES = {
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  MEDIA: 'media',
  SEARCH_INDEXING: 'search-indexing',
  REPORTS: 'reports',
} as const;

export const DLQS = {
  PAYMENTS: 'payments-dlq',
  NOTIFICATIONS: 'notifications-dlq',
  MEDIA: 'media-dlq',
  SEARCH_INDEXING: 'search-indexing-dlq',
  REPORTS: 'reports-dlq',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
export type DlqName = (typeof DLQS)[keyof typeof DLQS];

export const DOMAIN_EVENTS = {
  PAYMENT_CONFIRMED: 'order.payment_confirmed',
  SHIPMENT_ARRIVED: 'shipment.arrived_bd',
  ORDER_WEIGHED: 'order.weighed',
  REFUND_REQUESTED: 'payment.refund_requested',
  MEDIA_UPLOADED: 'media.uploaded',
  PRODUCT_INDEX_REQUIRED: 'search.product_reindex',
  REPORT_REQUESTED: 'report.generate',
} as const;

export type DomainEventType = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

/**
 * Maps each domain event to its designated processing queue
 */
export const EVENT_TO_QUEUE_MAP: Record<string, QueueName> = {
  [DOMAIN_EVENTS.PAYMENT_CONFIRMED]: QUEUES.PAYMENTS,
  [DOMAIN_EVENTS.REFUND_REQUESTED]: QUEUES.PAYMENTS,
  [DOMAIN_EVENTS.SHIPMENT_ARRIVED]: QUEUES.NOTIFICATIONS,
  [DOMAIN_EVENTS.ORDER_WEIGHED]: QUEUES.NOTIFICATIONS,
  [DOMAIN_EVENTS.MEDIA_UPLOADED]: QUEUES.MEDIA,
  [DOMAIN_EVENTS.PRODUCT_INDEX_REQUIRED]: QUEUES.SEARCH_INDEXING,
  [DOMAIN_EVENTS.REPORT_REQUESTED]: QUEUES.REPORTS,
};

export const QUEUE_CONCURRENCY = {
  [QUEUES.PAYMENTS]: 20,
  [QUEUES.NOTIFICATIONS]: 15,
  [QUEUES.MEDIA]: 5,
  [QUEUES.SEARCH_INDEXING]: 5,
  [QUEUES.REPORTS]: 2,
};
