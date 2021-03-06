const express = require('express');
const cartsRepo = require('../repositories/carts');
const productsRepo = require('../repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// receive post request add item to cart
router.post('/cart/products', async (req, res) => {
    //figure out the cart
    let cart;
    if (!req.session.cartId) {
        //we dont have a cart
        //we need to create one
        //then store cart id on req.session.cartId prop
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    } else {
        //we have a cart
        //get it from repo
        cart = await cartsRepo.getOne(req.session.cartId);
    }

    const existingItem = cart.items.find(item => item.id === req.body.productId);
    if(existingItem) {
        //either increment quantity
        existingItem.quantity++;

    } else {
        //or add new product
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }

    await cartsRepo.update(cart.id, {
        items: cart.items
    });
           

    res.redirect('/cart');
});

// receieve get request to show all items in cart
router.get('/cart', async (req, res) => {
    if(!req.session.cartId) {
        return res.redirect('/');
    }

    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        //item === { id: , quanitity: }
        const product = await productsRepo.getOne(item.id);
        
        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }));
});

router.post('/cart/products/delete', async (req, res) => {
   const { itemId } = req.body;
   const cart = await cartsRepo.getOne(req.session.cartId);

   const items = cart.items.filter(item => item.id !== itemId);

   await cartsRepo.update(req.session.cartId, { items });
   res.redirect('/cart');
});

//receive post request to delete

module.exports = router;