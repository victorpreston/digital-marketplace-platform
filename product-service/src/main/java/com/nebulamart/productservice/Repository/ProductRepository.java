package com.nebulamart.productservice.Repository;

import com.nebulamart.productservice.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import java.util.List;
import java.util.Map;

@Repository
public class ProductRepository {
    private final DynamoDbTable<Product> productTable;

    @Autowired
    public ProductRepository(DynamoDbTable<Product> productTable) {
        this.productTable = productTable;
    }

    public int getProductsCount() {
        return (int) productTable.scan().items().stream().count();
    }

    public void saveProduct(Product product) {
        productTable.putItem(product);
    }

    public Product getProductById(String id) {
        return productTable.getItem(r -> r.key(Key.builder().partitionValue(id).build()));
    }

    public void updateProduct(Product product) {
        productTable.updateItem(product);
    }

    public void deleteProduct(Key productKey) {
        productTable.deleteItem(r -> r.key(productKey));
    }

    public List<Product> searchProducts(Map<String, Object> searchParams, int page, int productsPerPage) {
        return productTable.scan().items().stream().filter(product -> {
            boolean match = true;
            if (!product.getStatus().equals("ACTIVE")) { return false; }
            for (Map.Entry<String, Object> entry : searchParams.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                if (key.equals("category")) {
                    match = match && product.getCategory().equals(value);
                } else if (key.equals("text")) {
                    match = match && (product.getName().contains((String) value) || product.getDescription().contains((String) value));
                } else if (key.equals("minPrice")) {
                    match = match && product.getBasePrice() >= (Double) value;
                } else if (key.equals("maxPrice")) {
                    match = match && product.getBasePrice() <= (Double) value;
                }
            }
            return match;
        }).skip((long) (page - 1) * productsPerPage).limit(productsPerPage).toList();
    }

    public List<Product> getProductsByPage(int page, int productsPerPage) {
        return productTable.scan().items().stream().filter(product ->
                product.getStatus().equals("ACTIVE")).skip((long) (page - 1) * productsPerPage).limit(productsPerPage).toList();
    }

}
