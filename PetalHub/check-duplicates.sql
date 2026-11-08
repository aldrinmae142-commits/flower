SELECT a.code AS order_1, b.code AS order_2, a.user_id, a.total,
       a.created_at AS time_1, b.created_at AS time_2, a.status AS status_1, b.status AS status_2
FROM orders a
JOIN orders b
  ON  a.user_id = b.user_id
  AND a.total = b.total
  AND a.fulfillment = b.fulfillment
  AND a.code < b.code
  AND ABS(TIMESTAMPDIFF(MINUTE, a.created_at, b.created_at)) <= 30
  AND (SELECT GROUP_CONCAT(CONCAT(product_id, 'x', qty, '/', arrangement, '/', line_name, '/', COALESCE(wrap_design, ''), '/', wrap_color, '/', wrap_notes, '/', wrap_fee) ORDER BY product_id, arrangement, line_name, wrap_design, wrap_color, wrap_notes, qty) FROM order_items WHERE order_code = a.code)
    = (SELECT GROUP_CONCAT(CONCAT(product_id, 'x', qty, '/', arrangement, '/', line_name, '/', COALESCE(wrap_design, ''), '/', wrap_color, '/', wrap_notes, '/', wrap_fee) ORDER BY product_id, arrangement, line_name, wrap_design, wrap_color, wrap_notes, qty) FROM order_items WHERE order_code = b.code)
ORDER BY a.created_at;

SELECT user_id, checkout_key, COUNT(*) AS times_saved
FROM orders WHERE checkout_key IS NOT NULL
GROUP BY user_id, checkout_key HAVING COUNT(*) > 1;
