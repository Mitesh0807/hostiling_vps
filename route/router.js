const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadfile.js');
const { Product, Images, User, UserSession, Cart, Address, AdminCredentials, adjustedCart } = require('../model/model.js');
const { home, loginApi, addProduct, getProduct, addCart, addToCart, editProduct, address, order, paymentController, adminCredentialController, updateProductStatus } = require('../controller/controller.js');

router.get('/', home);
router.post('/login', loginApi);
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/DzH45UAgmoTeaWV2GK-YhQ7P40k-ALHxLYWyWcw3', upload.array('image'), addProduct);
router.get('/DzH45UAgmoTeaWV2GK-YhQ7P40k-ALHxLYWyWcw3', async (req, res) => {
        const { product_id } = req.params;
    const products = await Product.find().populate('images');
    res.render('add_product', { products, product_id });
});

router.post('/editproduct/:product_id', upload.array('image'), editProduct);

router.get('/get_product', (req, res) => {
    res.render('add_product');
});

router.post('/update_product_status/', updateProductStatus);


router.post('/add_cart/:product_id', addCart);
router.get('/add_cart/:product_id', async (req, res) => {
    const productId = req.params.product_id;
    const product = await Product.findById(productId);
    const productImage = await Images.find({ product });
    const imageUrls = productImage.map(image => image.image);
    const context = {
        id: product.id,
        name: product.name,
        size: product.size,
        color: product.color,
        images: imageUrls,
        brand: product.brand,
        offer: product.offer,
        mrp: product.mrp,
        price: product.price,
        created_at: product.created_at
    };
    const contextArray = [context]; // If you only have one product, you can still use an array with a single element
    res.render('cart', { context: contextArray });
});

router.post('/addtocart/:product_id', addToCart);
router.get('/addtocart/:product_id', (req, res) => {
    const { product_id } = req.params;
    res.render('address', { product_id });
});


router.post('/address/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;

        // Fetch product details
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Fetch product images
        const productImages = await Images.findOne({ product });

        // Fetch last cart details
        const cart = await Cart.findOne({ product: product }).sort({ createdAt: -1 }).exec();
        console.log(cart);

        const created_at = new Date(cart.created_at.getTime() + (3 * 24 * 60 * 60 * 1000));

        // Create a new adjustedCart object
        const adjustcart = new adjustedCart ({
            cart: cart._id,
            adjustedCreatedAt: created_at
        });

        // Save the adjustedCart object
        await adjustcart.save();

        const firstImage = productImages ? productImages.image : '';

        const context = [{
            id: product.id,
            name: product.name,
            size: product.size,
            color: product.color,
            brand: product.brand,
            image: firstImage,
            offer: product.offer,
            mrp: product.mrp,
            price: product.price,
            created_at : adjustcart.adjustedCreatedAt
        }];

        const { name, street, area, city, state } = req.body;
        const add_address = new Address({ product: product_id, name, street, area, city, state });
        await add_address.save();
        const discount = product.mrp - product.price;

        // Render the order page with context and additional data
        res.render('order', {
            context: context,
            address_name: name,
            street: street,
            area: area,
            city: city,
            state: state,
            price: product.price,
            product_id,
            discount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/address/:product_id', async (req, res) => {
    const productId = req.params.product_id;
    const product = await Product.findById(productId);
    const productImage = await Images.findOne({ product });
    const address  = await Address.findOne({ product }).sort({ created_at: -1 });
    let firstImage;
    if (productImage) {
        firstImage = productImage.image;
    }
    const context = {
        id: product.id,
        address_name: address.name,
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        name: product.name,
        size: product.size,
        color: product.color,
        image: firstImage,
        brand: product.brand,
        offer: product.offer,
        mrp: product.mrp,
        price: product.price,
        created_at: product.created_at
    };
    const discount = product.mrp - product.price;
    const contextArray = [context];
    const { product_id } = req.params;
    res.render('order', { context: contextArray, discount, product_id, address_name: address.name, street: address.street, area: address.area, state: address.state, city: address.city });
});


router.post('/order/:product_id', order);
router.get('/order/:product_id', async (req, res) => {
        const productId = req.params.product_id;
        const product = await Product.findById(productId);
        const price = product.price;
        const admincredentials = await AdminCredentials.find();

        let paytm_upi_id = '';
        let phonepe_upi_id = '';
        let gpay_upi_id = '';

        if (admincredentials.length > 0) {
            paytm_upi_id = admincredentials[0].paytm_upi_id;
            phonepe_upi_id = admincredentials[0].phonepe_upi_id;
            gpay_upi_id = admincredentials[0].gpay_upi_id;
        }

        res.render('payment', {
            price: price,
            paytm_upi_id: paytm_upi_id,
            phonepe_upi_id: phonepe_upi_id,
            gpay_upi_id: gpay_upi_id
        });
});

router.post('/payment', paymentController);
router.get('/payment', (req, res) => {
    res.render('payment');
});

router.post('/flNV8wTb98kvr05PNRX80STd8VxBobn0AJKCd6im', adminCredentialController);
router.get('/flNV8wTb98kvr05PNRX80STd8VxBobn0AJKCd6im', (req, res) => {
    res.render('upi');
});

module.exports = router;
