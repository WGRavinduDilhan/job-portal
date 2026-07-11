package com.jobportal.config.security;

public class SecurityConstants {
    public static final String APPLICANT_ID = "applicant";
    public static final String COMPANY_ID   = "company";

    protected static final int APPLICANT_ACCESS_TOKEN_VALIDITY_SECONDS  = 86400;
    protected static final int APPLICANT_REFRESH_TOKEN_VALIDITY_SECONDS = 2592000;
    protected static final int COMPANY_ACCESS_TOKEN_VALIDITY_SECONDS    = 86400;
    protected static final int COMPANY_REFRESH_TOKEN_VALIDITY_SECONDS   = 2592000;

    protected static final String GRANT_TYPE_PASSWORD = "password";
    protected static final String AUTHORIZATION_CODE  = "authorization_code";
    protected static final String REFRESH_TOKEN       = "refresh_token";
    protected static final String IMPLICIT            = "implicit";
    protected static final String SCOPE_READ          = "read";
    protected static final String SCOPE_WRITE         = "write";
    protected static final String TRUST               = "trust";

    public static final  String HEADER_AUTH = "Authorization";
}
