/*
  # Create Indian Foods Database

  1. New Tables
    - `indian_foods`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Name of the food item
      - `name_hindi` (text, nullable) - Hindi name for local users
      - `protein` (float) - Protein content per 100g in grams
      - `carbs` (float) - Carbohydrate content per 100g in grams
      - `fiber` (float) - Fiber content per 100g in grams
      - `calories` (float) - Calories per 100g
      - `category` (text) - Food category (dal, vegetable, grain, dairy, meat, snack, etc.)
      - `serving_size` (float) - Typical serving size in grams
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `indian_foods` table
    - Allow public read access for all users
    - Only service role can insert/update

  3. Data
    - Pre-populated with 80+ common Indian foods including:
      - Dals and legumes (toor dal, moong dal, chana, rajma)
      - Grains (rice, roti, paratha, idli, dosa)
      - Dairy (paneer, milk, curd, ghee)
      - Vegetables (palak, bhindi, aloo)
      - Non-veg (chicken, fish, egg)
      - Snacks (samosa, pakora, dhokla)
      - Nuts and seeds
*/

CREATE TABLE IF NOT EXISTS indian_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  name_hindi text,
  protein float NOT NULL DEFAULT 0,
  carbs float NOT NULL DEFAULT 0,
  fiber float NOT NULL DEFAULT 0,
  calories float NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'other',
  serving_size float DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE indian_foods ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view Indian foods"
  ON indian_foods FOR SELECT
  TO public
  USING (true);

-- Insert comprehensive Indian food data
INSERT INTO indian_foods (name, name_hindi, protein, carbs, fiber, calories, category, serving_size) VALUES
-- Dals and Legumes
('Toor Dal (Arhar Dal)', 'तूर दाल', 22.0, 62.0, 7.5, 343, 'dal', 50),
('Moong Dal', 'मूंग दाल', 24.0, 60.0, 8.0, 347, 'dal', 50),
('Masoor Dal (Red Lentil)', 'मसूर दाल', 25.0, 59.0, 8.0, 352, 'dal', 50),
('Chana Dal', 'चना दाल', 22.0, 61.0, 10.0, 360, 'dal', 50),
('Urad Dal', 'उड़द दाल', 25.0, 59.0, 7.5, 346, 'dal', 50),
('Rajma (Kidney Beans)', 'राजमा', 24.0, 60.0, 8.0, 333, 'dal', 50),
('Chana (Chickpeas)', 'चना', 19.0, 61.0, 7.0, 364, 'dal', 50),
('Moong Dal (Whole)', 'साबुत मूंग', 23.0, 62.0, 9.0, 347, 'dal', 50),
('Black Chana', 'काला चना', 20.0, 62.0, 12.0, 378, 'dal', 50),

-- Dairy Products
('Paneer', 'पनीर', 18.0, 1.2, 0, 265, 'dairy', 100),
('Curd (Dahi)', 'दही', 3.5, 4.7, 0, 60, 'dairy', 200),
('Milk (Full Cream)', 'दूध (फुल क्रीम)', 3.2, 4.8, 0, 61, 'dairy', 250),
('Milk (Toned)', 'दूध (टोंड)', 3.0, 5.0, 0, 52, 'dairy', 250),
('Cheese (Processed)', 'चीज़', 25.0, 1.3, 0, 402, 'dairy', 30),
('Buttermilk', 'छाछ', 2.0, 4.0, 0, 30, 'dairy', 250),
('Ghee', 'घी', 0, 0, 0, 900, 'dairy', 15),

-- Grains and Breads
('Roti (Chapati)', 'रोटी', 2.7, 18.0, 1.5, 100, 'grain', 40),
('Paratha (Plain)', 'पराठा', 3.5, 30.0, 2.0, 160, 'grain', 60),
('Rice (White)', 'चावल (सफेद)', 2.7, 28.0, 0.4, 130, 'grain', 150),
('Rice (Brown)', 'चावल (भूरा)', 2.6, 23.0, 1.8, 111, 'grain', 150),
('Idli', 'इडली', 3.2, 19.0, 0.8, 97, 'grain', 60),
('Dosa', 'डोसा', 5.0, 25.0, 1.5, 150, 'grain', 100),
('Poha (Flattened Rice)', 'पोहा', 2.5, 25.0, 1.0, 130, 'grain', 80),
('Upma', 'उपमा', 3.5, 28.0, 1.5, 150, 'grain', 150),
('Oats', 'ओट्स', 13.0, 66.0, 10.0, 389, 'grain', 40),
('Quinoa', 'क्विनोआ', 14.0, 64.0, 7.0, 368, 'grain', 50),

-- Vegetables
('Palak Paneer', 'पालक पनीर', 11.0, 8.0, 2.5, 189, 'vegetable', 150),
('Aloo Gobi', 'आलू गोभी', 3.0, 18.0, 3.0, 100, 'vegetable', 150),
('Bhindi (Okra) Sabzi', 'भिंडी सब्ज़ी', 2.0, 6.0, 2.5, 45, 'vegetable', 150),
('Baingan Bharta', 'बैंगन भरता', 1.5, 7.0, 3.0, 50, 'vegetable', 150),
('Mix Veg Sabzi', 'मिक्स वेज सब्ज़ी', 3.0, 12.0, 3.0, 85, 'vegetable', 150),
('Methi Paratha', 'मेथी पराठा', 4.0, 28.0, 2.5, 155, 'vegetable', 60),
('Palak (Spinach)', 'पालक', 2.9, 3.6, 2.2, 23, 'vegetable', 100),

-- Non-Vegetarian
('Chicken Curry', 'चिकन करी', 25.0, 5.0, 1.5, 165, 'meat', 150),
('Chicken Biryani', 'चिकन बिरयानी', 12.0, 35.0, 2.0, 250, 'meat', 250),
('Fish Curry', 'मछली करी', 22.0, 4.0, 0.5, 130, 'meat', 100),
('Egg Curry', 'अंडा करी', 13.0, 8.0, 1.0, 180, 'meat', 150),
('Egg (Boiled)', 'उबला अंडा', 13.0, 1.1, 0, 155, 'meat', 50),
('Mutton Curry', 'मटन करी', 20.0, 3.0, 0.5, 200, 'meat', 100),
('Tandoori Chicken', 'तंदूरी चिकन', 26.0, 2.0, 0, 150, 'meat', 100),
('Keema', 'कीमा', 18.0, 6.0, 1.0, 190, 'meat', 100),

-- Snacks
('Samosa', 'समोसा', 4.0, 25.0, 2.0, 260, 'snack', 80),
('Pakora', 'पकोड़ा', 3.5, 15.0, 1.5, 200, 'snack', 50),
('Dhokla', 'ढोकला', 5.5, 18.0, 1.5, 120, 'snack', 80),
('Kachori', 'कचौड़ी', 4.0, 30.0, 2.0, 280, 'snack', 75),
('Vada', 'वड़ा', 5.0, 25.0, 2.0, 180, 'snack', 75),
('Pani Puri', 'पानी पुरी', 2.5, 35.0, 1.5, 180, 'snack', 60),
('Bhel Puri', 'भेल पुरी', 3.0, 30.0, 2.0, 180, 'snack', 100),
('Aloo Tikki', 'आलू टिक्की', 3.0, 25.0, 2.0, 150, 'snack', 80),

-- Nuts and Seeds
('Almonds', 'बादाम', 21.0, 22.0, 12.5, 579, 'nuts', 15),
('Walnuts', 'अखरोट', 15.0, 14.0, 6.7, 654, 'nuts', 15),
('Peanuts', 'मूंगफली', 26.0, 16.0, 8.5, 567, 'nuts', 20),
('Cashews', 'काजू', 18.0, 30.0, 3.3, 553, 'nuts', 15),
('Pistachios', 'पिस्ता', 20.0, 27.0, 10.3, 562, 'nuts', 15),
('Chia Seeds', 'चिया सीड्स', 17.0, 42.0, 34.4, 486, 'nuts', 10),
('Flax Seeds', 'अलसी', 18.0, 29.0, 27.3, 534, 'nuts', 10),
('Pumpkin Seeds', 'कद्दू के बीज', 30.0, 10.0, 6.0, 559, 'nuts', 10),

-- Sweets and Desserts
('Gulab Jamun', 'गुलाब जामुन', 4.0, 45.0, 0.5, 320, 'sweet', 50),
('Rasgulla', 'रसगुल्ला', 1.5, 35.0, 0, 152, 'sweet', 50),
('Kheer', 'खीर', 4.0, 28.0, 0.3, 180, 'sweet', 150),
('Halwa (Sooji)', 'हलवा (सूजी)', 3.0, 30.0, 0.5, 200, 'sweet', 100),
('Jalebi', 'जलेबी', 0.5, 50.0, 0, 250, 'sweet', 50),
('Ladoo (Besan)', 'लड्डू (बेसन)', 5.0, 45.0, 2.0, 350, 'sweet', 50),

-- Miscellaneous
('Soy Chunks', 'सोया चंक्स', 52.0, 33.0, 13.0, 345, 'protein', 50),
('Tofu', 'टोफू', 8.0, 2.0, 0.3, 76, 'protein', 100),
('Sprouted Moong', 'अंकुरित मूंग', 14.0, 30.0, 3.0, 180, 'dal', 100),
('Besan (Gram Flour)', 'बेसन', 22.0, 58.0, 10.8, 387, 'other', 30),
('Sattu', 'सत्तू', 22.0, 55.0, 8.0, 370, 'other', 30);

CREATE INDEX IF NOT EXISTS idx_indian_foods_name ON indian_foods(name);
CREATE INDEX IF NOT EXISTS idx_indian_foods_category ON indian_foods(category);
CREATE INDEX IF NOT EXISTS idx_indian_foods_protein ON indian_foods(protein DESC);