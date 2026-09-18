/**
 * Utility to serialize Order records or plain objects safely.
 * Converts Prisma CUIDs/IDs to strings and maps fields for frontend compatibility.
 */
export function serializeOrder(order: any): any {
  if (!order) return null;

  const rawObj = typeof order.toObject === 'function' ? order.toObject() : order;
  const idStr = rawObj.id || (rawObj._id ? rawObj._id.toString() : '');

  // Process customerId / customer
  let customerData = rawObj.customer || rawObj.customerId;
  if (customerData && typeof customerData === 'object') {
    const custId = customerData.id || (customerData._id ? customerData._id.toString() : undefined);
    customerData = {
      ...customerData,
      _id: custId,
      id: custId,
    };
  } else if (customerData) {
    customerData = customerData.toString();
  }

  // Process shippingAddress
  let shippingAddressData = rawObj.shippingAddress;
  if (shippingAddressData && typeof shippingAddressData === 'object') {
    if (shippingAddressData.street === '__MISSING_RELATION__') {
      shippingAddressData = null;
    } else {
      const addId = shippingAddressData.id || (shippingAddressData._id ? shippingAddressData._id.toString() : undefined);
      shippingAddressData = {
        ...shippingAddressData,
        _id: addId,
        id: addId,
      };
    }
  } else if (shippingAddressData) {
    shippingAddressData = shippingAddressData.toString();
  }

  // Process sellerIds
  const sellerIds = Array.isArray(rawObj.sellerIds)
    ? rawObj.sellerIds.map((sid: any) => sid.toString())
    : [];

  return {
    ...rawObj,
    _id: idStr,
    id: idStr,
    customerId: customerData,
    shippingAddress: shippingAddressData,
    sellerIds,
    status: rawObj.aggregateStatus || rawObj.status, // Frontend compatibility
  };
}

/**
 * Utility to serialize OrderItem records or plain objects safely.
 */
export function serializeOrderItem(item: any): any {
  if (!item) return null;

  const rawObj = typeof item.toObject === 'function' ? item.toObject() : item;
  const idStr = rawObj.id || (rawObj._id ? rawObj._id.toString() : '');

  // Process orderId
  let orderData = rawObj.order || rawObj.orderId;
  if (orderData && typeof orderData === 'object') {
    orderData = serializeOrder(orderData);
  } else if (orderData) {
    orderData = orderData.toString();
  }

  // Process productId
  let productData = rawObj.product || rawObj.productId;
  if (productData && typeof productData === 'object') {
    const prodId = productData.id || (productData._id ? productData._id.toString() : undefined);
    productData = {
      ...productData,
      _id: prodId,
      id: prodId,
    };
  } else if (productData) {
    productData = productData.toString();
  }

  return {
    ...rawObj,
    _id: idStr,
    id: idStr,
    orderId: orderData,
    productId: productData,
    variantId: rawObj.variantId ? rawObj.variantId.toString() : undefined,
    sellerId: rawObj.sellerId ? rawObj.sellerId.toString() : undefined,
  };
}

