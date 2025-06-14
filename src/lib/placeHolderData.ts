// export const restaurant_id = 'r01'

let restaurant_id = 'r02';

export const getRestaurantId = () => restaurant_id;
export const setRestaurantId = (id: string) => {
  restaurant_id = id;
};

export const drinksPlaceholder = [
  {

    name: "Espresso",
    product_type: 'regular',
    id: '1',

    img_src: "espresso.jpg",
    description: "A short shot of espresso, strong and black.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Latte",
    product_type: 'special',
    id: '2',

    img_src: "latte.jpg",

    description: "A coffee drink with steamed milk and foam.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Milk",
        ing_qty: 100,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Cappuccino",
    product_type: 'regular',
    id: '3',

    img_src: "cappuccino.jpg",
    description: "A coffee drink with equal parts of espresso, steamed milk, and frothed milk.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Milk",
        ing_qty: 100,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Mocha",
    product_type: 'special',
    id: '4',

    img_src: "mocha.jpg",
    description: "A coffee drink made with coffee, chocolate, and milk.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Chocolate",
        ing_qty: 20,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Milk",
        ing_qty: 100,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Americano",
    product_type: 'regular',
    id: '5',

    img_src: "americano.jpg",
    description: "A coffee drink made with espresso and hot water.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Water",
        ing_qty: 200,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Caffe Latte",
    product_type: 'regular',
    id: '6',
    img_src: "caffe_latte.jpg",
    description: "A coffee drink with espresso and steamed milk.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Milk",
        ing_qty: 100,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Caffe Americano",
    product_type: "special",
    id: '7',

    img_src: "caffe_americano.jpg",
    description: "A coffee drink made with espresso and hot water.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Water",
        ing_qty: 200,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Caffe Mocha",
    product_type: "special",
    id: '8',

    img_src: "caffe_mocha.jpg",
    description: "A coffee drink made with espresso, chocolate, and milk.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Chocolate",
        ing_qty: 20,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Milk",
        ing_qty: 100,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Caffe Espresso",
    product_type: "special",
    id: '9',

    img_src: "caffe_espresso.jpg",
    description: "A short shot of espresso, strong and black.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  },
  {
    name: "Caffe Cappuccino",
    product_type: "special",
    id: '10',

    img_src: "caffe_cappuccino.jpg",
    description: "A coffee drink with equal parts of espresso, steamed milk, and frothed milk.",
    base_ingredient: [
      {
        ing_name: "Coffee Beans",
        ing_qty: 2,
        ing_unit: "grams",
        custom_marker: false
      },
      {
        ing_name: "Milk",
        ing_qty: 100,
        ing_unit: "ml",
        custom_marker: false
      }
    ],
    total_qty: 0,
    price: 20,
  }
];

export const dessertsPlaceholder = [
  {
    name: "Chocolate Cake",
    product_type: "regular",
    id: "1",
    img_src: "https://example.com/chocolate-cake.jpg",
    description: "A rich and moist chocolate cake with a creamy frosting.",
    base_ingredient: [
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 100,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Cocoa Powder",
        ing_qty: 50,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 15.99,
  },
  {
    name: "Vanilla Ice Cream",
    product_type: "regular",
    id: "2",
    img_src: "https://example.com/vanilla-ice-cream.jpg",
    description: "Creamy vanilla ice cream with a hint of vanilla extract.",
    base_ingredient: [
      {
        ing_name: "Milk",
        ing_qty: 500,
        ing_unit: "ml",
        custom_marker: false,
      },
      {
        ing_name: "Vanilla Extract",
        ing_qty: 2,
        ing_unit: "tsp",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 100,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 8.99,
  },
  {
    name: "Strawberry Cheesecake",
    product_type: "regular",
    id: "3",
    img_src: "https://example.com/strawberry-cheesecake.jpg",
    description: "A light and creamy cheesecake topped with fresh strawberries.",
    base_ingredient: [
      {
        ing_name: "Cream Cheese",
        ing_qty: 250,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Strawberries",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 12.99,
  },
  {
    name: "Apple Pie",
    product_type: "regular",
    id: "4",
    img_src: "https://example.com/apple-pie.jpg",
    description: "A classic apple pie with a flaky crust and a sweet filling.",
    base_ingredient: [
      {
        ing_name: "Apple",
        ing_qty: 500,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 10.99,
  },
  {
    name: "Carrot Cake",
    product_type: "regular",
    id: "5",
    img_src: "https://example.com/carrot-cake.jpg",
    description: "A moist and flavorful carrot cake with a sweet icing.",
    base_ingredient: [
      {
        ing_name: "Carrots",
        ing_qty: 500,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 11.99,
  },
  {
    name: "Lemon Tart",
    product_type: "regular",
    id: "6",
    img_src: "https://example.com/lemon-tart.jpg",
    description: "A tangy lemon tart with a buttery crust and a sweet filling.",
    base_ingredient: [
      {
        ing_name: "Lemon",
        ing_qty: 2,
        ing_unit: "pieces",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 13.99,
  },
  {
    name: "Blueberry Muffins",
    product_type: "special",
    id: "7",
    img_src: "https://example.com/blueberry-muffins.jpg",
    description: "Flavorful blueberry muffins with a hint of cinnamon.",
    base_ingredient: [
      {
        ing_name: "Blueberries",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 100,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 7.99,
  },
  {
    name: "Peach Cobbler",
    product_type: "special",
    id: "8",
    img_src: "https://example.com/peach-cobbler.jpg",
    description: "A sweet and tangy peach cobbler with a crispy topping.",
    base_ingredient: [
      {
        ing_name: "Peaches",
        ing_qty: 500,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 14.99,
  },
  {
    name: "Cherry Cheesecake",
    product_type: "special",
    id: "9",
    img_src: "https://example.com/cherry-cheesecake.jpg",
    description: "A creamy cheesecake with a sweet cherry filling.",
    base_ingredient: [
      {
        ing_name: "Cream Cheese",
        ing_qty: 250,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Cherries",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 12.99,
  },
  {
    name: "Pumpkin Pie",
    product_type: "special",
    id: "10",
    img_src: "https://example.com/pumpkin-pie.jpg",
    description: "A warm and spicy pumpkin pie with a creamy filling.",
    base_ingredient: [
      {
        ing_name: "Pumpkin",
        ing_qty: 500,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Sugar",
        ing_qty: 150,
        ing_unit: "g",
        custom_marker: false,
      },
      {
        ing_name: "Flour",
        ing_qty: 200,
        ing_unit: "g",
        custom_marker: false,
      },
    ],
    total_qty: 1,
    price: 15.99,
  },
];