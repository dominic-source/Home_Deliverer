import chai from 'chai';
import sinon from 'sinon';
import fetch from 'node-fetch';
import { Product } from '../../models/product';
import { User } from '../../models/user';
import { productMutationResolver } from '../../resolver/products.resolver';
import { Types } from 'mongoose';

const expect = chai.expect;
const { stub, restore } = sinon;

describe('deleteProduct', function() {
  beforeEach(function() {
    // stud authRequest
    stub(fetch, 'default').resolves({
      ok: true,
      json: stub().returns({
        user: {
          _id: new Types.ObjectId(),
        },
        isAdmin: true
      }),
      status: 200
    });
  });

  afterEach(function() {
    restore();
  });

  it('should delete a product', async function() {
    const productId = new Types.ObjectId();
    const user = {
      id: new Types.ObjectId(),
      products: [productId],
      save: stub().resolves(),
      populate: stub().resolvesThis()
    };
    const product = {
      _id: productId,
      name: 'Product 1',
      description: 'Product 1 description',
      price: 100,
      currency: 'Dollar',
      categoryId: new Types.ObjectId()
    };
    const findByIdStub = stub(User, 'findById').returns(user);
    const findByIdProductStub = stub(Product, 'findByIdAndDelete').resolves(product);
    const result = await productMutationResolver.deleteProduct(
        null, 
        {
            id: productId.toString()
        },
        { req: {
          headers: {
           authorization: "fakeString"
          } 
         }
        });
    expect(result).to.deep.equal({ 'message': 'Successfully deleted!', statusCode: 200, ok: true });
    expect(findByIdStub.calledOnce).to.be.true;
    expect(findByIdProductStub.calledOnce).to.be.true;
  });

  it('should return an error message if the product does not exist', async function() {
    const productId = new Types.ObjectId();
    const user = {
      id: new Types.ObjectId(),
      products: [],
      save: stub().resolves(),
      populate: stub().resolvesThis()
    };
    const findByIdStub = stub(User, 'findById').returns(user);
    const result = await productMutationResolver.deleteProduct(
        null, 
        {
            id: productId.toString()
        },
        { req: {
          headers: {
           authorization: "fakeString"
          } 
         }
        });
    expect(result).to.deep.equal({ 'message': 'This Product does not exist for this user!', statusCode: 404, ok: false });
    expect(findByIdStub.calledOnce).to.be.true;
  });

  it('should return an error message if the product could not be deleted', async function() {
    const productId = new Types.ObjectId();
    const user = {
      id: new Types.ObjectId(),
      products: [productId],
      save: stub().resolves(),
      populate: stub().resolvesThis()
    };
    const findByIdStub = stub(User, 'findById').returns(user);
    const findByIdProductStub = stub(Product, 'findByIdAndDelete').resolves(null);
    const result = await productMutationResolver.deleteProduct(
        null, 
        {
            id: productId.toString()
        },
        { req: {
          headers: {
           authorization: "fakeString"
          } 
         }
    });
    expect(result).to.deep.equal({ 'message': 'Could not delete product!', statusCode: 401, ok: false });
    expect(findByIdStub.calledOnce).to.be.true;
    expect(findByIdProductStub.calledOnce).to.be.true;
  });

  it('should return an error message if an exception occurs', async function() {
    const productId = new Types.ObjectId();
    const user = {
      id: new Types.ObjectId(),
      products: [productId],
      save: stub().resolves(),
      populate: stub().throws()
    };
    const findByIdStub = stub(User, 'findById').returns(user);
    const result = await productMutationResolver.deleteProduct(
        null, 
        {
            id: productId.toString()
        },
        { req: {
          headers: {
           authorization: "fakeString"
          } 
         }
        });
    expect(result).to.deep.equal({ 'message': 'An error occurred!', statusCode: 500, ok: false });
    expect(findByIdStub.calledOnce).to.be.true;
  });
});
