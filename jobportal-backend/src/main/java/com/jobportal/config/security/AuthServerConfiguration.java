package com.jobportal.config.security;

import com.jobportal.config.security.custom.*;
import com.jobportal.service.authService.UserService;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.*;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
import org.springframework.security.oauth2.provider.token.*;
import org.springframework.security.oauth2.provider.token.store.*;
import java.util.Arrays;
import static com.jobportal.config.security.SecurityConstants.*;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Configuration
@EnableAuthorizationServer
public class AuthServerConfiguration extends AuthorizationServerConfigurerAdapter {

    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserService userDetailsService;
    private final CustomTokenEnhancer customTokenEnhancer;
    private final Environment environment;

    public AuthServerConfiguration(AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder, UserService userDetailsService, CustomTokenEnhancer customTokenEnhancer, Environment environment) {
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.customTokenEnhancer = customTokenEnhancer;
        this.environment = environment;
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer configurer) throws Exception {
        configurer.inMemory()
            // APPLICANT client
            .withClient(APPLICANT_ID)
            .secret(passwordEncoder.encode(""))
            .authorizedGrantTypes(GRANT_TYPE_PASSWORD, AUTHORIZATION_CODE, REFRESH_TOKEN, IMPLICIT)
            .scopes(SCOPE_READ, SCOPE_WRITE, TRUST)
            .accessTokenValiditySeconds(APPLICANT_ACCESS_TOKEN_VALIDITY_SECONDS)
            .refreshTokenValiditySeconds(APPLICANT_REFRESH_TOKEN_VALIDITY_SECONDS)
            .and()
            // COMPANY client
            .withClient(COMPANY_ID)
            .secret(passwordEncoder.encode(""))
            .authorizedGrantTypes(GRANT_TYPE_PASSWORD, AUTHORIZATION_CODE, REFRESH_TOKEN, IMPLICIT)
            .scopes(SCOPE_READ, SCOPE_WRITE, TRUST)
            .accessTokenValiditySeconds(COMPANY_ACCESS_TOKEN_VALIDITY_SECONDS)
            .refreshTokenValiditySeconds(COMPANY_REFRESH_TOKEN_VALIDITY_SECONDS);
    }

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
        endpoints.tokenStore(tokenStore())
                 .tokenEnhancer(tokenEnhancer())
                 .authenticationManager(authenticationManager)
                 .accessTokenConverter(accessTokenConverter())
                 .userDetailsService(userDetailsService)
                 .prefix(environment.getRequiredProperty("spring.mvc.servlet.path"))
                 .exceptionTranslator(ex ->
                     ResponseEntity.status(UNAUTHORIZED).body(new CustomOauthException(ex.getMessage())));
    }

    @Bean
    public JwtAccessTokenConverter accessTokenConverter() {
        JwtAccessTokenConverter c = new JwtAccessTokenConverter();
        c.setSigningKey(TOKEN_SIGN_IN_KEY);
        return c;
    }

    @Bean
    public TokenStore tokenStore() { return new JwtTokenStore(accessTokenConverter()); }

    @Bean
    public TokenEnhancer tokenEnhancer() {
        TokenEnhancerChain chain = new TokenEnhancerChain();
        chain.setTokenEnhancers(Arrays.asList(customTokenEnhancer, accessTokenConverter()));
        return chain;
    }
}
