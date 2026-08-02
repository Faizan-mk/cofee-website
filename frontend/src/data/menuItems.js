import {
  imgCappuccino,
  imgChaiLatte,
  imgMacchiato,
  imgExpresso,
  imgCoffeeImage,
  imgCoffeeBean,
  imgDiscover,
  imgCup,
  imgCoffeeBlast,
} from "../assets/images"

export const categories = ["Hot Coffee", "Cold Coffee", "Desserts"]

export const menuItems = [
  { name: "Cappuccino", desc: "Coffee 50% | Milk 50%", price: 8.5, img: imgCappuccino, category: "Hot Coffee", badge: "Bestseller" },
  { name: "Chai Latte", desc: "Coffee 50% | Milk 50%", price: 8.5, img: imgChaiLatte, category: "Hot Coffee" },
  { name: "Macchiato", desc: "Coffee 50% | Milk 50%", price: 8.5, img: imgMacchiato, category: "Hot Coffee" },
  { name: "Expresso", desc: "Coffee 50% | Milk 50%", price: 8.5, img: imgExpresso, category: "Hot Coffee", badge: "New" },
  { name: "House Blend", desc: "Signature roasted beans", price: 7.9, img: imgCoffeeImage, category: "Hot Coffee" },
  { name: "Black Coffee", desc: "Pure & strong", price: 6.5, img: imgCoffeeBean, category: "Hot Coffee" },
  { name: "Iced Cappuccino", desc: "Chilled with milk foam", price: 9.5, img: imgDiscover, category: "Cold Coffee", badge: "Bestseller" },
  { name: "Iced Latte", desc: "Espresso over ice", price: 9.0, img: imgCup, category: "Cold Coffee" },
  { name: "Cold Brew", desc: "Slow steeped overnight", price: 8.0, img: imgCoffeeBlast, category: "Cold Coffee" },
  { name: "Mocha Frappe", desc: "Chocolate & coffee blend", price: 9.8, img: imgCoffeeImage, category: "Cold Coffee" },
  { name: "Chocolate Cake", desc: "Rich cocoa sponge", price: 6.2, img: imgCup, category: "Desserts", badge: "New" },
  { name: "Brownie", desc: "Warm & gooey", price: 5.8, img: imgCoffeeBean, category: "Desserts" },
  { name: "Butter Croissant", desc: "Freshly baked daily", price: 4.5, img: imgCoffeeBlast, category: "Desserts" },
  { name: "Cheesecake", desc: "Creamy classic", price: 6.9, img: imgDiscover, category: "Desserts" },
]

export const money = (n) => `$${n.toFixed(2)}`
