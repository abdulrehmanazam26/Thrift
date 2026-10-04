import mysql from "mysql2/promise";

const catalog = [
  ["7c000000-0000-4000-8000-000000000001", "comptoir-des-cotonniers-piece", "Comptoir des Cotonniers Piece", "Comptoir des Cotonniers", "Comptoir_des_Cotonniers_try-on-preview.png", 2000, "Good", 1],
  ["7c000000-0000-4000-8000-000000000002", "dolce-gabbana-piece", "Dolce & Gabbana Piece", "Dolce & Gabbana", "Dolce_and_Gabbana_try-on-preview.png", 2000, "Premium", 1],
  ["7c000000-0000-4000-8000-000000000003", "zara-basic-piece-1", "Zara Basic Piece 1", "Zara", "Zara_Basic_try-on-preview-1.png", 2000, "Good", 1],
  ["7c000000-0000-4000-8000-000000000004", "zara-basic-piece-2", "Zara Basic Piece 2", "Zara", "Zara_Basic_try-on-preview-2.png", 2000, "Good", 1],
  ["7c000000-0000-4000-8000-000000000005", "zara-basic-piece-3", "Zara Basic Piece 3", "Zara", "Zara_Basic_try-on-preview-3.png", 2000, "Good", 1],
  ["7c000000-0000-4000-8000-000000000006", "zara-basic-piece-4", "Zara Basic Piece 4", "Zara", "Zara_Basic_try-on-preview-4.png", 1100, "Good", 1],
  ["7c000000-0000-4000-8000-000000000007", "massimo-dutti-blue-piece", "Massimo Dutti Blue Piece", "Massimo Dutti", "Massimo_Dutti_try-on-preview-blue.png", 2000, "Excellent", 1],
  ["7c000000-0000-4000-8000-000000000008", "massimo-dutti-rust-piece", "Massimo Dutti Rust Piece", "Massimo Dutti", "Massimo_Dutti_try-on-preview-rust.png", 1500, "Excellent", 1],
  ["7c000000-0000-4000-8000-000000000009", "massimo-dutti-yellow-piece", "Massimo Dutti Yellow Piece", "Massimo Dutti", "Massimo_Dutti_try-on-preview-yellow.png", 1300, "Very Good", 1],
  ["7c000000-0000-4000-8000-000000000010", "zara-knit-piece", "Zara Knit Piece", "Zara", "Zara_Knit_try-on-preview.png", 1200, "Very Good", 1],
  ["7c000000-0000-4000-8000-000000000011", "zara-piece", "Zara Piece", "Zara", "Zara_try-on-preview.png", 1500, "Excellent", 0],
];

const description = "A one-of-a-kind pre-loved find. Please check the photos and ask us for measurements or condition details before ordering.";
const notes = "Pre-loved piece. Contact us for specific condition details.";
const connection = await mysql.createConnection(process.env.MYSQL_URL);

try {
  await connection.beginTransaction();
  for (const [id, slug, name, brand, file, salePrice, condition, stock] of catalog) {
    const status = stock ? "active" : "sold";
    await connection.execute(
      `INSERT INTO products (id, product_name, slug, sku, brand, full_description, condition_grade, condition_notes, category_id, gender, size_label, color, price, sale_price, stock, status, style_tags, defect_notes, collection_tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Women', 'Ask for size', 'See photos', ?, ?, ?, ?, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY('the-edit'))
       ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), brand=VALUES(brand), full_description=VALUES(full_description), condition_grade=VALUES(condition_grade), condition_notes=VALUES(condition_notes), category_id=VALUES(category_id), price=VALUES(price), sale_price=VALUES(sale_price), stock=VALUES(stock), status=VALUES(status), updated_at=NOW()`,
      [id, name, slug, `TK-${slug}`.slice(0, 80), brand, description, condition, notes, "10000000-0000-4000-8000-000000000203", salePrice * 2, salePrice, stock, status],
    );
    await connection.execute("DELETE FROM product_images WHERE product_id = ?", [id]);
    await connection.execute(
      "INSERT INTO product_images (id, product_id, image_path, alt_text, is_primary, sort_order) VALUES (?, ?, ?, ?, TRUE, 0)",
      [`8c000000-0000-4000-8000-${id.slice(-12)}`, id, `/images/products/${file}`, name],
    );
  }
  await connection.commit();
  console.log(`Seeded ${catalog.length} catalog products.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
