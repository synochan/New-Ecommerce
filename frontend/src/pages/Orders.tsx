import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders, Order } from '../services/api';

const Orders: React.FC = () => {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => getOrders().then(res => res.data)
  });

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (!orders?.length) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">No orders found</h2>
        <p className="text-gray-400">Your order history is empty</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-primary text-white">
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-gray-400">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-accent">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-accent font-bold">${order.total_amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders; 