import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User, IUser } from '@/models/user';
import { Product } from '@/models/product';
import { State, Country, Lga, Location } from '@/models/location';
import Category from '@/models/category';
import { redisClient } from '@/lib/initialize';
import { myLogger } from '@/app/api/upload/logger';
import { authRequest } from '@/app/api/datasource/user.data';
import { loginMe } from '@/app/api/datasource/user.data';
import _ from 'lodash';
import { NewArgs } from '@/app/lib/definitions';
import mongoose, { ObjectId } from 'mongoose';
import jwt  from 'jsonwebtoken';
import { MutationCreateUserArgs, MutationRegisterUserArgs, MutationForgotPasswordArgs, MutationUpdatePasswordArgs, QueryGetNewAccessTokenArgs } from '@/lib/graphql-types';
import { UserAlreadyExistsError, CountryNotFoundError, StateNotFoundError, LgaNotFoundError, UserNotFoundError, InvalidCredentialsError } from '@/app/lib/errors';


export const userQueryResolvers = {
  category: async (_parent: any, { id }: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    try {
      const categoryData = await Category.findById(id);
      return { categoryData, statusCode: response.status, ok: true };
    } catch (error) {
      myLogger.error('Error fetching category: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  categories: async (_parent: any, _: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    try {
      const categoriesData = await Category.find();
      return { categoriesData, statusCode: response.status, ok: true };
    } catch (error) {
      myLogger.error('Error fetching category: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  findFoods: async (_parent: any, { productName }: any, { req }: any) => {
    try {
      // find the product by their name
      // use the userId in the product model to find the user information
      // return the user information and the product information
      const productsData = await Product.find({ name: _.trim(productName) });
      if (!productsData) return { message: 'No product was found!', statusCode: 404, ok: false }
      // let foodsData = [];
      const foodsData = productsData.map(async (data) => {
        const user = await User.findById(data.userId);
        return {
          id: data._id,
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          userId: data.userId,
          username: user?.username,
          businessDescription: user?.businessDescription,
          products: user?.products,
          phoneNumber: user?.phoneNumber,
          email: user?.email,
          createdAt: data.createdAt,
          photo: data.photo,
          addressSeller: user?.addressSeller,
        };
      });
      return { foodsData, statusCode: 200, ok: true };
    } catch (error) {
      myLogger.error('Error fetching users: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  findRestaurants: async (_parent: any, { }: any, { req }: any) => {
    // data: name, image, id, altText, businessDescription
    try {
      const usersData = await User.find();

      return { usersData, statusCode: 200, ok: true };
    } catch (error) {
      myLogger.error('Error fetching users: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  getNewAccessToken: async (_parent: any, { refreshToken }: QueryGetNewAccessTokenArgs ) => {
    try {
      if (!refreshToken) {
        return { message: 'Refresh token is missing!', statusCode: 401, ok: false };
      }
      const verified = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY as string);
      if (!verified) {
        return { message: 'Refresh token is invalid!', statusCode: 401, ok: false };
      }
      const user = await User.findById((verified as any).userId);
      if (!user) {
        return { message: 'User not found!', statusCode: 404, ok: false };
      }
      if (!user.isLoggedIn) {
        return { message: 'User is not logged in!', statusCode: 401, ok: false };
      }
      const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY as string, { expiresIn: `${process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRES_IN}d` });
      return { token: accessToken, ok: true, statusCode: 200 };
    } catch (error) {
      myLogger.error('Error getting new access token: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  user: async (_parent: any, _: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };
    try {
      const userData = await User.findById((user._id as ObjectId).toString());
      return { userData, statusCode: response.status, ok: true };
    } catch (error) {
      myLogger.error('Error fetching user: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  users: async (_parent: any, _: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { isAdmin } = await response.json();
    if (!isAdmin) return { message: 'You need to be an admin to access this route!', statusCode: 403, ok: false };
    try {
      const usersData = await User.find();
      return { usersData, statusCode: 200, ok: true };
    } catch (error) {
      myLogger.error('Error fetching users: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },
}

export const userMutationResolvers = {
  createCategory: async (_parent: any, { name }: any, { req }: any) => {
    // authenticate user who must be an admin
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { isAdmin } = await response.json();
    if (!isAdmin) return { message: 'You need to be an admin to access this route!', statusCode: 403, ok: false };

    try {
      // trim leading and ending whitespaces if any
      name = _.trim(name);
      const listCategories = ['Consumable Products', 'Non-Consumable Products'];

      // Define the category format regex
      const categoryFormat = /^([\w\s]+)\|[\w\s]+\|[\w\s]+$/;

      // Validate category format
      if (!categoryFormat.test(name)) {
        return { message: 'Invalid category format', statusCode: 400, ok: false };
      }

      // Execute the regex and check if the result is not null
      const match = categoryFormat.exec(name);
      if (match && match[1]) {
        const mainName = match[1];
        if (!listCategories.includes(mainName)) {
          return { message: 'Invalid category name', statusCode: 400, ok: false };
        }
      } else {
        return { message: 'Invalid category format', statusCode: 400, ok: false };
      }

      // Check if category already exists
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return { message: 'Category already exists', statusCode: 400, ok: false };
      }

      // Create and save new category
      const category = new Category({ name });
      const categoryData = await category.save();
      return { categoryData, statusCode: 201, ok: true };

    } catch (error) {
      myLogger.error('Error creating category: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  createCategories: async (_parent: any, { name }: any, { req }: any) => {
    // authenticate user who must be an admin
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { isAdmin } = await response.json();
    if (!isAdmin) return { message: 'You need to be an admin to access this route!', statusCode: 403, ok: false };

    if (!Array.isArray(name)) {
      return { message: 'Name must be an array', statusCode: 400, ok: false };
    }
    if (name.length === 0) {
      return { message: 'Name cannot be empty', statusCode: 400, ok: false };
    }
    for (let singleName of name) {
      try {
        const listCategories = ['Consumable Products', 'Non-Consumable Products'];

        // Define the category format regex
        const categoryFormat = /^([\w\s]+)\|[\w\s]+\|[\w\s]+$/;

        // remove whitespaces from start and end of the string if any
        singleName = _.trim(singleName);

        // Validate category format
        if (!categoryFormat.test(singleName)) {
          return { message: 'Invalid category format', statusCode: 400, ok: false };
        }

        // Validate input
        const match = categoryFormat.exec(singleName);
        if (match && match[1]) {
          const mainName = match[1];
          if (!listCategories.includes(mainName)) {
            return { message: 'Invalid category name', statusCode: 400, ok: false };
          }
        } else {
          return { message: 'Invalid category format', statusCode: 400, ok: false };
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: singleName });
        if (existingCategory) {
          return { message: 'Category already exists', statusCode: 400, ok: false };
        }

        // Create and save new category
        const category = new Category({ name: singleName });
        await category.save();
      } catch (error) {
        myLogger.error('Error creating category: ' + (error as Error).message);
        return { message: 'An error occurred!', statusCode: 500, ok: false };
      }
    }
    return { 'message': 'Many categories have been created successfully!', ok: true, statusCode: 201 };
  },

  createUser: async (_parent: any, args: MutationCreateUserArgs, { req }: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        email,
        password,
        phoneNumber,
      } = args;

      // Check if email or phoneNumber is provided
      if (!email && !phoneNumber) {
        throw new InvalidCredentialsError();
      }

      // Check if email or phoneNumber is already taken
      let existingUser;
      if (email) {
        existingUser = await User.findOne({ email }).session(session);
      } else if (phoneNumber) {
        existingUser = await User.findOne({ phoneNumber }).session(session);
      } else {
        existingUser = null;
        throw new InvalidCredentialsError();
      }

      if (existingUser) {
        throw new UserAlreadyExistsError();
      }

      // Determine username
      let username;
      if (email) {
        username = _.trim(email);
      } else if (phoneNumber) {
        username = _.trim(phoneNumber);
      }

      // Create new user
      const newUser = new User({
        username: _.trim(username),
        email: email ? _.trim(email) : '',
        passwordHash: _.trim(password),
        phoneNumber: phoneNumber ? _.trim(phoneNumber) : '',
        isRegistered: false, // Set isRegistered to false
      });
      const userData = await newUser.save({ session });
      await session.commitTransaction();
      return { userData, statusCode: 201, ok: true, message: 'User has been registered successfully!' };
    } catch (error) {
      await session.abortTransaction();
      myLogger.error('Error creating user: ' + (error as Error).message);

      if (error instanceof UserAlreadyExistsError || error instanceof InvalidCredentialsError) {
        return { message: error.message, statusCode: 400, ok: false };
      }

      return { message: 'An error occurred while creating user', statusCode: 500, ok: false };
    } finally {
      session.endSession();
    }
  },

  registerUser: async (_parent: any, args: MutationRegisterUserArgs, { req }: any) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Authenticate user

      const response = await authRequest(req.headers.get('authorization'));
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const { user } = await response.json();
      if (!user) {
        throw new UserNotFoundError();
      }

      const {
        username,
        email,
        phoneNumber,
        userType,
        firstName,
        lastName,
        vehicleNumber,
        latitude,
        longitude,
        lga,
        state,
        country,
        address
      } = args;

      // Check if user exists
      const existingUser = await User.findById(user.id).session(session);
      if (!existingUser) {
        throw new UserNotFoundError();
      }

      // Check if user is already registered
      if (existingUser.isRegistered) {
        return { message: 'User is already registered!', statusCode: 400, ok: false };
      }

      // Ensure address, lga, state, and country are provided
      if (!address || !lga || !state || !country) {
        throw new Error('Address, LGA, state, and country are mandatory.');
      }

      // Find location
      let locationId: mongoose.Types.ObjectId | undefined;
      // Find country
      let countryDoc = await Country.findOne({ name: country }).session(session);
      if (!countryDoc) {
        throw new CountryNotFoundError();
      }

      // Find state
      let stateDoc = await State.findOne({ name: state, country: countryDoc._id }).session(session);
      if (!stateDoc) {
        throw new StateNotFoundError();
      }

      // Find lga
      let lgaDoc = await Lga.findOne({ name: lga, state: stateDoc._id }).session(session);
      if (!lgaDoc) {
        throw new LgaNotFoundError();
      }

      // Create location
      const location = new Location({
        name: `${address}, ${lga}, ${state}, ${country}`,
        longitude,
        latitude
      });
      const savedLocation = await location.save({ session });
      locationId = savedLocation._id as mongoose.Types.ObjectId;

      // Update user
      existingUser.firstName = _.trim(firstName);
      existingUser.lastName = _.trim(lastName);
      existingUser.username = _.trim(username);
      existingUser.email = existingUser.email ? existingUser.email: _.trim(email);
      existingUser.phoneNumber = existingUser.phoneNumber? existingUser.phoneNumber:_.trim(phoneNumber);
      if (userType && ["seller", "buyer", "dispatcher"].includes(userType)) {
        existingUser.userType = userType as IUser["userType"];
      }
      existingUser.vehicleNumber = vehicleNumber ? _.trim(vehicleNumber) : existingUser.vehicleNumber;
      existingUser.locations = locationId ? [locationId] : [];
      existingUser.isRegistered = true; // Set isRegistered to true

      const updatedUser = await existingUser.save({ session });
      await session.commitTransaction();
      return { userData: updatedUser, statusCode: 200, ok: true, message: 'User has been registered successfully!' };
    } catch (error) {
      await session.abortTransaction();
      myLogger.error('Error updating user: ' + (error as Error).message);

      if (error instanceof UserNotFoundError || error instanceof CountryNotFoundError || error instanceof StateNotFoundError || error instanceof LgaNotFoundError) {
        return { message: error.message, statusCode: 400, ok: false };
      }

      return { message: 'An error occurred while updating user', statusCode: 500, ok: false };
    } finally {
      session.endSession();
    }
  },

  deleteCategory: async (_parent: any, { id }: any, { req }: any) => {
    // authenticate user who must be an admin
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { isAdmin } = await response.json();
    if (!isAdmin) return { message: 'You need to be an admin to access this route!', statusCode: 403, ok: false };

    try {
      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return { message: 'Category not found', statusCode: 404, ok: false };

      }
      return { message: 'Category has been deleted successfully!', statusCode: 201, ok: true };
    } catch (error) {
      myLogger.error('Error deleting category: ' + (error as Error).message);
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  deleteUser: async (_parent: any, _: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };
    try {
      const delUser = await User.findByIdAndUpdate((user._id as ObjectId).toString(), { isDeleted: true });
      if (!delUser) return { message: 'Could not delete user!', statusCode: 500, ok: false }
    } catch (error) {
      myLogger.error('Error deleting user: ' + (error as Error).message);
      return { 'message': 'An error occurred!', statusCode: 500, ok: false };
    }
    return { message: 'User deleted successfully!', statusCode: 200, ok: true };
  },

  forgotPassword: async (_parent: any, { email }: MutationForgotPasswordArgs) => {
      try {
        email = _.trim(email);
        const user = await User.findOne({ email });
        if (!user) {
          return { message: 'User was not found!', statusCode: 404, ok: true };
        }

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const token = uuidv4() + uuidv4();
        const resetPasswordToken = `${token} ${expiryDate.toISOString()}`;

        const updated = await User.findByIdAndUpdate(user.id, { resetPasswordToken });
        if (!updated) {
          return { message: 'Could not update user!', statusCode: 500, ok: true };
        }
        const user_data = {
          id: user.id,
          to: email,
          subject: "Reset token for forgot password",
          token,
          uri: undefined,
        };
        if (!redisClient) {
          myLogger.error('Redis client is not connected!, cannot queue user data for forgotten password');
          return { message: 'An error occurred!', statusCode: 500, ok: true };
        }
        // Add data to the queue
        redisClient.lPush('user_data_queue', JSON.stringify(user_data));
        return { message: 'Get the reset token from your email', statusCode: 200, ok: true };
      } catch (error) {
        myLogger.error('Error changing password: ' + (error as Error).message);
        return { message: 'An error occurred!', statusCode: 500, ok: true };
      }
  },

  login: async (_parent: any, args: { email: string; password: string; }) => {
    const { email, password } = args;
    // Login logic using the RESTful API (already implemented)
    const loginResponse = await loginMe(email, password);
    if (!loginResponse.ok) {
      return { statusCode: loginResponse.statusCode, message: loginResponse.message, ok: loginResponse.ok };
    }

    const token = loginResponse.token;
    const refreshToken = loginResponse.refreshToken;
    
    return { message: 'User logged in successfully', token, statusCode: 200, ok: true, refreshToken };
  },

  logout: async (_parent: any, _: any, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };
  
    try {
      // Update the user information to be logged out
      const updated = await User.findByIdAndUpdate((user._id as ObjectId).toString(), { isLoggedIn: false });
      if (updated) return { 'message': 'Logged out successfully', statusCode: 200, ok: true };
      else return { 'message': 'Unable to logout user!', statusCode: 400, ok: false };
    } catch (error) {
      myLogger.error('Error logging out: ' + (error as Error).message)
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  updateUser: async (_parent: any, args: { firstName: any; lastName: any; username: any; email: any; phoneNumber: any; lgaId: any; vehicleNumber: any; userType: any; buyerStatus: any; sellerStatus: any; dispatcherStatus: any; }, { req }: any) => {
    // authenticate user
    const response = await authRequest(req.headers.get('authorization'));

    if (!response.ok) {
      throw new Error(response.statusText)
    }
    const { user, message, statusCode, ok } = await response.json();
    if (!user) return { message, statusCode, ok };
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        lgaId,
        vehicleNumber,
        userType,
        buyerStatus,
        sellerStatus,
        dispatcherStatus,
      } = args;
      const newArgs = {
        firstName,
        lastName,
        username,
        email,
        phoneNumber,
        lgaId,
        vehicleNumber,
        userType,
        buyerStatus,
        sellerStatus,
        dispatcherStatus,
      };

      // use map, filter, reduce, etc.
      const keys = Object.keys(newArgs);
      const filteredArgs = keys.reduce((acc: Partial<NewArgs>, key) => {
        if (newArgs[key as keyof NewArgs] !== undefined) {
          acc[key as keyof NewArgs] = newArgs[key as keyof NewArgs];
        }
        return acc;
      }, {});

      const updated = await User.findByIdAndUpdate((user._id as ObjectId).toString(), filteredArgs);
      if (updated) return { message: 'Updated successfully', statusCode: 200, ok: true };
      else return { message: 'An error occurred!', statusCode: 500, ok: false };
    } catch (error) {
      myLogger.error('Error updating user: ' + (error as Error).message)
      return { message: 'An error occurred!', statusCode: 500, ok: false };
    }
  },

  updatePassword: async (_parent: any, { email, password, token }: MutationUpdatePasswordArgs) => {
      try {
        email = _.trim(email);
        const user = await User.findOne({ email });
        if (!user) {
          return { message: 'User was not found!', statusCode: 404, ok: false };
        }

        const resetPasswordToken = user.resetPasswordToken;
        if (!resetPasswordToken) {
          return { message: 'Reset password token is missing!', statusCode: 401, ok: false };
        }

        const [storedToken, expiryDateStr] = resetPasswordToken.split(' ');
        const expiryDate = new Date(expiryDateStr);
        const presentDate = new Date();

        if (expiryDate <= presentDate) {
          return { message: 'Reset password token has expired!', statusCode: 401, ok: false };
        }

        if (token !== storedToken) {
          return { message: 'Invalid reset password token!', statusCode: 401, ok: false };
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(user.id, { passwordHash, resetPasswordToken: null });

        return { message: 'Password updated successfully', statusCode: 200, ok: true };
      } catch (error) {
        myLogger.error('Error updating password: ' + (error as Error).message);
        return { message: 'An error occurred!', statusCode: 500, ok: false };
      }
  },
}
