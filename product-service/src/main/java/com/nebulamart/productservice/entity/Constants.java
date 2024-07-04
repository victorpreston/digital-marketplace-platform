package com.nebulamart.productservice.entity;
import java.util.List;

public class Constants {
    public static List<String> productCategoryList = List.of("ELECTRONICS", "FASHION", "HOME_APPLIANCES", "EDUCATION", "SPORTS", "MEDICAL", "GROCERY", "BEAUTY", "FURNITURE", "AUTOMOBILE", "OTHERS");
    public static List<String> productStatusList = List.of("COURIER_UNASSIGNED", "ACTIVE", "INACTIVE");
    public static List<String> contractStatusList = List.of("COURIER_ACCEPTANCE_PENDING", "COURIER_REJECTED", "ACTIVE", "COURIER_CANCELLED", "INACTIVE");
}
