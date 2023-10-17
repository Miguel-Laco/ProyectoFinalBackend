/* Supertest.test.js */
import chai from 'chai'
import supertest from 'supertest'
import { faker } from '@faker-js/faker'
import ProductDao from '../src/DAO/ProductDao.js'
import UserDao from '../src/DAO/UserDao.js'
import CartDao from '../src/DAO/CartDao.js'
import mongoose from "mongoose"; //Importo Mongoose, porque al final voy a usar el DAO para borrar el usuario, el cart y producto creado.
import Assert from "assert";


const expect = chai.expect
const requester = supertest("http://localhost:8080")
const assert = Assert.strict;
let superCookie = "";   //Genero una variable para almacenar la cookie luego
let newProductID = "";  //Genero una variable para almacenar el ID del nuevo producto, para poder borrarlo al final
let productID = "";     //Genero una variable para almacenar el ID del producto que luego agregaré al carrito creado
let userEmail = "";     //Genero una variable para almacenar el email del nuevo user, usarlo luego
let cartID = "";        //Genero una variable para almacenar el ID del nuevo cart, para poder borrarlo al final
let userID = "";


describe("Supertest de mis Routers", ()=> {
    /* Creo un usuario de prueba con faker */
    const mockUser = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({max: 80}),
        password: '123456',
        role: "premium"
    }
    userEmail = mockUser.email  //Almaceno el email del usuario de prueba
    
    describe("Registro y Login", () => {
        it("Endpoint POST /api/sessions/register, debe registrar un usuario", async () => {
            const response = await requester.post("/api/sessions/register").send(mockUser);
            expect(response.status).to.equal(200); //valido que haya tenido éxito
            /* No puedo hacer otra validación, por estar usando handlebars */
        })
        it("ndpoint POST /api/sessions/login, debe loguear el nuevo usuario", async () => {
            const response = await requester.post("/api/sessions/login").send({
                email: mockUser.email,
                password: mockUser.password
            })
            expect(response.status).to.equal(302); //Valido 302 en vez de 200, porque mi login redirige a products
            const authTokenCookie = await response.headers['set-cookie'].find(cookie => cookie.startsWith('authToken')); //Busco la cookie generada y la almaceno
            expect(authTokenCookie).to.not.be.undefined; //Valido que se haya generado una cookie
            /* Extraigo el valor de la cookie "authToken" */
            let cookie = {
                name: authTokenCookie.split('=')[0],
                value: authTokenCookie.split('=')[1].split(';')[0]
            }
            expect(cookie.name).to.be.ok.and.eql('authToken'); //Valido en nombre de la cookie
            expect(cookie.value).to.be.ok;  //Valido que tenga un valor
            superCookie = cookie.value; //Almaceno el valor de la cookie
            
             // Busco una cookie que genere solo para traer el UserId hasta acá
            const userIDCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('UserID'));
            if (userIDCookie) {
                userID = decodeURIComponent(userIDCookie.split('%22')[1].split('%22')[0]); //Lo almaceno para luego enviarlo a upload
            }

        })
        it("Endpoint GET /api/sessions/profile, debe mostrar el perfil del usuario", async () => {
            const response = await requester.get("/api/sessions/profile")
            .set("Cookie", `authToken=${superCookie}`); //Envío la cookie para la ruta protegida
            expect(response.status).to.equal(200);  //valido que haya tenido éxito
            /* No puedo hacer otra validación, por estar usando handlebars */
        })
        it("Endpoint POST /api/users/uid/documents, debe subir 5 files", async () => {
            const response = await requester.post(`/api/users/${userID}/documents`)
            .attach("profiles", "./test/filesTest/Foto de perfil.JPG")
            .attach("products", "./test/filesTest/productos.JPG")
            .attach("identification", "./test/filesTest/Identificacion.txt")
            .attach("proofOfAddress", "./test/filesTest/domicilio.txt")
            .attach("bankStatement", "./test/filesTest/estado de cuenta.txt")
            expect(response.status).to.equal(200);  //valido que haya tenido éxito
        })
        it("Endpoint GET /api/users/premium, cambia el rol del nuevo usuario a premium", async () => {
            const response = await requester.get(`/api/users/premium/${userEmail}`);
            expect(response.status).to.be.equal(200); //valido que haya tenido éxito
            /* No puedo hacer otra validación, por estar usando handlebars */
        })
    })

    describe("Test de Products", () => {
        it("Endpoint POST /api/products, debe crear un producto", async () => {
            /* Genero un producto de prueba con Faker */
            const response = await requester.post(`/api/products`).send({
                title: faker.commerce.product(),
                description: faker.commerce.productDescription(),
                code: faker.string.alpha(8),
                price: faker.commerce.price({ min: 2000, max: 22000, dec: 0 }),
                stock: faker.string.numeric({length: {min:1, max: 2}, exclude: [`0`]}),
                category: faker.commerce.department(),
                thumbnail: faker.image.urlLoremFlickr({category: `product`})
            }).set("Cookie", `authToken=${superCookie}`); //Envío la cookie para la ruta protegida
            expect(response.status).to.equal(302); //Valido 302 en vez de 200, porque mi login redirige a products
            expect(response.header.location).to.be.equal(`/products?page=1&limit=30`); //Valido que redirija a products, que es donde va si está OK la creación del producto
        })
        it("Endpoint GET /api/products, debe traer todos los productos", async () => {
            const response = await requester.get("/api/products")
            .set("Cookie", `authToken=${superCookie}`); //Envío la cookie para la ruta protegida
            expect(response.status).to.equal(200);  // Verifico que la solicitud se haya realizado con éxito
            expect(response.body).to.not.be.null;    // Verifico que _body no sea null
            expect(response.body).to.not.be.undefined;  // Verifico que _body no sea undefined
            expect(response.body).to.be.an('array');     // Verifico que body sea un array
            newProductID = response.body[response.body.length - 1]._id; //almaceno el último producto del array que debería ser el recién creado
            productID = response.body[0]._id; //almaceno el primer id, para agregar al carrito, porque un usuario no puede agregar los productos creados por el.
        })
        it("Endpoint GET /api/products/:pid, debe traer un producto específico", async () => {
            const response = await requester.get(`/api/products/${productID}`); 
            expect(response.status).to.equal(200);  // Verifico que la solicitud se haya realizado con éxito
            expect(response.body._id).to.be.equal(productID); //Verifico que conicidan los id
        })
    })

    describe("Test de Carts Router", () => {
        it("Endpoint GET /api/carts, debe traer todos los carritos", async () => {
            const response = await requester.get("/api/carts");
            expect(response.body).to.be.an("array"); //Debe ser un array
            expect(response.body[0]._id).to.be.ok; //Apunto a que al menos haya 1 carrito creado y tengo la propiedad _id
            cartID = response.body[response.body.length - 1]._id; //Almaceno el último cartId creado en este test
        })
        it("Endpoint GET /api/carts/:cid, debe traer el carrito del usuario creado antes", async () => {
            const response = await requester.get(`/api/carts/${cartID}`)
            .set("Cookie", `authToken=${superCookie}`); //Envío la cookie para la ruta protegida
            expect(response.status).to.equal(200);  // Verifico que la solicitud se haya realizado con éxito
            expect(response.body[0]._id).to.be.equal(cartID);   //Verifico que conicidan los id
        })
        it("Endpoint POST /api/carts/:cid/products/:pid, agregar un producto al carrito", async () => {
            const response = await requester.post(`/api/carts/${cartID}/products/${productID}`)
            .set("Cookie", `authToken=${superCookie}`); //Envío la cookie para la ruta protegida
            expect(response.status).to.equal(200);  // Verifico que la solicitud se haya realizado con éxito
            expect(response.body.message).to.be.equal('Producto agregado al carrito exitosamente'); //Verifico que se haya agregado el producto
        })
    })

});

/* AGREGO ESTE MOCHA TEST, PARA HACER USO DEL DAO Y BORRAR LOS DATOS GENERADOS EN EL TEST DE LOS ROUTERS */
describe("Mocha Test de mis DAO, para eliminar los datos antes generados", () => {
    
    // Conectar la base de datos antes de las pruebas
    before( async function () {
        this.productDao = new ProductDao();
        this.userDao = new UserDao();
        this.cartDao = new CartDao();
        await mongoose.connect("mongodb+srv://coder:F7717446B2f7717446b2@ecommerce.cmlx1ff.mongodb.net/ecommerce?retryWrites=true&w=majority");
        this.productID = newProductID;  //Seteo el ID del producto creado al principio
        this.email = userEmail;
        this.cartID = cartID;
    })
    // Desconectar la base de datos después de las pruebas
    after(async function () {
        await mongoose.disconnect();
    });

    describe("Testing Product DAO", () => {
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
        it("El DAO debe poder buscar un usuario por el mail", async function() {
            const result = await this.userDao.getByEmail(this.email);
            assert.strictEqual(result.email, this.email)
        });
    
        it("El DAO debe poder eliminar el usuario de la DB", async function() {
            const result = await this.userDao.deleteUser(this.email);
            assert.ok(result.status)
        })
    })

    describe("Testing Cart DAO", () => {
        it("El DAO debe poder buscar un cart por el id", async function() {
            const result = await this.cartDao.getCartsById(this.cartID);
            assert.ok(result[0]._id); // Verificar que result no sea null ni undefined
        });
    
        it("El DAO debe poder eliminar el cart de la DB", async function() {
            const result = await this.cartDao.cartDelete(this.cartID);
            assert.ok(result.status)
        })
    })
})


