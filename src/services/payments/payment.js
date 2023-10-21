/* payment.js */
import Stripe from "stripe";
import config from "../../config/config.js";
import CartDao from "../../DAO/CartDao.js";
import ProductDao from "../../DAO/ProductDao.js";
import { logger } from "../../utils/logger.js";
import TicketDao from "../../DAO/TicketsDao.js";

const key = config.STRIPE_PRIVATE_KEY;
const manager = new CartDao();
const productManager = new ProductDao();
const ticketManager = new TicketDao();



export default class PaymentService {
    constructor() {
        this.stripe = new Stripe(key);
        this.productsToKeep = [];
        this.amount = [];
    }

    async createPaymentSession(cartId) {
        try {
            const cart = await manager.getCartsById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            const productsToPurchase = [];
            const productsToKeep = [];
            for (const cartItem of cart[0].cart) {
                const product = await productManager.getProductsById(cartItem.product._id);
                if (!product) {
                    productsToKeep.push(cartItem);
                    logger.info('NO se encontró el producto: ' + cartItem.product._id);
                    continue;
                }
                if (product.stock < cartItem.quantity) {
                    productsToKeep.push(cartItem);
                    logger.info('No queda STOCK del producto: ' + cartItem.product._id);
                    continue;
                }
                productsToPurchase.push(cartItem);
            }
            if (productsToPurchase.length === 0) {
                if (productsToKeep.length !== 0) {
                    return { status: "out_of_stock", msg: "La cantidad de el/los productos supera nuestro stock" };
                } else {
                    return { status: "error", msg: "No hay productos en su carrito" };
                }
            }else{
                // Creo una sesión de pago con Stripe Checkout
                const session = await this.stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: "payment",
                    line_items: productsToPurchase.map(cartItem => ({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: cartItem.product.title,
                            },
                            unit_amount: cartItem.product.price * 100, // En centavos
                        },
                        quantity: cartItem.quantity,
                    })),
                    payment_intent_data: {
                    },
                    success_url: `${config.DOMAIN}/api/carts/purchase/success`,
                    cancel_url: `${config.DOMAIN}/api/carts/purchase/cancel`
                    
                });
                return { sessionId: session};
            }
        } catch (error) {
            logger.error(error);
                throw error;
        }
    }

    async paymentCheckOut(cartId, purchaser) {
        try {
            const cart = await manager.getCartsById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            const productsToPurchase = [];
            const productsToKeep = [];
            for (const cartItem of cart[0].cart) {
                const product = await productManager.getProductsById(cartItem.product._id);
                if (!product) {
                    productsToKeep.push(cartItem);
                    logger.info('NO se encontró el producto: ' + cartItem.product._id);
                    continue;
                }
                if (product.stock < cartItem.quantity) {
                    productsToKeep.push(cartItem);
                    logger.info('No queda STOCK del producto: ' + cartItem.product._id);
                    continue;
                }
                product.stock -= cartItem.quantity;
                await product.save();
                productsToPurchase.push(cartItem);
            }
            if (productsToPurchase.length === 0) {
                logger.info('No hay productos para comprar');
                return { message: 'No hay productos para comprar' };
            }
            const amount = productsToPurchase.reduce(
                (acc, item) => acc + item.product.price * item.quantity,
                0
            );
            logger.info('AMOUNT' + amount);
            console.log("PURCHASER" + purchaser);
            const data = {
                purchaser: purchaser,
                amount: amount,
                productsToKeep: JSON.stringify(productsToKeep),
                cartId: cartId
            }
            // Genero el ticket 
            await ticketManager.creatTicket(amount, purchaser)
            // Actualizar el carrito con los productos que no se compraron
            await manager.pendingUpdate(cartId, productsToKeep);
            return { data: data};
        } catch (error) {
            logger.error(error);
            throw error;
        }
    }

}
