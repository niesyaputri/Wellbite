/**
 * ============================================================
 *  WellBite — foods.js  (daftar makanan Indonesia + gizinya)
 *  Nilai per 1 porsi umum, perkiraan dari tabel komposisi pangan
 *  dan label kemasan yang umum. Angka bisa berbeda tergantung
 *  resep & ukuran porsi — selalu bisa direvisi di aplikasi.
 *
 *  Kolom: id | nama (ID) | nama (EN) | kata kunci | porsi (ID) | porsi (EN) | gram |
 *         kkal | protein g | karbo g | lemak g | gula g | natrium mg | serat g |
 *         kelompok | porsi sayur | porsi buah
 *  Kelompok: pokok, lauk, sayur, buah, hidangan, jajan, minum
 * ============================================================
 */
(function () {
  'use strict';
  const R = [
    // ---------- makanan pokok ----------
    ['nasi', 'Nasi putih', 'Steamed white rice', 'nasi|rice|beras', '1 piring (150 g)', '1 plate (150 g)', 150, 195, 3.6, 43, 0.4, 0.1, 2, 0.6, 'pokok', 0, 0],
    ['nasi-c', 'Nasi putih (centong)', 'White rice (1 scoop)', 'nasi|centong|rice', '1 centong (100 g)', '1 scoop (100 g)', 100, 130, 2.4, 28.6, 0.3, 0.1, 1, 0.4, 'pokok', 0, 0],
    ['nasi-merah', 'Nasi merah', 'Brown rice', 'nasi merah|brown rice', '1 piring (150 g)', '1 plate (150 g)', 150, 165, 3.9, 34.5, 1.3, 0.5, 5, 2.7, 'pokok', 0, 0],
    ['nasi-uduk', 'Nasi uduk', 'Coconut rice (nasi uduk)', 'uduk|coconut rice', '1 porsi (150 g)', '1 serving (150 g)', 150, 270, 4.5, 42, 9, 0.5, 220, 0.8, 'pokok', 0, 0],
    ['lontong', 'Lontong / ketupat', 'Rice cake (lontong/ketupat)', 'lontong|ketupat|rice cake', '1 buah (100 g)', '1 piece (100 g)', 100, 140, 2.5, 31, 0.2, 0, 3, 0.4, 'pokok', 0, 0],
    ['bubur', 'Bubur ayam', 'Chicken rice porridge', 'bubur|porridge|congee', '1 mangkuk', '1 bowl', 350, 370, 16, 50, 11, 2, 980, 1.5, 'hidangan', 0, 0],
    ['roti', 'Roti tawar', 'White bread', 'roti tawar|bread|toast', '1 lembar (30 g)', '1 slice (30 g)', 30, 80, 2.5, 15, 1, 1.5, 145, 0.8, 'pokok', 0, 0],
    ['roti-gandum', 'Roti gandum', 'Whole wheat bread', 'roti gandum|wholemeal|whole wheat', '1 lembar (30 g)', '1 slice (30 g)', 30, 75, 3.5, 13, 1.1, 1.5, 135, 2, 'pokok', 0, 0],
    ['oat', 'Oatmeal (masak air)', 'Oatmeal (with water)', 'oat|oatmeal|havermut', '1 mangkuk (40 g oat)', '1 bowl (40 g oats)', 240, 150, 5.3, 27, 2.6, 0.4, 5, 4, 'pokok', 0, 0],
    ['kentang', 'Kentang rebus', 'Boiled potato', 'kentang|potato', '1 buah sedang (150 g)', '1 medium (150 g)', 150, 130, 2.8, 30, 0.2, 1.3, 8, 2.7, 'pokok', 0, 0],
    ['ubi', 'Ubi rebus', 'Boiled sweet potato', 'ubi|sweet potato|ubi jalar', '1 buah sedang (130 g)', '1 medium (130 g)', 130, 115, 2, 27, 0.2, 7, 35, 3.9, 'pokok', 0, 0],
    ['singkong', 'Singkong rebus', 'Boiled cassava', 'singkong|cassava|ketela', '1 potong (100 g)', '1 piece (100 g)', 100, 150, 1.2, 36, 0.3, 1.7, 14, 1.8, 'pokok', 0, 0],
    ['jagung', 'Jagung rebus', 'Boiled corn', 'jagung|corn', '1 tongkol (100 g)', '1 cob (100 g)', 100, 96, 3.4, 21, 1.5, 4.5, 1, 2.4, 'pokok', 0, 0],
    ['mie-instan', 'Mi instan goreng', 'Instant fried noodles', 'indomie|mie instan|mi instan|instant noodle', '1 bungkus', '1 pack', 85, 380, 8, 52, 15, 4, 1150, 2, 'hidangan', 0, 0],
    ['mie-instan-kuah', 'Mi instan kuah', 'Instant soup noodles', 'indomie kuah|mie kuah|soup noodle', '1 bungkus', '1 pack', 75, 330, 7, 46, 13, 3, 1500, 2, 'hidangan', 0, 0],
    ['pasta', 'Spageti bolognese', 'Spaghetti bolognese', 'spaghetti|spageti|pasta', '1 piring', '1 plate', 300, 480, 20, 62, 16, 9, 750, 4, 'hidangan', 0.5, 0],
    ['sereal', 'Sereal + susu', 'Cereal with milk', 'sereal|cereal|cornflakes', '1 mangkuk', '1 bowl', 230, 210, 7, 36, 4.5, 16, 230, 1.5, 'pokok', 0, 0],

    // ---------- lauk ----------
    ['ayam-goreng', 'Ayam goreng (paha)', 'Fried chicken (thigh)', 'ayam goreng|fried chicken|paha', '1 potong (80 g)', '1 piece (80 g)', 80, 230, 18, 5, 15, 0, 320, 0, 'lauk', 0, 0],
    ['ayam-goreng-dada', 'Ayam goreng (dada)', 'Fried chicken (breast)', 'ayam goreng dada|chicken breast fried', '1 potong (100 g)', '1 piece (100 g)', 100, 260, 26, 6, 14, 0, 380, 0, 'lauk', 0, 0],
    ['ayam-bakar', 'Ayam bakar', 'Grilled chicken (kecap)', 'ayam bakar|grilled chicken', '1 potong (90 g)', '1 piece (90 g)', 90, 210, 22, 6, 10, 5, 420, 0, 'lauk', 0, 0],
    ['dada-rebus', 'Dada ayam rebus/panggang', 'Boiled/grilled chicken breast', 'dada ayam|chicken breast|ayam rebus', '100 g', '100 g', 100, 165, 31, 0, 3.6, 0, 75, 0, 'lauk', 0, 0],
    ['ayam-geprek', 'Ayam geprek', 'Smashed fried chicken (geprek)', 'geprek', '1 potong + sambal', '1 piece + chili', 150, 420, 25, 18, 27, 2, 700, 1, 'lauk', 0, 0],
    ['telur-rebus', 'Telur rebus', 'Boiled egg', 'telur rebus|boiled egg|egg', '1 butir (55 g)', '1 egg (55 g)', 55, 78, 6.3, 0.6, 5.3, 0.6, 62, 0, 'lauk', 0, 0],
    ['telur-dadar', 'Telur dadar', 'Omelette', 'telur dadar|omelet|omelette', '1 butir', '1 egg', 65, 150, 7, 1, 13, 0.5, 260, 0, 'lauk', 0, 0],
    ['telur-ceplok', 'Telur ceplok / mata sapi', 'Fried egg', 'telur ceplok|mata sapi|fried egg', '1 butir', '1 egg', 60, 120, 6.5, 0.5, 10, 0.5, 200, 0, 'lauk', 0, 0],
    ['telur-balado', 'Telur balado', 'Egg in chili sauce (balado)', 'balado telur', '1 butir', '1 egg', 80, 160, 7, 4, 13, 2.5, 330, 0.5, 'lauk', 0, 0],
    ['tempe-goreng', 'Tempe goreng', 'Fried tempeh', 'tempe goreng|tempeh', '1 potong (50 g)', '1 piece (50 g)', 50, 120, 7, 5, 8.5, 0.3, 90, 1.5, 'lauk', 0, 0],
    ['tempe-bacem', 'Tempe bacem', 'Sweet braised tempeh', 'bacem', '1 potong (50 g)', '1 piece (50 g)', 50, 130, 7, 10, 7, 6, 230, 1.4, 'lauk', 0, 0],
    ['tempe-orek', 'Orek tempe', 'Sweet soy tempeh stir-fry', 'orek', '2 sdm (50 g)', '2 tbsp (50 g)', 50, 120, 6, 9, 7, 6, 260, 1.3, 'lauk', 0, 0],
    ['tahu-goreng', 'Tahu goreng', 'Fried tofu', 'tahu goreng|tofu', '1 potong (50 g)', '1 piece (50 g)', 50, 80, 5, 2, 6, 0.3, 70, 0.6, 'lauk', 0, 0],
    ['tahu-kukus', 'Tahu kukus/rebus', 'Steamed tofu', 'tahu kukus|tahu rebus|steamed tofu', '1 potong (50 g)', '1 piece (50 g)', 50, 40, 4, 1, 2.4, 0.2, 5, 0.4, 'lauk', 0, 0],
    ['ikan-goreng', 'Ikan goreng (nila/kembung)', 'Fried fish', 'ikan goreng|nila|kembung|fried fish', '1 ekor sedang (100 g)', '1 medium fish (100 g)', 100, 210, 21, 3, 13, 0, 330, 0, 'lauk', 0, 0],
    ['ikan-bakar', 'Ikan bakar', 'Grilled fish', 'ikan bakar|grilled fish', '1 ekor sedang (100 g)', '1 medium fish (100 g)', 100, 170, 22, 5, 7, 4, 400, 0, 'lauk', 0, 0],
    ['ikan-pindang', 'Pepes / pindang ikan', 'Steamed spiced fish (pepes)', 'pepes|pindang', '1 porsi (100 g)', '1 serving (100 g)', 100, 140, 20, 3, 5, 1, 600, 0.5, 'lauk', 0, 0],
    ['salmon', 'Salmon panggang', 'Grilled salmon', 'salmon', '100 g', '100 g', 100, 208, 22, 0, 13, 0, 60, 0, 'lauk', 0, 0],
    ['tuna', 'Tuna kaleng (air)', 'Canned tuna in water', 'tuna', '1/2 kaleng (80 g)', '1/2 can (80 g)', 80, 90, 20, 0, 0.8, 0, 260, 0, 'lauk', 0, 0],
    ['udang', 'Udang goreng tepung', 'Battered fried prawns', 'udang|shrimp|prawn', '5 ekor (80 g)', '5 pieces (80 g)', 80, 220, 14, 14, 12, 0.5, 450, 0.4, 'lauk', 0, 0],
    ['cumi', 'Cumi goreng tepung', 'Fried calamari', 'cumi|calamari|squid', '1 porsi (80 g)', '1 serving (80 g)', 80, 200, 12, 14, 11, 0.5, 400, 0.4, 'lauk', 0, 0],
    ['rendang', 'Rendang daging', 'Beef rendang', 'rendang|beef', '1 potong (70 g)', '1 piece (70 g)', 70, 195, 15, 4, 13, 2, 330, 1, 'lauk', 0, 0],
    ['semur', 'Semur daging', 'Beef stew in soy (semur)', 'semur', '1 porsi (100 g)', '1 serving (100 g)', 100, 220, 16, 10, 13, 8, 600, 0.5, 'lauk', 0, 0],
    ['empal', 'Empal / dendeng', 'Sweet fried beef (empal)', 'empal|dendeng', '1 potong (50 g)', '1 piece (50 g)', 50, 150, 12, 8, 8, 6, 330, 0, 'lauk', 0, 0],
    ['bakso', 'Bakso sapi (bulat)', 'Beef meatballs', 'bakso pentol|meatball', '5 butir', '5 balls', 100, 190, 12, 14, 9, 1, 650, 0.5, 'lauk', 0, 0],
    ['sosis', 'Sosis sapi/ayam', 'Sausage', 'sosis|sausage', '1 buah (40 g)', '1 piece (40 g)', 40, 110, 5, 3, 9, 1, 400, 0, 'lauk', 0, 0],
    ['nugget', 'Nugget ayam', 'Chicken nuggets', 'nugget', '4 potong (80 g)', '4 pieces (80 g)', 80, 230, 11, 13, 15, 1, 430, 0.6, 'lauk', 0, 0],
    ['perkedel', 'Perkedel kentang', 'Potato fritter (perkedel)', 'perkedel|bergedel', '1 buah (50 g)', '1 piece (50 g)', 50, 110, 2.5, 10, 7, 0.5, 170, 1, 'lauk', 0, 0],
    ['kornet', 'Kornet sapi', 'Corned beef', 'kornet|corned', '2 sdm (50 g)', '2 tbsp (50 g)', 50, 120, 9, 2, 8.5, 0, 450, 0, 'lauk', 0, 0],

    // ---------- sayur ----------
    ['sayur-bening', 'Sayur bening bayam', 'Clear spinach soup', 'sayur bening|bayam|spinach', '1 mangkuk', '1 bowl', 200, 50, 3, 8, 0.6, 2, 350, 2.5, 'sayur', 1, 0],
    ['sayur-asem', 'Sayur asem', 'Tamarind vegetable soup', 'sayur asem|asam', '1 mangkuk', '1 bowl', 200, 80, 3, 15, 1, 5, 500, 3, 'sayur', 1, 0],
    ['sayur-sop', 'Sayur sop', 'Vegetable soup', 'sop|sup sayur|vegetable soup', '1 mangkuk', '1 bowl', 250, 90, 5, 12, 2.5, 4, 600, 3, 'sayur', 1, 0],
    ['sayur-lodeh', 'Sayur lodeh', 'Vegetables in coconut milk (lodeh)', 'lodeh', '1 mangkuk', '1 bowl', 200, 160, 4, 12, 11, 4, 550, 3, 'sayur', 1, 0],
    ['tumis-kangkung', 'Tumis kangkung', 'Stir-fried water spinach', 'kangkung|water spinach', '1 porsi (100 g)', '1 serving (100 g)', 100, 90, 3, 5, 7, 1.5, 450, 2.5, 'sayur', 1, 0],
    ['capcay', 'Capcay', 'Stir-fried mixed vegetables (cap cay)', 'capcay|cap cay|chop suey', '1 porsi', '1 serving', 200, 160, 8, 14, 8, 5, 700, 4, 'sayur', 1.5, 0],
    ['tumis-buncis', 'Tumis buncis', 'Stir-fried green beans', 'buncis|green beans', '1 porsi (100 g)', '1 serving (100 g)', 100, 80, 2.5, 8, 5, 3, 350, 3, 'sayur', 1, 0],
    ['brokoli', 'Brokoli rebus', 'Boiled broccoli', 'brokoli|broccoli', '1 porsi (100 g)', '1 serving (100 g)', 100, 35, 2.4, 7, 0.4, 1.4, 40, 3.3, 'sayur', 1, 0],
    ['lalapan', 'Lalapan (timun, kol, kemangi)', 'Raw veggies (lalapan)', 'lalapan|lalap|timun|cucumber|selada', '1 porsi', '1 serving', 80, 15, 0.8, 3, 0.1, 1.5, 5, 1, 'sayur', 0.5, 0],
    ['gado-gado', 'Gado-gado', 'Gado-gado (veg with peanut sauce)', 'gado gado|gado-gado|peanut salad', '1 piring (tanpa lontong)', '1 plate (no rice cake)', 300, 380, 15, 28, 24, 12, 800, 7, 'sayur', 2, 0],
    ['pecel', 'Pecel sayur', 'Pecel (veg with peanut sauce)', 'pecel', '1 porsi', '1 serving', 250, 300, 11, 26, 18, 10, 700, 6, 'sayur', 1.5, 0],
    ['karedok', 'Karedok / urap', 'Karedok / urap salad', 'karedok|urap', '1 porsi', '1 serving', 150, 170, 6, 14, 11, 5, 400, 5, 'sayur', 1.5, 0],
    ['salad', 'Salad sayur (dressing)', 'Green salad with dressing', 'salad', '1 mangkuk', '1 bowl', 150, 120, 2, 8, 9, 4, 250, 3, 'sayur', 1.5, 0],
    ['sayur-daun-singkong', 'Gulai daun singkong', 'Cassava leaves in coconut curry', 'daun singkong|gulai daun', '1 porsi', '1 serving', 150, 150, 5, 9, 11, 2, 450, 5, 'sayur', 1, 0],

    // ---------- buah ----------
    ['pisang', 'Pisang', 'Banana', 'pisang|banana', '1 buah sedang', '1 medium', 100, 90, 1.1, 23, 0.3, 12, 1, 2.6, 'buah', 0, 1],
    ['apel', 'Apel', 'Apple', 'apel|apple', '1 buah sedang', '1 medium', 150, 78, 0.4, 21, 0.3, 15.5, 1, 3.6, 'buah', 0, 1],
    ['jeruk', 'Jeruk', 'Orange', 'jeruk|orange', '1 buah sedang', '1 medium', 130, 60, 1.2, 15, 0.2, 12, 0, 3, 'buah', 0, 1],
    ['pepaya', 'Pepaya', 'Papaya', 'pepaya|papaya', '1 potong (150 g)', '1 slice (150 g)', 150, 65, 0.7, 16, 0.4, 11.7, 12, 2.6, 'buah', 0, 1],
    ['semangka', 'Semangka', 'Watermelon', 'semangka|watermelon', '1 potong (200 g)', '1 slice (200 g)', 200, 60, 1.2, 15, 0.3, 12.4, 2, 0.8, 'buah', 0, 1],
    ['melon', 'Melon', 'Melon', 'melon', '1 potong (150 g)', '1 slice (150 g)', 150, 51, 1.3, 12, 0.3, 11.8, 24, 1.4, 'buah', 0, 1],
    ['mangga', 'Mangga', 'Mango', 'mangga|mango', '1/2 buah (150 g)', '1/2 fruit (150 g)', 150, 90, 1.2, 22, 0.6, 20, 2, 2.4, 'buah', 0, 1],
    ['pir', 'Pir', 'Pear', 'pir|pear', '1 buah sedang', '1 medium', 170, 97, 0.6, 26, 0.2, 16.5, 2, 5.3, 'buah', 0, 1],
    ['anggur', 'Anggur', 'Grapes', 'anggur|grape', '15 butir (80 g)', '15 grapes (80 g)', 80, 55, 0.6, 14, 0.1, 12.4, 2, 0.7, 'buah', 0, 1],
    ['jambu', 'Jambu biji', 'Guava', 'jambu|guava', '1 buah (100 g)', '1 fruit (100 g)', 100, 68, 2.6, 14, 1, 9, 2, 5.4, 'buah', 0, 1],
    ['nanas', 'Nanas', 'Pineapple', 'nanas|nenas|pineapple', '1 potong (120 g)', '1 slice (120 g)', 120, 60, 0.6, 16, 0.1, 12, 1, 1.7, 'buah', 0, 1],
    ['alpukat', 'Alpukat', 'Avocado', 'alpukat|avocado|apokat', '1/2 buah (70 g)', '1/2 fruit (70 g)', 70, 112, 1.4, 6, 10.3, 0.5, 5, 4.7, 'buah', 0, 1],
    ['salak', 'Salak', 'Snake fruit (salak)', 'salak', '2 buah (80 g)', '2 fruits (80 g)', 80, 65, 0.4, 17, 0, 12, 1, 2, 'buah', 0, 1],
    ['buah-naga', 'Buah naga', 'Dragon fruit', 'buah naga|dragon fruit', '1/2 buah (150 g)', '1/2 fruit (150 g)', 150, 90, 2, 19, 0.6, 12, 0, 4.5, 'buah', 0, 1],
    ['strawberry', 'Stroberi', 'Strawberries', 'stroberi|strawberry', '8 buah (100 g)', '8 berries (100 g)', 100, 32, 0.7, 7.7, 0.3, 4.9, 1, 2, 'buah', 0, 1],
    ['rujak', 'Rujak buah', 'Fruit salad with palm-sugar sauce (rujak)', 'rujak', '1 porsi', '1 serving', 200, 190, 2.5, 42, 2.5, 33, 250, 4, 'buah', 0, 1],

    // ---------- hidangan lengkap ----------
    ['nasi-goreng', 'Nasi goreng', 'Fried rice', 'nasgor|nasi goreng|fried rice', '1 piring', '1 plate', 300, 520, 15, 70, 20, 4, 1100, 2, 'hidangan', 0.3, 0],
    ['nasi-goreng-telur', 'Nasi goreng + telur ceplok', 'Fried rice with fried egg', 'nasgor telur', '1 piring', '1 plate', 360, 640, 21, 70, 30, 4.5, 1300, 2, 'hidangan', 0.3, 0],
    ['mie-goreng', 'Mi goreng (warung)', 'Fried noodles', 'mie goreng|mi goreng|bakmi goreng|fried noodle', '1 piring', '1 plate', 300, 560, 14, 72, 24, 7, 1350, 3, 'hidangan', 0.5, 0],
    ['mie-ayam', 'Mi ayam', 'Chicken noodles (mie ayam)', 'mie ayam|mi ayam|chicken noodle', '1 mangkuk', '1 bowl', 350, 480, 20, 60, 17, 6, 1400, 3, 'hidangan', 0.5, 0],
    ['bakso-mangkuk', 'Bakso kuah + mi', 'Meatball soup with noodles', 'bakso|meatball soup', '1 mangkuk', '1 bowl', 450, 420, 20, 48, 16, 3, 1600, 2, 'hidangan', 0.3, 0],
    ['soto-ayam', 'Soto ayam (tanpa nasi)', 'Chicken soto soup (no rice)', 'soto|soto ayam', '1 mangkuk', '1 bowl', 350, 220, 18, 12, 11, 2, 1200, 2, 'hidangan', 0.5, 0],
    ['soto-betawi', 'Soto betawi (tanpa nasi)', 'Soto betawi (no rice)', 'soto betawi', '1 mangkuk', '1 bowl', 350, 420, 22, 10, 32, 3, 1300, 1.5, 'hidangan', 0.3, 0],
    ['rawon', 'Rawon (tanpa nasi)', 'Black beef soup (no rice)', 'rawon', '1 mangkuk', '1 bowl', 300, 240, 20, 8, 14, 1, 1000, 1.5, 'hidangan', 0.3, 0],
    ['sop-buntut', 'Sop buntut (tanpa nasi)', 'Oxtail soup (no rice)', 'sop buntut|oxtail', '1 mangkuk', '1 bowl', 400, 450, 30, 12, 31, 3, 1200, 2, 'hidangan', 0.5, 0],
    ['nasi-padang', 'Nasi Padang (rendang + sayur)', 'Padang rice (rendang + veg)', 'nasi padang|padang', '1 bungkus', '1 pack', 450, 750, 28, 85, 32, 5, 1400, 4, 'hidangan', 1, 0],
    ['nasi-campur', 'Nasi campur / warteg', 'Mixed rice (warteg)', 'nasi campur|warteg|mixed rice', '1 piring', '1 plate', 400, 620, 24, 80, 22, 6, 1200, 4, 'hidangan', 1, 0],
    ['nasi-kuning', 'Nasi kuning lengkap', 'Yellow rice set', 'nasi kuning|tumpeng', '1 porsi', '1 serving', 350, 590, 20, 70, 25, 4, 900, 2, 'hidangan', 0.3, 0],
    ['nasi-uduk-lengkap', 'Nasi uduk lengkap', 'Coconut rice set', 'nasi uduk lengkap', '1 porsi', '1 serving', 350, 620, 22, 66, 29, 5, 1000, 2, 'hidangan', 0.3, 0],
    ['nasi-kebuli', 'Nasi kebuli kambing', 'Lamb kebuli rice', 'kebuli|nasi kebuli|mandhi|biryani', '1 piring', '1 plate', 350, 690, 25, 75, 31, 3, 900, 2, 'hidangan', 0, 0],
    ['sate-ayam', 'Sate ayam + bumbu kacang', 'Chicken satay with peanut sauce', 'sate|sate ayam|satay', '10 tusuk', '10 skewers', 200, 450, 32, 18, 28, 10, 900, 2, 'hidangan', 0, 0],
    ['sate-kambing', 'Sate kambing', 'Goat satay', 'sate kambing|goat satay', '10 tusuk', '10 skewers', 200, 520, 34, 14, 37, 10, 800, 0.5, 'hidangan', 0, 0],
    ['gulai', 'Gulai ayam/kambing', 'Chicken/goat curry (gulai)', 'gulai|kari|curry', '1 porsi', '1 serving', 200, 330, 20, 8, 24, 2, 700, 1.5, 'hidangan', 0, 0],
    ['opor', 'Opor ayam', 'Chicken in coconut milk (opor)', 'opor', '1 potong + kuah', '1 piece + sauce', 200, 320, 20, 6, 24, 2, 700, 1, 'hidangan', 0, 0],
    ['ketoprak', 'Ketoprak', 'Ketoprak (tofu, noodles, peanut sauce)', 'ketoprak', '1 piring', '1 plate', 350, 520, 18, 64, 22, 12, 1100, 5, 'hidangan', 0.5, 0],
    ['siomay', 'Siomay bandung', 'Fish dumplings with peanut sauce', 'siomay|somay|dumpling', '1 porsi', '1 serving', 250, 380, 18, 40, 16, 8, 900, 3, 'hidangan', 0.3, 0],
    ['batagor', 'Batagor', 'Fried fish-tofu dumplings (batagor)', 'batagor', '1 porsi', '1 serving', 200, 450, 15, 42, 25, 8, 850, 3, 'hidangan', 0, 0],
    ['pempek', 'Pempek + cuko', 'Fish cake with vinegar sauce (pempek)', 'pempek|empek|mpek', '1 porsi (2 buah)', '1 serving (2 pcs)', 200, 400, 14, 60, 11, 18, 900, 1, 'hidangan', 0, 0],
    ['martabak-telur', 'Martabak telur', 'Savory egg martabak', 'martabak telur|martabak asin', '2 potong', '2 pieces', 120, 350, 12, 24, 23, 2, 550, 1, 'hidangan', 0.2, 0],
    ['kwetiau', 'Kwetiau goreng', 'Fried flat rice noodles', 'kwetiau|kwetiaw|char kway teow', '1 piring', '1 plate', 300, 580, 16, 74, 24, 6, 1300, 2.5, 'hidangan', 0.5, 0],
    ['burger', 'Burger daging', 'Beef burger', 'burger|hamburger', '1 buah', '1 burger', 200, 500, 25, 40, 26, 8, 900, 2, 'hidangan', 0.3, 0],
    ['pizza', 'Pizza', 'Pizza', 'pizza', '1 potong', '1 slice', 110, 290, 12, 33, 12, 4, 640, 2, 'hidangan', 0, 0],
    ['fried-chicken-set', 'Paket ayam goreng fast food + nasi', 'Fast-food fried chicken + rice', 'kfc|mcd|fast food|ayam crispy', '1 paket', '1 meal', 300, 650, 30, 60, 32, 1, 1200, 1, 'hidangan', 0, 0],
    ['sushi', 'Sushi roll', 'Sushi roll', 'sushi', '6 potong', '6 pieces', 180, 300, 10, 50, 6, 8, 600, 2, 'hidangan', 0.2, 0],
    ['nasi-ayam-geprek', 'Nasi + ayam geprek', 'Rice + smashed fried chicken', 'nasi geprek', '1 porsi', '1 serving', 300, 620, 28, 62, 28, 2, 750, 1.5, 'hidangan', 0, 0],
    ['nasi-pecel-lele', 'Nasi pecel lele', 'Rice with fried catfish', 'pecel lele|lele|catfish', '1 porsi', '1 serving', 350, 640, 25, 60, 33, 2, 800, 1.5, 'hidangan', 0.3, 0],
    ['indomie-telur', 'Mi instan + telur', 'Instant noodles with egg', 'indomie telur|mie telur', '1 mangkuk', '1 bowl', 160, 460, 15, 52, 21, 4, 1300, 2, 'hidangan', 0, 0],

    // ---------- camilan / jajan ----------
    ['gorengan', 'Gorengan (bakwan/tahu isi)', 'Fried fritter (bakwan/tahu isi)', 'gorengan|bakwan|bala bala|tahu isi|fritter', '1 buah', '1 piece', 50, 140, 3, 14, 8, 1, 180, 1, 'jajan', 0.2, 0],
    ['pisang-goreng', 'Pisang goreng', 'Fried banana', 'pisang goreng|fried banana|molen', '1 buah', '1 piece', 60, 160, 1.5, 24, 7, 10, 60, 1.5, 'jajan', 0, 0.5],
    ['risoles', 'Risoles', 'Risoles (savory crepe roll)', 'risol|risoles', '1 buah', '1 piece', 60, 170, 4, 16, 10, 1.5, 250, 0.8, 'jajan', 0, 0],
    ['lemper', 'Lemper ayam', 'Sticky rice roll with chicken', 'lemper', '1 buah', '1 piece', 60, 130, 4, 20, 3.5, 1, 150, 0.4, 'jajan', 0, 0],
    ['kue-lapis', 'Kue basah (lapis/klepon)', 'Traditional cake (kue basah)', 'kue|kue basah|lapis|klepon|onde', '1 potong', '1 piece', 50, 130, 1.5, 24, 3.5, 13, 40, 0.5, 'jajan', 0, 0],
    ['martabak-manis', 'Martabak manis', 'Sweet martabak', 'martabak manis|terang bulan', '1 potong', '1 slice', 80, 300, 6, 40, 13, 22, 250, 1, 'jajan', 0, 0],
    ['donat', 'Donat', 'Doughnut', 'donat|donut|doughnut', '1 buah', '1 piece', 55, 230, 3.5, 27, 12, 12, 200, 0.8, 'jajan', 0, 0],
    ['roti-manis', 'Roti manis isi', 'Sweet filled bun', 'roti manis|roti coklat|roti keju|bun', '1 buah', '1 bun', 70, 250, 6, 38, 8, 14, 230, 1.2, 'jajan', 0, 0],
    ['biskuit', 'Biskuit / kukis', 'Biscuits / cookies', 'biskuit|kukis|cookie|biscuit|roma|regal', '3 keping', '3 pieces', 30, 140, 2, 20, 5.5, 7, 100, 0.6, 'jajan', 0, 0],
    ['wafer', 'Wafer / cokelat batang', 'Wafer / chocolate bar', 'wafer|tango|chocolate|coklat|cokelat|silverqueen', '1 bungkus kecil', '1 small pack', 40, 210, 2.5, 24, 12, 16, 50, 1, 'jajan', 0, 0],
    ['keripik', 'Keripik kentang/singkong', 'Potato/cassava chips', 'keripik|kripik|chips|chitato|qtela', '1 bungkus kecil (35 g)', '1 small pack (35 g)', 35, 185, 2, 19, 11.5, 0.5, 210, 1.5, 'jajan', 0, 0],
    ['kerupuk', 'Kerupuk', 'Crackers (kerupuk)', 'kerupuk|krupuk|crackers', '2 buah', '2 pieces', 15, 75, 1, 10, 3.5, 0, 150, 0.2, 'jajan', 0, 0],
    ['kacang', 'Kacang tanah/almond', 'Peanuts / almonds', 'kacang|peanut|almond|nuts', '1 genggam (30 g)', '1 handful (30 g)', 30, 170, 7, 5, 14.5, 1.3, 5, 2.5, 'jajan', 0, 0],
    ['yogurt', 'Yogurt plain', 'Plain yogurt', 'yogurt|yoghurt', '1 cup (150 g)', '1 cup (150 g)', 150, 90, 5.5, 7, 4.5, 7, 70, 0, 'jajan', 0, 0],
    ['yogurt-buah', 'Yogurt rasa buah', 'Fruit yogurt', 'yogurt buah|cimory|fruit yogurt', '1 cup (150 g)', '1 cup (150 g)', 150, 150, 5, 25, 3, 21, 70, 0, 'jajan', 0, 0],
    ['es-krim', 'Es krim', 'Ice cream', 'es krim|ice cream', '1 scoop / cup kecil', '1 scoop / small cup', 70, 145, 2.5, 17, 7.5, 15, 55, 0.5, 'jajan', 0, 0],
    ['kue-kering', 'Kue kering (nastar/kastengel)', 'Butter cookies (nastar)', 'nastar|kastengel|putri salju|kue kering', '3 buah', '3 pieces', 30, 150, 2, 17, 8.5, 8, 70, 0.4, 'jajan', 0, 0],
    ['cilok', 'Cilok / cireng', 'Cilok / cireng (tapioca snack)', 'cilok|cireng|cimol|aci', '1 porsi', '1 serving', 100, 230, 3, 38, 7, 3, 450, 0.5, 'jajan', 0, 0],
    ['seblak', 'Seblak', 'Seblak (spicy crackers soup)', 'seblak', '1 mangkuk', '1 bowl', 300, 420, 12, 55, 17, 4, 1500, 2, 'hidangan', 0.3, 0],
    ['dimsum', 'Dimsum (siomay/hakau)', 'Dim sum', 'dimsum|dim sum|hakau|shumai', '4 buah', '4 pieces', 120, 240, 12, 22, 11, 2, 600, 1, 'jajan', 0, 0],
    ['kurma', 'Kurma', 'Dates', 'kurma|dates', '3 buah (24 g)', '3 dates (24 g)', 24, 70, 0.5, 18, 0, 16, 1, 2, 'buah', 0, 0.5],
    ['granola-bar', 'Granola / protein bar', 'Granola / protein bar', 'granola|protein bar|soyjoy|bar', '1 batang', '1 bar', 35, 140, 5, 19, 5, 8, 80, 2, 'jajan', 0, 0],

    // ---------- minuman ----------
    ['air', 'Air putih', 'Water', 'air|water|air mineral|aqua', '1 gelas (250 ml)', '1 glass (250 ml)', 250, 0, 0, 0, 0, 0, 0, 0, 'minum', 0, 0],
    ['teh-manis', 'Teh manis', 'Sweet tea', 'teh manis|es teh|sweet tea|teh', '1 gelas', '1 glass', 250, 90, 0, 22, 0, 22, 5, 0, 'minum', 0, 0],
    ['teh-tawar', 'Teh tawar', 'Unsweetened tea', 'teh tawar|plain tea|green tea|teh hijau', '1 gelas', '1 glass', 250, 2, 0, 0.5, 0, 0, 5, 0, 'minum', 0, 0],
    ['teh-botol', 'Teh kemasan', 'Bottled sweet tea', 'teh botol|teh pucuk|frestea|bottled tea', '1 botol (350 ml)', '1 bottle (350 ml)', 350, 120, 0, 30, 0, 28, 20, 0, 'minum', 0, 0],
    ['kopi-hitam', 'Kopi hitam tanpa gula', 'Black coffee', 'kopi hitam|americano|black coffee|espresso', '1 cangkir', '1 cup', 240, 5, 0.3, 0, 0, 0, 5, 0, 'minum', 0, 0],
    ['kopi-gula', 'Kopi hitam + gula', 'Coffee with sugar', 'kopi gula|kopi tubruk', '1 cangkir', '1 cup', 240, 45, 0.3, 10, 0, 10, 5, 0, 'minum', 0, 0],
    ['kopi-susu', 'Es kopi susu gula aren', 'Iced palm-sugar latte (kopi susu)', 'kopi susu|es kopi|latte|kopi kenangan|janji jiwa', '1 cup (300 ml)', '1 cup (300 ml)', 300, 220, 5, 32, 7, 28, 90, 0, 'minum', 0, 0],
    ['kopi-sachet', 'Kopi sachet 3in1', 'Instant 3-in-1 coffee', 'kopi sachet|3 in 1|good day|kapal api|nescafe', '1 sachet', '1 sachet', 200, 110, 1, 18, 4, 15, 40, 0, 'minum', 0, 0],
    ['susu', 'Susu UHT full cream', 'Full-cream milk', 'susu|milk|uht', '1 kotak (200 ml)', '1 carton (200 ml)', 200, 130, 6.5, 10, 7, 10, 100, 0, 'minum', 0, 0],
    ['susu-low', 'Susu low fat', 'Low-fat milk', 'susu low fat|skim|low fat milk', '1 kotak (200 ml)', '1 carton (200 ml)', 200, 90, 7, 10, 2.5, 10, 110, 0, 'minum', 0, 0],
    ['susu-coklat', 'Susu cokelat/stroberi', 'Chocolate/strawberry milk', 'susu coklat|susu cokelat|chocolate milk', '1 kotak (200 ml)', '1 carton (200 ml)', 200, 170, 6, 26, 5, 22, 120, 0.5, 'minum', 0, 0],
    ['susu-kedelai', 'Susu kedelai', 'Soy milk', 'susu kedelai|soy milk|soya', '1 gelas (250 ml)', '1 glass (250 ml)', 250, 110, 7, 10, 4.5, 7, 100, 1, 'minum', 0, 0],
    ['jus', 'Jus buah + gula', 'Fruit juice with sugar', 'jus|juice', '1 gelas', '1 glass', 250, 160, 1, 38, 0.5, 34, 10, 1, 'minum', 0, 0.5],
    ['jus-alpukat', 'Jus alpukat + SKM', 'Avocado juice with condensed milk', 'jus alpukat|avocado juice', '1 gelas', '1 glass', 300, 330, 4, 38, 18, 32, 60, 5, 'minum', 0, 0.5],
    ['boba', 'Bubble tea / boba', 'Bubble tea', 'boba|bubble tea|thai tea|milk tea', '1 cup (500 ml)', '1 cup (500 ml)', 500, 380, 3, 70, 9, 50, 80, 0, 'minum', 0, 0],
    ['soda', 'Minuman bersoda', 'Soft drink', 'soda|coca cola|sprite|fanta|softdrink', '1 kaleng (330 ml)', '1 can (330 ml)', 330, 140, 0, 35, 0, 35, 15, 0, 'minum', 0, 0],
    ['minuman-isotonik', 'Minuman isotonik', 'Isotonic drink', 'pocari|isotonik|mizone|isotonic', '1 botol (500 ml)', '1 bottle (500 ml)', 500, 125, 0, 31, 0, 31, 245, 0, 'minum', 0, 0],
    ['es-campur', 'Es campur / es buah', 'Mixed ice dessert', 'es campur|es buah|es teler|cendol|dawet', '1 mangkuk', '1 bowl', 300, 300, 2, 60, 6, 50, 60, 1.5, 'minum', 0, 0.5],
    ['wedang', 'Wedang jahe', 'Ginger drink', 'wedang|jahe|ginger', '1 gelas', '1 glass', 250, 70, 0, 18, 0, 17, 5, 0, 'minum', 0, 0],
    ['kelapa', 'Air kelapa muda', 'Coconut water', 'kelapa|coconut water|degan', '1 gelas', '1 glass', 250, 50, 0.5, 9, 0.5, 6, 60, 0, 'minum', 0, 0],

    // ---------- tambahan / bumbu ----------
    ['sambal', 'Sambal', 'Chili sauce (sambal)', 'sambal|chili', '1 sdm', '1 tbsp', 15, 20, 0.3, 2, 1.3, 1, 200, 0.4, 'jajan', 0, 0],
    ['kecap', 'Kecap manis', 'Sweet soy sauce', 'kecap|soy sauce', '1 sdm', '1 tbsp', 15, 40, 0.7, 9, 0, 8, 600, 0, 'jajan', 0, 0],
    ['mayones', 'Mayones', 'Mayonnaise', 'mayo|mayones|mayonnaise', '1 sdm', '1 tbsp', 14, 95, 0.1, 0.5, 10.5, 0.3, 90, 0, 'jajan', 0, 0],
    ['selai', 'Selai / meses', 'Jam / chocolate sprinkles', 'selai|meses|nutella|jam', '1 sdm', '1 tbsp', 20, 80, 0.5, 13, 3, 12, 10, 0.3, 'jajan', 0, 0],
    ['keju', 'Keju', 'Cheese', 'keju|cheese|cheddar|kraft', '1 lembar (20 g)', '1 slice (20 g)', 20, 70, 4, 1, 5.5, 0.5, 250, 0, 'lauk', 0, 0],
    ['gula', 'Gula pasir', 'Sugar', 'gula|sugar', '1 sdt', '1 tsp', 5, 20, 0, 5, 0, 5, 0, 0, 'jajan', 0, 0],
    ['madu', 'Madu', 'Honey', 'madu|honey', '1 sdm', '1 tbsp', 21, 64, 0, 17, 0, 17, 1, 0, 'jajan', 0, 0]
  ];

  const FOODS = R.map((r) => ({
    id: r[0], id_name: r[1], en_name: r[2], keys: r[3], id_portion: r[4], en_portion: r[5], grams: r[6],
    kcal: r[7], protein: r[8], carbs: r[9], fat: r[10], sugar: r[11], sodium: r[12], fiber: r[13],
    group: r[14], veg: r[15], fruit: r[16]
  }));
  window.WB_FOODS = FOODS;
})();
