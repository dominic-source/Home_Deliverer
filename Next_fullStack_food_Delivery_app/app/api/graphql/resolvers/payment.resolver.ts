import { myLogger } from '@/app/api/upload/logger';
import { Payment } from '@/models/payment';
import Order from '@/models/order';
import { paymentMethods, currency } from '@/app/lib/definitions';
import { authRequest } from '@/app/api/datasource/user.data';
import { ObjectId } from 'mongoose';

const availableCurrency = currency;

export const paymentQueryResolver = {
  getMyPayment: async (_parent: any, { orderId }: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };    // Uses the user._id as a string instead of object
    try {
      const order = await Order.findById(orderId).populate('payment');
      if (!order) return { message: 'Order was not found!', statusCode: 401, ok: false };
      if (!(order.buyerId.toString() === (user._id as ObjectId).toString() ||
        order.sellerId.toString() === (user._id as ObjectId).toString() ||
          order.dispatcherId.toString() === (user._id as ObjectId).toString())) {
            return { message: 'You are may not be the right user!', statusCode: 401, ok: false };
      }
      return { paymentsData: order.payment, statusCode: 200, ok: true };
    } catch (error) {
      myLogger.error('Error getting payment: ' + (error as Error).message);
      return { 'message': 'An error occurred!', statusCode: 500, ok: false };
    }
  },
}

export const paymentMutationResolver = {
  updatePayment: async (_parent: any, {
    paymentId,
    status
      }: any, { req }: any) => {

    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };    // Uses the user._id as a string instead of object
  
    try {
      const pay = await Payment.findById(paymentId);
      if (!pay) return {'message': 'Payment not found', statusCode: 404, ok: false };
      const order = await Order.findById(pay.orderId);
      if (!order) return {'message': 'Order not found', statusCode: 404, ok: false };
      if (order.sellerId.toString() === (user._id as ObjectId).toString()) {
        pay.sellerPaymentStatus = status;
      } else if (order.dispatcherId.toString() === (user._id as ObjectId).toString()) {
        pay.dispatcherPaymentStatus = status;
      } else {
        return {'message': 'Unauthorized', statusCode: 401, ok: false };
      }
      pay.lastUpdateTime = new Date()
      pay.paymentDateTime = new Date();
      if (pay.sellerPaymentStatus === 'paid' && pay.dispatcherPaymentStatus === 'paid'){
        order.status = 'completed';
        await order.save();
      } else if (pay.sellerPaymentStatus !== 'paid' || pay.dispatcherPaymentStatus !== 'paid'){
        order.status = 'incomplete';
        await order.save();
      }
      await pay.save();
      return {'message': 'Payment was successfully updated!', 'id': pay.id.toString(), statusCode: 200, ok: true };
    } catch (error) {
      myLogger.error('Error updating payment: ' + (error as Error).message);
      return {'message': 'An error occurred while processing payment', statusCode: 500, ok: false };
    }
  },

  createPayment: async (_parent: any, {
    orderId,
    paymentMethod,
    currency,
    sellerAmount,
    dispatcherAmount,
      }: any, { req }: any) => {
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };

    try {
      const order = await Order.findById(orderId)
      if (!order) return {'message': 'Order not found'};
      if (order.buyerId.toString() !== (user._id as ObjectId).toString()) return {'message': 'Unauthorized', statusCode: 401, ok: false };
      if (!paymentMethods.includes(paymentMethod)) return {'message': 'payment method is not allowed', statusCode: 401, ok: false };
      if (!availableCurrency.includes(currency)) return {'message': 'currency not available for transaction', statusCode: 400, ok: false };
      if (sellerAmount < 0 || dispatcherAmount < 0) return {'message': 'Invalid amount', statusCode: 400, ok: false };
      const pay = new Payment({
        orderId,
        paymentMethod,
        currency,
        sellerAmount,
        dispatcherAmount
      });
      await pay.save();
      order.payment.push(pay.id);
      await order.save()

      return {'message': 'Payment was successfully created!', 'id': pay.id.toString(), statusCode: 201, ok: true };
    } catch (error) {
      myLogger.error('Error creating payment: ' + (error as Error).message);
      return  {'message': 'An error occurred while processing payment', statusCode: 500, ok: false };
    }
  },
}
