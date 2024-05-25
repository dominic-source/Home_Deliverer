""" This module is used for to manage the categories
"""
from flask_server.views.v1 import app_views, protected_route, logger
from flask import request, jsonify, make_response, session
from flask_server.models import Order, Payment
from flask_server import db


@app_views.route('/payment', methods=['POST'], strict_slashes=False)
@protected_route
def create_payment():
    """This endpoint will delete a category"""
    try:
        payment_method = request.form.get('payment_method', None)
        seller_amount = request.form.get('seller_amount', None)
        dispatcher_amount = request.form.get('dispatcher_amount', None)
        currency = request.form.get('currency', None)
        order_id = request.form.get('order_id', None)

        user_id=session.get('user_id')
        order = Order.query.filter_by(id=order_id).one()
        if order.buyer_id != user_id:
            return jsonify({'message': 'You are not the buyer!'});
            
        payment = Payment(payment_method=payment_method,
                         seller_amount=seller_amount,
                         dispatcher_amount=dispatcher_amount,
                         currency=currency,
                         order_id=order_id
                         )
        order.payment.append(payment)
        db.session.add(payment)
        db.session.commit()
        return jsonify({'message': 'Payment has been created successfully'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error("Error occured:", exc_info=True)
        return jsonify({'error': 'An error occured!'}), 401


@app_views.route('/payments/<int:order_id>', methods=['GET'], strict_slashes=False)
@protected_route
def get_my_payments(order_id=None):
    """This endpoint will get my payments based on my order id"""
    try:
        if not order_id:
            return jsonify({'error': 'Category Id is required!'}), 401
        user_id = session.get('user_id')
        query = Order.query.filter(
            (Order.seller_id == user_id) |
            (Order.buyer_id == user_id) |
            (Order.dispatcher_id == user_id)
            ).filter_by(id=order_id).one()
        payments = query.payment
        if not payments:
            return jsonify({'message': 'No payment was found!'}), 401
        transaction = [{
            'Id': payment.id,
            'Currency': payment.currency,
            'Payment_method': payment.payment_method,
            'Payment_status': payment.payment_status,
            'Date': payment.last_update_time,
            'Amount': payment.total_amount if query.seller_id == user_id or
                                                query.buyer_id == user_id else payment.dispatcher_amount
            } for payment in payments]            
        return jsonify(transaction), 200
    except Exception as e:
        db.session.rollback()
        logger.error("Error occured:", exc_info=True)
        return jsonify({'error': 'An error occured!'}), 401

