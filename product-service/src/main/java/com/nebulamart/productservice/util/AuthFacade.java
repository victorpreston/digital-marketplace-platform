package com.nebulamart.productservice.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.stereotype.Component;

@Component
public class AuthFacade {

    public WrappedUser getWrappedUser(String accessToken) throws JsonProcessingException {
        JwtParser jwtParser = new JwtParser(accessToken);
        jwtParser.parseJwt();
        return new WrappedUser(jwtParser.getCognitoUsername(), jwtParser.getRole(), jwtParser.getEmail());
    }

    public String getCognitoUsername(WrappedUser wrappedUser) {
        return wrappedUser.getCognitoUsername();
    }

    public String getRole(WrappedUser wrappedUser) {
        return wrappedUser.getRole();
    }

    public String getEmail(WrappedUser wrappedUser) {
        return wrappedUser.getEmail();
    }


}