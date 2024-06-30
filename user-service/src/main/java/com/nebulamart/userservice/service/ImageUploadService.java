package com.nebulamart.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import java.time.Duration;

@Service
public class ImageUploadService {
    @Autowired
    private S3Presigner s3Presigner;

    @Value("${s3-bucket.name}")
    private String bucketName;

    public String getPreSignedUrl(String keyName) {
        try {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .build();
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // Set the presigned URL to expire after 10 minutes
                    .putObjectRequest(objectRequest)
                    .build();
            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
            return presignedRequest.url().toExternalForm();
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return null;
        }
    }

}
