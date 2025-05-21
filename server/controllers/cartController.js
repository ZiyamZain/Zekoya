import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

import Wishlist from '../models/wishListModel.js';



export const getCart = async(req,res) =>{
    try{
        let cart = await Cart.findOne({user:req.user._id})
            .populate({
                path:"items.product",
                select:"name price images isListed sizes category",
                populate:{
                    path:"category",
                    select:"name isListed",
                }
            })
        
        if(!cart){
            cart = await Cart.create({user:req.user._id , items:[]})
        }

        // Instead of filtering out unavailable items, mark them as unavailable
        // so the user can see which items are no longer available
        let hasUnavailableItems = false;
        
        // First pass: Mark items with unavailable products or categories
        cart.items.forEach(item => {
            if (!item.product) {
                item.isAvailable = false;
                item.unavailableReason = 'Product no longer exists';
                hasUnavailableItems = true;
            } else if (!item.product.isListed) {
                item.isAvailable = false;
                item.unavailableReason = 'Product is no longer available';
                hasUnavailableItems = true;
            } else if (!item.product.category) {
                item.isAvailable = false;
                item.unavailableReason = 'Product category no longer exists';
                hasUnavailableItems = true;
            } else if (!item.product.category.isListed) {
                item.isAvailable = false;
                item.unavailableReason = 'Product category is no longer available';
                hasUnavailableItems = true;
            } else {
                // Check if the selected size is still available
                const sizeObj = item.product.sizes.find(s => s.size === item.size);
                if (!sizeObj) {
                    item.isAvailable = false;
                    item.unavailableReason = 'Selected size is no longer available';
                    hasUnavailableItems = true;
                } else if (sizeObj.stock === 0) {
                    item.isAvailable = false;
                    item.unavailableReason = 'Selected size is out of stock';
                    hasUnavailableItems = true;
                } else if (sizeObj.stock < item.quantity) {
                    // If stock is less than quantity, update quantity to available stock
                    item.quantity = sizeObj.stock;
                    item.isAvailable = true;
                    item.stockReduced = true;
                    hasUnavailableItems = true;
                } else {
                    item.isAvailable = true;
                    item.unavailableReason = null;
                }
            }
        });
        
        await cart.save();
        
        // Return cart with availability information
        res.status(200).json({
            cart,
            hasUnavailableItems
        });
    }catch(error){
        console.error('Error fetching cart:', error);
        res.status(500).json({message:"Error fetching cart"});
    }
    
}


export const addToCart = async(req,res) =>{

    try{
        const {productId,size,quantity} = req.body;

        if(!productId || !size ||!quantity){
            return res.status(400).json({message:"product id , sizes and quantity are required!"});
        }

        const product = await Product.findById(productId).populate('category');
        if(!product){
            return res.status(404).json({message:"Product not found!"});
        }

         if (!product.isListed) {
      return res.status(400).json({ message: "Product is not available" });
    }

    if (!product.category || !product.category.isListed) {
      return res.status(400).json({ message: "Product category is not available" });
    }

    const sizeObj = product.sizes.find(s => s.size === size);
    if(!sizeObj){
        return res.status(400).json({message:"selected size is not available"});
    }

    if(sizeObj.stock < quantity){
        return res.status(400).json({message:"Not enough stock available"});

    }

    let cart = await Cart.findOne({user:req.user._id});
    if(!cart){
        const newCart = await Cart.create({
            user:req.user._id,
            items:[{product:productId, size, quantity}]
        });

        return res.status(201).json({message:"Item added to cart",cart:newCart});
    }
    
    // Check if the product with the same size is already in the cart
    const existingItem = cart.items.find(item => 
        item.product.toString() === productId && item.size === size
    );
    
    if (existingItem) {
        return res.status(400).json({
            message: "This product is already in your cart",
            errorType: "duplicateItem",
            existingItem: existingItem._id
        });
    }

    
    const existingItemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId && item.size === size
    );

    if(existingItemIndex > -1){
        const newQuantity = cart.items[existingItemIndex].quantity + parseInt(quantity);

        if(newQuantity > sizeObj.stock){
            return res.status(400).json({message:"Cannot add more items. Maximum available stock reached"});
        }

        cart.items[existingItemIndex].quantity = newQuantity;
    }else{
        //add new item if it doesnt exist
        cart.items.push({
            product:productId,
            size:size,
            quantity:quantity,
        })
    }
    
    await cart.save();

    const wishlist =await Wishlist.findOne({user:req.user._id});
    if(wishlist && wishlist.products.includes(productId)){
        wishlist.products = wishlist.products.filter( p => p.toString() !==productId);
        await wishlist.save();
    }

    //populate prouduct details before returning

    await cart.populate({
        path:"items.product",
        select:"name price images isListed sizes category",
        populate:{
            path:"category",
            select:"name isListed"
        }
    });
    
    // Check for unavailable items
    let hasUnavailableItems = false;
    cart.items.forEach(item => {
        if (!item.product || !item.product.isListed || !item.product.category || !item.product.category.isListed) {
            item.isAvailable = false;
            item.unavailableReason = !item.product ? 'Product no longer exists' : 
                                    !item.product.isListed ? 'Product is no longer available' : 
                                    !item.product.category ? 'Product category no longer exists' : 
                                    'Product category is no longer available';
            hasUnavailableItems = true;
        } else {
            const sizeObj = item.product.sizes.find(s => s.size === item.size);
            if (!sizeObj) {
                item.isAvailable = false;
                item.unavailableReason = 'Selected size is no longer available';
                hasUnavailableItems = true;
            } else if (sizeObj.stock === 0) {
                item.isAvailable = false;
                item.unavailableReason = 'Selected size is out of stock';
                hasUnavailableItems = true;
            } else if (sizeObj.stock < item.quantity) {
                item.quantity = sizeObj.stock;
                item.isAvailable = true;
                item.stockReduced = true;
                hasUnavailableItems = true;
            } else {
                item.isAvailable = true;
                item.unavailableReason = null;
            }
        }
    });
    
    await cart.save();
    
    res.status(200).json({
        cart,
        hasUnavailableItems
    });



}catch(error){
    console.error("Error adding to cart",error);
    res.status(500).json({message:"Error adding to cart"});
}
};


export const updateCartItemQuantity = async(req,res) =>{
    try{
        const {itemId, quantity} = req.body;

        if(!itemId || !quantity){
            return res.status(400).json({message:"Item id and quantity are required"});
        }

        const cart = await Cart.findOne({user:req.user._id});
        if(!cart){
            return res.status(404).json({message:"Cart not found"});
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if(itemIndex === -1){
            return res.status(404).json({message:"Item not found"});
        }
        
        // First, validate if the requested quantity is valid
        const cartItem = cart.items[itemIndex];
        
        // Populate the cart item to get product details
        await cart.populate({
            path:'items.product',
            select:'name price images isListed sizes category',
            populate:{
                path:'category',
                select:'name isListed',
            }
        });
        
        const product = cartItem.product;
        
        // Check if product exists and is available
        if (!product) {
            return res.status(400).json({
                message: "Product no longer exists",
                errorType: "availability"
            });
        }
        
        if (!product.isListed) {
            return res.status(400).json({
                message: "Product is no longer available",
                errorType: "availability"
            });
        }
        
        if (!product.category || !product.category.isListed) {
            return res.status(400).json({
                message: "Product category is no longer available",
                errorType: "availability"
            });
        }
        
        // Check size availability
        const size = cartItem.size;
        const sizeObj = product.sizes.find(s => s.size === size);
        
        if (!sizeObj) {
            return res.status(400).json({
                message: "Selected size is no longer available",
                errorType: "availability"
            });
        }
        
        if (sizeObj.stock === 0) {
            return res.status(400).json({
                message: "Selected size is out of stock",
                errorType: "stock"
            });
        }
        
        // Check for global maximum quantity limit (10 items per product)
        const MAX_QUANTITY_PER_ITEM = 10;
        
        if (quantity > MAX_QUANTITY_PER_ITEM) {
            return res.status(400).json({
                message: `You can add maximum ${MAX_QUANTITY_PER_ITEM} items of the same product`,
                errorType: "maxQuantityLimit",
                maxQuantity: MAX_QUANTITY_PER_ITEM
            });
        }
        
        // Check if requested quantity exceeds available stock
        if (quantity > sizeObj.stock) {
            return res.status(400).json({
                message: `Maximum available quantity is ${sizeObj.stock}`,
                errorType: "maxQuantity",
                maxQuantity: sizeObj.stock
            });
        }
        
        // If all validations pass, update the quantity
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        
        // Validate availability of all items in the cart
        let hasUnavailableItems = false;
        
        cart.items.forEach(item => {
            if (!item.product) {
                item.isAvailable = false;
                item.unavailableReason = 'Product no longer exists';
                hasUnavailableItems = true;
            } else if (!item.product.isListed) {
                item.isAvailable = false;
                item.unavailableReason = 'Product is no longer available';
                hasUnavailableItems = true;
            } else if (!item.product.category) {
                item.isAvailable = false;
                item.unavailableReason = 'Product category no longer exists';
                hasUnavailableItems = true;
            } else if (!item.product.category.isListed) {
                item.isAvailable = false;
                item.unavailableReason = 'Product category is no longer available';
                hasUnavailableItems = true;
            } else {
                // Check if the selected size is still available
                const sizeObj = item.product.sizes.find(s => s.size === item.size);
                if (!sizeObj) {
                    item.isAvailable = false;
                    item.unavailableReason = 'Selected size is no longer available';
                    hasUnavailableItems = true;
                } else if (sizeObj.stock === 0) {
                    item.isAvailable = false;
                    item.unavailableReason = 'Selected size is out of stock';
                    hasUnavailableItems = true;
                } else if (sizeObj.stock < item.quantity) {
                    // If stock is less than quantity, update quantity to available stock
                    item.quantity = sizeObj.stock;
                    item.isAvailable = true;
                    item.stockReduced = true;
                    hasUnavailableItems = true;
                } else {
                    item.isAvailable = true;
                    item.unavailableReason = null;
                    item.stockReduced = false;
                }
            }
        });
        
        await cart.save();
        
        // Return cart with availability information
        res.status(200).json({
            cart,
            hasUnavailableItems
        });
        
    }catch(error){
        console.error('Error updating cart items',error);
        res.status(500).json({message:"Error updating cart items"});
    }
}

export const removeFromCart = async(req,res) =>{
    try{
        const {itemId} = req.params;
        
        if(!itemId){
            return res.status(400).json({message:"Item id is required"})
        }
        
        const cart = await Cart.findOne({user:req.user._id});
        if(!cart){
            return res.status(404).json({message:"Cart not found"})
        }

        cart.items = cart.items.filter( item => item._id.toString()!==itemId);
        await cart.save();

        await cart.populate({
            path:'items.product',
            select:'name price images isListed sizes category',
            populate:{
                path:'category',
                select:'name isListed',
            }
        });
        
        // Check for any unavailable items after removal
        let hasUnavailableItems = false;
        
        cart.items.forEach(item => {
            if (!item.product) {
                item.isAvailable = false;
                item.unavailableReason = 'Product no longer exists';
                hasUnavailableItems = true;
            } else if (!item.product.isListed) {
                item.isAvailable = false;
                item.unavailableReason = 'Product is no longer available';
                hasUnavailableItems = true;
            } else if (!item.product.category) {
                item.isAvailable = false;
                item.unavailableReason = 'Product category no longer exists';
                hasUnavailableItems = true;
            } else if (!item.product.category.isListed) {
                item.isAvailable = false;
                item.unavailableReason = 'Product category is no longer available';
                hasUnavailableItems = true;
            } else {
                // Check if the selected size is still available
                const sizeObj = item.product.sizes.find(s => s.size === item.size);
                if (!sizeObj) {
                    item.isAvailable = false;
                    item.unavailableReason = 'Selected size is no longer available';
                    hasUnavailableItems = true;
                } else if (sizeObj.stock === 0) {
                    item.isAvailable = false;
                    item.unavailableReason = 'Selected size is out of stock';
                    hasUnavailableItems = true;
                } else if (sizeObj.stock < item.quantity) {
                    // If stock is less than quantity, update quantity to available stock
                    item.quantity = sizeObj.stock;
                    item.isAvailable = true;
                    item.stockReduced = true;
                    hasUnavailableItems = true;
                } else {
                    item.isAvailable = true;
                    item.unavailableReason = null;
                    item.stockReduced = false;
                }
            }
        });
        
        await cart.save();
        
        res.status(200).json({
            cart,
            hasUnavailableItems
        });
    }catch(error){
        console.error("Error removing item from cart",error);
        res.status(500).json({message:"Error removing item from cart"});
    }
}
