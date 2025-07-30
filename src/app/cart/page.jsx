'use client';

import { Table } from 'antd';
import Link from 'next/link';
import { useDeleteFromCartMutation, useGetCartQuery, useUpdateCartQuantityMutation } from '@/redux/apiSlices/cartSlice';
import { getImageUrl } from '@/util/getImgUrl';
import toast from 'react-hot-toast';

const Cart = () => {
  const { data: cartData, isLoading, refetch } = useGetCartQuery();
  const [updateCart] = useUpdateCartQuantityMutation();
  const [deleteFromCart] = useDeleteFromCartMutation();

  if (isLoading) {
    return <h2>Loading....</h2>;
  }

  const cartItems = cartData?.data?.data || [];
  console.log(cartItems);

  // Update quantity
  const updateQuantity = async (record, newQuantity) => {
    const data = {
      quantity: newQuantity,
      variationId: record?.variations?.[0]?._id,
    };
    // console.log('dfgbsdgbsxbsdfbsdf', record);
    const itemToUpdate = cartItems.find((item) => item._id === record?._id);
    console.log(itemToUpdate);
    if (itemToUpdate) {
      await updateCart({ id: record._id, data });
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (id) => {
    console.log(id);
    try {
      const response = await deleteFromCart(id).unwrap();
      if (response.success) {
        toast.success('Item removed successfully');
        refetch();
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  // Calculate total price
  const totalPrice = cartItems?.reduce((sum, item) => {
    const subtotal = item?.variations?.[0]?.product?.discountedPrice * item?.variations?.[0]?.quantity;
    return sum + (subtotal || 0);
  }, 0);

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <img
            src={getImageUrl(record?.variations?.[0]?.product?.feature)}
            alt={record?.variations?.[0]?.product?.productName}
            className="w-16 h-16 object-cover"
          />
          <span>{record?.variations?.[0]?.product?.productName}</span>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => <span>${record?.variations?.[0]?.product?.discountedPrice?.toFixed(2)}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record) => {
        // console.log(record);
        return (
          <div className="flex items-center gap-4 mt-3">
            <div className="flex border font-semibold p-2 rounded-2xl border-gray-300 items-center gap-3">
              <button
                onClick={() =>
                  updateQuantity(
                    record,
                    record?.variations?.[0]?.quantity > 1 ? record?.variations?.[0]?.quantity - 1 : 1,
                  )
                }
                className="border bg-gray-200 rounded-2xl px-3 py-1"
              >
                -
              </button>
              <span className="text-xl">{record?.variations?.[0]?.quantity}</span>
              <button
                onClick={() => updateQuantity(record, record?.variations?.[0]?.quantity + 1)}
                className="border bg-gray-200 rounded-2xl px-3 py-1"
              >
                +
              </button>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (_, record) => (
        <span>
          ${(record?.variations?.[0]?.product?.discountedPrice * record?.variations?.[0]?.quantity)?.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <button onClick={() => handleRemoveItem(record._id)} className="text-red-500 hover:underline">
          X
        </button>
      ),
    },
  ];

  return (
    <div className="bg-[#F8F8F8]">
      <div className="md:p-20 max-w-7xl mx-auto p-5 md:flex gap-10 w-full">
        <div className="md:w-[70%]">
          <Table
            className="border-t-8 border-t-[#F82BA9] rounded-2xl"
            dataSource={cartItems}
            columns={columns}
            pagination={false}
            scroll={{ x: 700 }}
            rowKey="_id"
          />
        </div>
        <div className="md:w-[30%] border-t-8 mt-10 md:mt-0 border-t-[#F82BA9] bg-white rounded-2xl">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 border-b-2 pb-3">Cart Total</h1>

            <div className="flex justify-between border-b-2 pb-3 text-lg mb-2">
              <span>Subtotal:</span>
              <span className="font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b-2 pb-3 text-lg mb-2">
              <span>Shipping:</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="flex justify-between pb-3 text-lg mb-2">
              <span>Total:</span>
              <span className="font-semibold">${totalPrice.toFixed(2)}</span>
            </div>

            {cartItems.length === 0 ? (
              <button
                className="w-full mt-4 bg-[#F82BA9] text-white py-3 rounded-2xl hover:bg-[#b0397f] hover:text-black"
                onClick={() => toast.error('No items in cart')}
              >
                Proceed to Checkout
              </button>
            ) : (
              <Link href={'/checkout'}>
                <button className="w-full mt-4 bg-[#F82BA9] text-white py-3 rounded-2xl hover:bg-[#b0397f] hover:text-black">
                  Proceed to Checkout
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
