package com.nebulamart.orderservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Base64;
import java.util.Map;

public class JwtParser {
        private final String jwt;
        private String cognitoUsername;
        private String email;
        private String role;

        public JwtParser(String jwt) {
            this.jwt = jwt;
        }

        public void parseJwt() throws JsonProcessingException {
            String[] parts = this.jwt.split("\\.");
            byte[] decodedBytes = Base64.getDecoder().decode(parts[1]);
            String decodedString = new String(decodedBytes);
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> decodedObj = objectMapper.readValue(decodedString, Map.class);
            cognitoUsername = decodedObj.get("cognito:username").toString();
            email = decodedObj.get("email").toString();
            role = decodedObj.get("custom:role").toString();
        }

        public String getCognitoUsername() {
            return cognitoUsername;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }
}
