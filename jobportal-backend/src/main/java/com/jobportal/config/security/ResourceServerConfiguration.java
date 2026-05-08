package com.jobportal.config.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.*;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;
import org.springframework.security.oauth2.provider.error.OAuth2AccessDeniedHandler;

@Configuration
@EnableResourceServer
@EnableAsync
public class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {

    private static final String RESOURCE_ID = "resource_id";
    private final Environment environment;

    public ResourceServerConfiguration(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void configure(ResourceServerSecurityConfigurer resources) {
        resources.resourceId(RESOURCE_ID).stateless(false);
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        String base = environment.getRequiredProperty("spring.mvc.servlet.path");
        http.authorizeRequests()
            // Public endpoints (no token needed)
            .antMatchers(base + "/applicant/signup",
                         base + "/applicant/account/verify",
                         base + "/company/signup",
                         base + "/company/account/verify",
                         base + "/actuator/**").permitAll()
            // All other endpoints require authentication
            .antMatchers(base + "/applicant/**",
                         base + "/company/**",
                         base + "/jobs/**").access("hasAnyRole('ROLE_USER')")
            .and().csrf().disable()
            .exceptionHandling().accessDeniedHandler(new OAuth2AccessDeniedHandler());
    }
}
