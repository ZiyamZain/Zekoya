import {configureStore} from '@reduxjs/toolkit';

import adminAuthReducer from '../features/adminAuth/authSlice'
import userAuthReducer from '../features/userAuth/userAuthSlice'
import adminUsersReducer from '../features/adminSide/adminUsers/usersSlice'
import adminCategoriesReducer from '../features/adminSide/categories/categorySlice'

import adminProductsReducer from '../features/adminSide/products/productSlice'
import productsReducer from '../features/products/productSlice'
import categoriesReducer from '../features/categories/categorySlice'

const store = configureStore({
    reducer:{
        adminAuth:adminAuthReducer,
        userAuth:userAuthReducer,
        adminUsers:adminUsersReducer,
        adminCategories:adminCategoriesReducer,
        adminProducts:adminProductsReducer,
        products: productsReducer,
        categories: categoriesReducer,
    }
})

export default store;