package com.nebulamart.productservice.Repository;

import com.nebulamart.productservice.entity.Contract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import java.util.ArrayList;
import java.util.List;
import static software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional.keyEqualTo;

@Repository
public class ContractRepository {
    private final DynamoDbTable<Contract> contractTable;
    private final DynamoDbIndex<Contract> contractTableCourierIndex;
    private final DynamoDbIndex<Contract> contractTableSellerIndex;

    @Autowired
    public ContractRepository(DynamoDbTable<Contract> contractTable, DynamoDbIndex<Contract> contractTableCourierIndex, DynamoDbIndex<Contract> contractTableSellerIndex) {
        this.contractTable = contractTable;
        this.contractTableCourierIndex = contractTableCourierIndex;
        this.contractTableSellerIndex = contractTableSellerIndex;
    }

    public Contract getContractById(String contractId) {
        return contractTable.getItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
    }

    public List<Contract> getContractsBySellerId(String sellerId) {
        PageIterable<Contract> contractsOfSeller = (PageIterable<Contract>) contractTableSellerIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(sellerId))));
        List<Contract> contracts = new ArrayList<>();
        for (Contract contract : contractsOfSeller.items()) {
            contracts.add(contract);
        }
        return contracts;
    }

    public List<Contract> getContractsByCourierId(String courierId) {
        PageIterable<Contract> contractsOfCourier = (PageIterable<Contract>) contractTableCourierIndex.query(r -> r.queryConditional(keyEqualTo(k -> k.partitionValue(courierId))));
        List<Contract> contracts = new ArrayList<>();
        for (Contract contract : contractsOfCourier.items()) {
            contracts.add(contract);
        }
        return contracts;
    }

    public void saveContract(Contract contract) {
        contractTable.putItem(contract);
    }

    public void updateContract(Contract contract) {
        contractTable.updateItem(contract);
    }

    public void deleteContract(String contractId) {
        contractTable.deleteItem(r -> r.key(Key.builder().partitionValue(contractId).build()));
    }



}
