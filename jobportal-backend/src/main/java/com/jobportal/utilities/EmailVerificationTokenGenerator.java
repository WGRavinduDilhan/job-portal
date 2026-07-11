package com.jobportal.utilities;

import com.jobportal.exception.dto.CustomServiceException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class EmailVerificationTokenGenerator {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationTokenGenerator.class);

    private final DateGenerator dateGenerator;
    private final String secret;

    public EmailVerificationTokenGenerator(DateGenerator dateGenerator,
                                           @Value("${jobportal.jwt.email-verification-secret}") String secret) {
        this.dateGenerator = dateGenerator;
        this.secret = secret;
    }

    public static final String EMAIL_CLAIM = "email";


    private Jws<Claims> getClaimsJws(String auth, SecretKey secretKey) {
        try {
            return Jwts.parser().setSigningKey(secretKey).parseClaimsJws(auth);
        } catch (Exception e) {
        log.error(e.getMessage());
            if (e.getMessage().toLowerCase().startsWith("jwt expired")){
                throw new CustomServiceException("Email Verification Link Expired!");
            }else{
            throw new CustomServiceException("Something went wrong, please try again");
            }
        }
    }

    public String generate(long userId, String email) {

        Date issued = new Date();
        SecretKey secretKey = Keys.hmacShaKeyFor((secret).getBytes());

        return Jwts.builder()
                .setIssuer("jobportal")
                .setSubject(String.valueOf(userId))
                .setIssuedAt(issued)
                .setExpiration(dateGenerator.changeDateFromMinutes(new Date(), 30))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .claim(EMAIL_CLAIM, email)
                .compact();
    }

    public Jws<Claims> verify(String auth) {
        SecretKey secretKey = Keys.hmacShaKeyFor((secret).getBytes());
        return getClaimsJws(auth, secretKey);
    }

}
