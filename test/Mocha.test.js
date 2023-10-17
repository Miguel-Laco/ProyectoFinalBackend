/* MochaProduct.test.js */
// Test de pruebas, utilizando mocha únicamente.
import mongoose from "mongoose";
import ProductDao from "../src/DAO/ProductDao.js"
import UserDao from "../src/DAO/UserDao.js";
import CartDao from "../src/DAO/CartDao.js";
import Assert from "assert";

const assert = Assert.strict;

describe("Testing Product DAO", () => {
    // Conectar la base de datos antes de las pruebas
    before( async function () {
        this.productDao = new ProductDao();
        await mongoose.connect("mongodb+srv://coder:F7717446B2@ecommerce.cmlx1ff.mongodb.net/ecommerce?retryWrites=true&w=majority");
        this.productID = "";
    })
    // Desconectar la base de datos después de las pruebas
    after(async function () {
        await mongoose.disconnect();
    });

    it("El DAO de poder crear un producto en la DB", async function() {
        let productTest = {
            title: "Test",
            description: "Test Product",
            code: "TEST",
            price: 1000,
            stock: 5,
            category: "Test Category",
            thumbnail: "./img/hacha.jpg",
        }
        const result = await this.productDao.addProduct(productTest.title, productTest.description, productTest.code, productTest.price, productTest.stock, productTest.category, productTest.thumbnail);
        this.productID = result._id.toString();
        assert.ok(result._id)
    })

    it("El DAO debe poder buscar un producto por el id", async function() {
        const result = await this.productDao.getProductsById(this.productID);
        assert.ok(result); // Verificar que result no sea null ni undefined
    });

    it("El DAO debe poder eliminar el producto de la DB", async function() {
        const result = await this.productDao.deleteProduct(this.productID);
        assert.ok(result.status)
    })
})


describe("Testing users DAO", () => {
    // Conectar la base de datos antes de las pruebas
    before( async function () {
        this.userDao = new UserDao();
        await mongoose.connect("mongodb+srv://coder:F7717446B2@ecommerce.cmlx1ff.mongodb.net/ecommerce?retryWrites=true&w=majority");
        this.ID = "";
    })
    // Desconectar la base de datos después de las pruebas
    after(async function () {
        await mongoose.disconnect();
    });

    it("El DAO de poder crear un usuario en la DB", async function() {
        let userPrueba = {
            first_name: "MockUser",
            last_name: "CoderHouse",
            age: 40,
            email: "JP@gmail.com",
            password: "123456"
        }
        const result = await this.userDao.createUser(userPrueba);
        assert.ok(result._id)
    })

    it("El DAO debe poder buscar un usuario por el mail", async function() {
        let userPrueba = {
            first_name: "MockUser",
            last_name: "CoderHouse",
            age: 40,
            email: "JP@gmail.com",
            password: "123456"
        }
        const result = await this.userDao.getByEmail(userPrueba.email);
        assert.strictEqual(result.email, userPrueba.email)
    });
    
    it("El DAO debe poder eliminar el usuario de la DB", async function() {
        let userPrueba = {
            first_name: "MockUser",
            last_name: "CoderHouse",
            age: 40,
            email: "JP@gmail.com",
            password: "123456"
        }
        const result = await this.userDao.deleteUser(userPrueba.email);
        assert.ok(result.status)
    })
})


describe("Testing Cart DAO", () => {
    // Conectar la base de datos antes de las pruebas
    before( async function () {
        this.cartDao = new CartDao();
        await mongoose.connect("mongodb+srv://coder:F7717446B2@ecommerce.cmlx1ff.mongodb.net/ecommerce?retryWrites=true&w=majority");
        this.cartID = "";
    })
    // Desconectar la base de datos después de las pruebas
    after(async function () {
        await mongoose.disconnect();
    });

    it("El DAO de poder crear un cart en la DB", async function() {
        const result = await this.cartDao.addCarts();
        this.cartID = result._id.toString();
        assert.ok(result._id)
    })

    it("El DAO debe poder buscar un cart por el id", async function() {
        const result = await this.cartDao.getCartsById(this.cartID);
        assert.ok(result[0]._id); // Verificar que result no sea null ni undefined
    });

    it("El DAO debe poder eliminar el cart de la DB", async function() {
        const result = await this.cartDao.cartDelete(this.cartID);
        assert.ok(result.status)
    })

})