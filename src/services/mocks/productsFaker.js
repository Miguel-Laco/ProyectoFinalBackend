import { faker } from "@faker-js/faker";

export const generateProducts = cant => {
    const products = [];
    for(let i=0; i<100; i++){
        products.push(generateProduct())
    }
    return products;
}

const generateProduct = () =>{
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        code: faker.string.alpha(8),
        price: faker.commerce.price({ min: 2000, max: 22000, dec: 0 }),
        stock: faker.string.numeric({length: {min:1, max: 2}, exclude: [`0`]}),
        category: faker.commerce.department(),
        thumbnail: faker.image.urlLoremFlickr({category: `product`})
        
    }
}

