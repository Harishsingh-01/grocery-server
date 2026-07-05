const defaultCategories = [
  {
    name: "Vegetables",
    icon: "Salad",
    color: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    subcategories: ["Leafy Vegetables", "Root Vegetables", "Seasonal"],
    predefinedItems: [
      { name: "Tomato", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Potato", defaultUnit: "kg", subcategory: "Root Vegetables" },
      { name: "Onion", defaultUnit: "kg", subcategory: "Root Vegetables" },
      { name: "Garlic", defaultUnit: "gram", subcategory: "Root Vegetables" },
      { name: "Ginger", defaultUnit: "gram", subcategory: "Root Vegetables" },
      { name: "Green Chilli", defaultUnit: "gram", subcategory: "Leafy Vegetables" },
      { name: "Capsicum", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Cabbage", defaultUnit: "piece", subcategory: "Leafy Vegetables" },
      { name: "Cauliflower", defaultUnit: "piece", subcategory: "Seasonal" },
      { name: "Spinach", defaultUnit: "packet", subcategory: "Leafy Vegetables" },
      { name: "Lady Finger", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Brinjal", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Peas", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Coriander", defaultUnit: "packet", subcategory: "Leafy Vegetables" },
      { name: "Lemon", defaultUnit: "piece", subcategory: "Seasonal" }
    ]
  },
  {
    name: "Fruits",
    icon: "Apple",
    color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    subcategories: ["Citrus", "Berries", "Tropical", "Seasonal"],
    predefinedItems: [
      { name: "Apple", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Banana", defaultUnit: "dozen", subcategory: "Tropical" },
      { name: "Orange", defaultUnit: "kg", subcategory: "Citrus" },
      { name: "Mango", defaultUnit: "kg", subcategory: "Seasonal" },
      { name: "Papaya", defaultUnit: "piece", subcategory: "Tropical" },
      { name: "Grapes", defaultUnit: "kg", subcategory: "Berries" },
      { name: "Watermelon", defaultUnit: "piece", subcategory: "Seasonal" },
      { name: "Pomegranate", defaultUnit: "kg", subcategory: "Tropical" }
    ]
  },
  {
    name: "Dairy",
    icon: "Milk",
    color: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
    subcategories: ["Milk & Curd", "Cheese & Butter", "Others"],
    predefinedItems: [
      { name: "Milk", defaultUnit: "litre", subcategory: "Milk & Curd" },
      { name: "Curd", defaultUnit: "packet", subcategory: "Milk & Curd" },
      { name: "Paneer", defaultUnit: "gram", subcategory: "Cheese & Butter" },
      { name: "Butter", defaultUnit: "packet", subcategory: "Cheese & Butter" },
      { name: "Cheese", defaultUnit: "packet", subcategory: "Cheese & Butter" },
      { name: "Ghee", defaultUnit: "litre", subcategory: "Others" }
    ]
  },
  {
    name: "Grocery",
    icon: "Wheat",
    color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    subcategories: ["Flour", "Rice", "Pulses", "Cooking Oils", "Sweeteners"],
    predefinedItems: [
      { name: "Flour", defaultUnit: "kg", subcategory: "Flour" },
      { name: "Rice", defaultUnit: "kg", subcategory: "Rice" },
      { name: "Dal", defaultUnit: "kg", subcategory: "Pulses" },
      { name: "Sugar", defaultUnit: "kg", subcategory: "Sweeteners" },
      { name: "Salt", defaultUnit: "packet", subcategory: "Sweeteners" },
      { name: "Cooking Oil", defaultUnit: "litre", subcategory: "Cooking Oils" },
      { name: "Tea", defaultUnit: "packet", subcategory: "Others" },
      { name: "Coffee", defaultUnit: "bottle", subcategory: "Others" },
      { name: "Besan", defaultUnit: "packet", subcategory: "Flour" },
      { name: "Poha", defaultUnit: "packet", subcategory: "Rice" },
      { name: "Suji", defaultUnit: "packet", subcategory: "Flour" }
    ]
  },
  {
    name: "Spices",
    icon: "Flame",
    color: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
    subcategories: ["Whole Spices", "Powdered Spices"],
    predefinedItems: [
      { name: "Turmeric Powder", defaultUnit: "packet", subcategory: "Powdered Spices" },
      { name: "Red Chilli Powder", defaultUnit: "packet", subcategory: "Powdered Spices" },
      { name: "Coriander Powder", defaultUnit: "packet", subcategory: "Powdered Spices" },
      { name: "Cumin Seeds", defaultUnit: "packet", subcategory: "Whole Spices" },
      { name: "Garam Masala", defaultUnit: "packet", subcategory: "Powdered Spices" },
      { name: "Mustard Seeds", defaultUnit: "packet", subcategory: "Whole Spices" }
    ]
  },
  {
    name: "Cleaning",
    icon: "Sparkles",
    color: "bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
    subcategories: ["Detergents", "Household", "Personal Hygiene"],
    predefinedItems: [
      { name: "Detergent", defaultUnit: "kg", subcategory: "Detergents" },
      { name: "Dishwash", defaultUnit: "piece", subcategory: "Household" },
      { name: "Floor Cleaner", defaultUnit: "bottle", subcategory: "Household" },
      { name: "Toilet Cleaner", defaultUnit: "bottle", subcategory: "Household" },
      { name: "Soap", defaultUnit: "piece", subcategory: "Personal Hygiene" },
      { name: "Hand Wash", defaultUnit: "bottle", subcategory: "Personal Hygiene" }
    ]
  },
  {
    name: "Snacks",
    icon: "Cookie",
    color: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400",
    subcategories: ["Biscuits", "Chips & Namkeen", "Chocolates"],
    predefinedItems: [
      { name: "Biscuits", defaultUnit: "packet", subcategory: "Biscuits" },
      { name: "Chips", defaultUnit: "packet", subcategory: "Chips & Namkeen" },
      { name: "Namkeen", defaultUnit: "packet", subcategory: "Chips & Namkeen" },
      { name: "Chocolates", defaultUnit: "piece", subcategory: "Chocolates" }
    ]
  },
  {
    name: "Beverages",
    icon: "CupSoda",
    color: "bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400",
    subcategories: ["Cold Drinks", "Juices & Soda"],
    predefinedItems: [
      { name: "Soft Drink", defaultUnit: "bottle", subcategory: "Cold Drinks" },
      { name: "Fruit Juice", defaultUnit: "packet", subcategory: "Juices & Soda" },
      { name: "Soda Water", defaultUnit: "bottle", subcategory: "Juices & Soda" }
    ]
  },
  {
    name: "Medicines",
    icon: "Pills",
    color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400",
    subcategories: ["Daily Supplements", "First Aid & Tablets"],
    predefinedItems: [
      { name: "Multi-Vitamin", defaultUnit: "box", subcategory: "Daily Supplements" },
      { name: "Paracetamol", defaultUnit: "packet", subcategory: "First Aid & Tablets" },
      { name: "Cough Syrup", defaultUnit: "bottle", subcategory: "First Aid & Tablets" },
      { name: "Band-aid", defaultUnit: "box", subcategory: "First Aid & Tablets" }
    ]
  },
  {
    name: "Others",
    icon: "Package",
    color: "bg-gray-100 dark:bg-neutral-850 text-gray-600 dark:text-gray-400",
    subcategories: ["Household Utilities"],
    predefinedItems: [
      { name: "Garbage Bags", defaultUnit: "packet", subcategory: "Household Utilities" },
      { name: "Matchbox", defaultUnit: "box", subcategory: "Household Utilities" },
      { name: "Tissue Paper", defaultUnit: "packet", subcategory: "Household Utilities" }
    ]
  }
];

module.exports = {
  defaultCategories
};
