import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '../services/orderService';
import { formatCurrency } from '../utils/format';

const UserOrderHistory: React.FC = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', 'history'],
    queryFn: fetchUserOrders,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading orders: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="text-gray-500 text-center p-8">
        You haven't placed any orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(order.total_price)}</p>
                <p className={`text-sm ${
                  order.payment_status === 'C' ? 'text-green-500' : 
                  order.payment_status === 'P' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {order.payment_status === 'C' ? 'Completed' :
                   order.payment_status === 'P' ? 'Pending' : 'Failed'}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p>{item.product.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <p className="text-sm text-gray-500">
                Shipping Address: {order.shipping_address}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserOrderHistory; 