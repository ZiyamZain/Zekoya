import {configureStore} from '@reduxjs/toolkit';

import adminAuthReducer from '../features/adminAuth/authSlice'
import userAuthReducer from '../features/userAuth/userAuthSlice'
import adminUsersReducer from '../features/adminSide/adminUsers/usersSlice'
import adminCategoriesReducer from '../features/adminSide/categories/categorySlice'

import adminProductsReducer from '../features/adminSide/products/productSlice'
import productsReducer from '../features/products/productSlice'
import categoriesReducer from '../features/categories/categorySlice'
import userProfileReducer from '../features/userProfile/userProfileSlice'
import cartReducer from '../features/cart/cartSlice'
import wishlistReducer from '../features/wishlist/wishlistSlice'
import orderReducer from '../features/order/orderSlice'
import adminOrderReducer from '../features/adminOrder/adminOrderSlice'
import couponReducer from '../features/coupons/couponSlice';
import adminCouponReducer from '../features/adminSide/coupons/adminCouponSlice';
import paymentReducer from '../features/payment/paymentSlice';

// Import offer reducers
import categoryOfferReducer from '../features/adminSide/offers/categoryOfferSlice';
import productOfferReducer from '../features/adminSide/offers/productOfferSlice';
import referralOfferReducer from '../features/adminSide/offers/referralOfferSlice';
import offerReducer from '../features/offers/offerSlice';
import reportReducer from '../features/report/reportSlice';


const store = configureStore({
    reducer:{
        adminAuth:adminAuthReducer,
        userAuth:userAuthReducer,
        adminUsers:adminUsersReducer,
        adminCategories:adminCategoriesReducer,
        adminProducts:adminProductsReducer,
        products: productsReducer,
        categories: categoriesReducer,
        userProfile:userProfileReducer,
        cart:cartReducer,
        wishlist:wishlistReducer,
        order: orderReducer,
        adminOrder: adminOrderReducer,
        coupon:couponReducer,
        adminCoupon: adminCouponReducer,
        payment: paymentReducer,
        categoryOffer: categoryOfferReducer,
        productOffer: productOfferReducer,
        referralOffer: referralOfferReducer,
        offer: offerReducer,
        report: reportReducer,
    }
})

export default store;