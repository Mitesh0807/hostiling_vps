const { Product, Images, User, UserSession, Cart, Address, AdminCredentials } = require('../model/model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/uploadfile.js');

const home = async (req, res) => {
    try {
        const products = await Product.find({ is_show: true }).populate('images');
        return res.render('index', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const loginApi = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const { username, email, password } = req.body;

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user
            const user = new User({ username, email, password: hashedPassword });
            await user.save();

            // Generate JWT token
            const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });

            // Create a new user session
            const userSession = new UserSession({ user: user.id, token });
            await userSession.save();

            // Set the cookie
            res.cookie('jwt', token, { httpOnly: true });

            console.log('cookie', req.cookies);

            // Send the token in the response
            res.render('add_product');
        } else {
            res.render('login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const addProduct = async (req, res) => {
    try {
        // Get the value of the 'jwt' cookie
        // Check if the 'jwt' cookie exists
        // Cookie exists, proceed with adding the product
        if (req.method === 'POST') {
            const { name, color, offer, mrp, price, brand } = req.body;
            let { size } = req.body;

            // Convert size to an array of integers if it's a string
            if (typeof size === 'string') {
                // Split the string into an array
                size = size.split(',');

                // Convert each element to a number if it's a valid number
                size = size.map(element => {
                    const num = Number(element);
                    return isNaN(num) ? element : num; // If not a valid number, keep it as a string
                });
            }


            // Multer middleware has saved the files to 'public/images' directory
            const images = req.files;
            console.log(images);

            // Add product and images to the database
            const product = new Product({ name, size, color, offer, mrp, price, brand });
            await product.save();

            for (const image of images) {
                const productImage = new Images({ product: product, image: image.filename });
                await productImage.save();
            }

            return res.redirect('/DzH45UAgmoTeaWV2GK-YhQ7P40k-ALHxLYWyWcw3');
        } else {
            const products = await Product.find().populate('images');
            console.log(products);
            return res.render('product', { products });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const editProduct = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const { product_id, name, color, offer, mrp, price, brand } = req.body;
            console.log(name);  
            let { size } = req.body;

            if (typeof size === 'string') {
                size = size.split(',');
                size = size.map(element => {
                    const num = Number(element);
                    return isNaN(num) ? element : num;
                });
            }

            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            product.name = name;
            product.size = size;
            product.color = color;
            product.offer = offer;
            product.mrp = mrp;
            product.price = price;
            product.brand = brand;

            const images = req.files;
            if (images && images.length > 0) {
                await Images.deleteMany({ product: product_id });

                for (const image of images) {
                    const productImage = new Images({ product: product._id, image: image.filename });
                    await productImage.save();
                }
            }

            await product.save();

            return res.redirect('/add_product'); // Assuming you want to redirect to this route after editing
        } else {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getProduct = async (req, res) => {
    try {
        const products = await Product.find({ is_show: true });
        console.log(products);
        res.render('enroll/index.html', { products });
    } catch (error) {
        // Handle error appropriately
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const updateProductStatus = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const { product_id, is_show, size } = req.body;
            const product = await Product.findById(product_id);

            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }

            // No need to convert size to an array of numbers
            product.size = size;

            product.is_show = is_show === 'true';
            await product.save();

            // Return a JSON response indicating success
            return res.status(200).json({ message: 'Product status updated successfully' });
        } else {
            // Return a JSON response indicating success
            return res.status(200).json({ message: 'Request received successfully' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



const addCart = async (req, res) => {
    try {
        const { product_id } = req.params;

        // Fetch product details
        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Fetch all product images
        const productImages = await Images.find({ product });

        // Extract image URLs from productImages array
        const imageUrls = productImages.map(image => image.image);

        // Construct context object
        const context = {
            id: product.id,
            name: product.name,
            size: product.size,
            color: product.color,
            images: imageUrls, // Pass array of image URLs
            brand: product.brand,
            offer: product.offer,
            mrp: product.mrp,
            price: product.price,
            created_at: product.created_at
        };

        res.render('cart', { context, size_array: product.size });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const addToCart = async (req, res) => {
    try {
        const { product_id } = req.params;
        const product = await Product.findById(product_id);
        console.log(product);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const cart = new Cart({ product: product_id });
        await cart.save();

        return res.render('address', { product_id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const address = async (req, res) => {
    try {
        const { product_id } = req.params;

        const product = await Product.findById(product_id);

        const productImages = await Images.findOne({ product });

        let firstImage = '';
        if (productImages) {
            firstImage = productImages.image;
        }

        // Fetch last cart details
        const lastCart = await Cart.findOne({
            where: { product_id },
            order: [['created_at', 'DESC']]
        });

        const newCreatedAt = lastCart ? new Date(lastCart.created_at.getTime() + (3 * 24 * 60 * 60 * 1000)) : null;

        // Prepare context array
        const context = [];

        // Push the product details into context array
        context.push({
            id: product.id,
            name: product.name,
            size: product.size,
            color: product.color,
            brand: product.brand,
            image: firstImage,
            offer: product.offer,
            mrp: product.mrp,
            price: product.price,
            created_at: newCreatedAt
        });

        const discount = product.mrp - product.price;
        const deliveryBy = new Date(product.created_at.getTime() + (3 * 24 * 60 * 60 * 1000));

        res.render('order', { context, price: product.price, product_id, discount, delivery_by: deliveryBy });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const order = async (req, res) => {
    try {
        let context = [];
        const { product_id } = req.params;

        const product = await Product.findById(product_id);
        const product_image = await Images.findOne({ product });

        let first_image = '';
        if (product_image.length > 0) {
            first_image = product_image[0].image;
        }

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

        context.push({
            id: product._id,
            name: product.name,
            size: product.size,
            color: product.color,
            brand: product.brand,
            image: first_image,
            price: product.price,
        });

        res.render('payment', {
            context: context,
            price: price,
            paytm_upi_id: paytm_upi_id,
            phonepe_upi_id: phonepe_upi_id,
            gpay_upi_id: gpay_upi_id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

const paymentController = async (req, res) => {
    try {
        // Your logic here
        // For now, let's assume you're rendering a template like in Django
        res.render('payment');
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const adminCredentialController = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const { paytm_upi_id, phonepe_upi_id, gpay_upi_id } = req.body;
            console.log("Paytm UPI ID:", paytm_upi_id);

            // Check if data already exists in AdminCredentials model
            let existingCredentials = await AdminCredentials.findOne();

            if (existingCredentials) {
                // If data exists, delete old data
                await AdminCredentials.deleteMany();
            }

            // Save form data to database
            const adminCredential = new AdminCredentials({
                paytm_upi_id,
                phonepe_upi_id,
                gpay_upi_id
            });
            console.log(paytm_upi_id);
            await adminCredential.save();

            // Redirect to the '/upi' page after saving data
            return res.render('upi');
        } else {
            // Render the 'upi' page for GET requests
            return res.render('upi');
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send('Internal Server Error'); // Return 500 status for internal server error
    }
};

module.exports = {
    home,
    loginApi,
    addProduct,
    getProduct,
    addCart,
    addToCart,
    address,
    order,
    paymentController,
    adminCredentialController,
    updateProductStatus,
    editProduct
};