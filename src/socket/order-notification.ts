export const buildOrderNotificationMeta = (order: any) => {
  const customerName = [order?.firstName, order?.lastName].filter(Boolean).join(" ").trim();
  const orderId = order?.orderId || null;
  const itemCount = Array.isArray(order?.items)
    ? order.items.reduce((total: number, item: any) => total + Number(item?.quantity || 0), 0)
    : 0;

  return {
    orderId,
    customerName,
    itemCount,
    order,
  };
};

export const buildNewOrderNotificationInput = (order: any) => {
  const meta = buildOrderNotificationMeta(order);

  return {
    type: "new_order",
    title: "New order placed",
    message: `${meta.customerName || order?.email || "A customer"} placed order ${meta.orderId || ""}`.trim(),
    eventType: "order:new",
    meta,
  };
};

export const buildNewOrderNotificationPayload = (options: any) => {
  const meta = options?.meta || {};

  return {
    type: "new_order",
    roomId: options?.roomId || null,
    unreadCount: Number(options?.unreadCount || 0),
    title: options?.title || "New order placed",
    message: options?.message || "",
    eventType: options?.eventType || "order:new",
    meta,
    orderId: meta?.orderId || null,
    customerName: meta?.customerName || "",
    order: meta?.order || null,
    summary: {
      orderId: meta?.orderId || null,
      customerName: meta?.customerName || "",
      itemCount: Number(meta?.itemCount || 0),
    },
    createdAt: options?.createdAt || new Date().toISOString(),
  };
};
