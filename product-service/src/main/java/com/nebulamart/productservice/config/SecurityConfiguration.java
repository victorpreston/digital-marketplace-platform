package com.nebulamart.productservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.web.SecurityFilterChain;

import java.util.*;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/auth/**").permitAll()
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/open/**").permitAll()
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/customer/**").hasAuthority("ROLE_CUSTOMER")
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/courier/**").hasAuthority("ROLE_COURIER")
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/seller/**").hasAuthority("ROLE_SELLER")
                )
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(new JwtConverter())
                        )
                );
        return http.build();
    }

    private class JwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

        @Override
        public AbstractAuthenticationToken convert(Jwt source) {
            Map<String, Object> attributes = source.getClaims();
            String role = (String) attributes.get("custom:role");
            Boolean account_verified = (Boolean) attributes.get("email_verified");

            Collection<GrantedAuthority> grantedAuthorities = new ArrayList<>();

            if (role != null) {
                grantedAuthorities.add(new OAuth2UserAuthority("ROLE_" + role, attributes));
            }

            if (Objects.equals(account_verified, true)) {
                grantedAuthorities.add(new OAuth2UserAuthority("ACCOUNT_VERIFIED", attributes));
            }

            AbstractAuthenticationToken token = new JwtAuthenticationToken(source, grantedAuthorities);
            return token;

        }
    }
}
