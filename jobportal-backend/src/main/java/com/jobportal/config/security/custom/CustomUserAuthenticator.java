package com.jobportal.config.security.custom;

import com.jobportal.exception.dto.CustomAccessDeniedException;
import com.jobportal.exception.dto.CustomAuthenticationException;
import com.jobportal.exception.dto.CustomServiceException;
import com.jobportal.constants.AppConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.codec.binary.Base64;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

import static org.springframework.security.oauth2.common.exceptions.OAuth2Exception.INVALID_TOKEN;

public class CustomUserAuthenticator {

    private static final Logger log = LoggerFactory.getLogger(CustomUserAuthenticator.class);

    /**
     * This can use to validate the given user id is belong to the given token.
     * @param id       the user's id to check
     * @param jwtToken the user's access token.
     * @throws CustomAccessDeniedException if not authorized by any means.
     */
    public static void checkPublicUserIdWithToken(long id, String jwtToken) {
        try {
            log.info("\nChecking id with token: {}", id);
            if (id != getUserFromToken(jwtToken).getLong("id"))
                throw new CustomAccessDeniedException(403, AppConstants.DetailConstants.FORBIDDEN_RESOURCE);
            log.info("\nuser id matches with id: {}", id);

        } catch (Exception e) {
            log.error("\nUnauthorized token: {}\n", e.getMessage());
            throw new CustomAccessDeniedException(403, AppConstants.DetailConstants.FORBIDDEN_RESOURCE);
        }
    }

    /**
     * This can use to validate the given user mobile is belong to the given token.
     *
     * @param mobile   the user's mobile to check
     * @param jwtToken the user's access token.
     * @throws CustomAccessDeniedException if not authorized by any means.
     */
    public static void checkPublicUserMobileWithToken(String mobile, String jwtToken) {
        try {
            log.info("\nChecking mobile with token: {}", mobile);
            if (!mobile.equals(getUserFromToken(jwtToken).getString("mobile")))
                throw new CustomAccessDeniedException(403, AppConstants.DetailConstants.FORBIDDEN_RESOURCE);
            log.info("\nuser id matches with mobile: {}", mobile);

        } catch (Exception e) {
            log.error("\nUnauthorized token: {}\n", e.getMessage());
            throw new CustomAccessDeniedException(403, AppConstants.DetailConstants.FORBIDDEN_RESOURCE);
        }
    }

    /**
     * this can use to get user id from th given JWT.
     *
     * @param jwtToken the user token
     * @return the user's id
     */
    public static long getUserIdFromToken(String jwtToken) {
        return getUserFromToken(jwtToken).getLong("id");
    }

    public static Date getLastLogOutTimeFromToken(String jwtToken) {
        try {
            JSONObject tokenJson = getJsonObjectFromJwt(jwtToken);
            return new Date(tokenJson.getLong("lastLogOutTime"));
        }catch (Exception ex){
            log.error(ex.getMessage());
            throw new CustomAuthenticationException(401,INVALID_TOKEN);
        }
    }


    public static String getUserRoleFromToken(String jwtToken) {
        JSONObject tokenJson = getJsonObjectFromJwt(jwtToken);
        return tokenJson.getJSONObject("user").getJSONArray("authorities").getJSONObject(0).getString("authority");
    }

    private static JSONObject getUserFromToken(String jwtToken) {
        JSONObject tokenJson = getJsonObjectFromJwt(jwtToken);
        JSONObject tokenUserJson = tokenJson.getJSONObject("user");
        return tokenUserJson.getJSONObject("userDetails");
    }

    public static JSONObject getJsonObjectFromJwt(String jwtToken) {
        try {
            log.debug("\nGet JSON from JWT : ");

            if (jwtToken.startsWith("Bearer")){
                jwtToken = jwtToken.split(" ")[1];
            }
            /* ~~~~~~~~~~~ Decode JWT ~~~~~~~~~~~*/
            String[] split_string = jwtToken.split("\\.");
            String base64EncodedBody = split_string[1];

            /*~~~~~~~~~ JWT Header ~~~~~~~*/
            Base64 base64Url = new Base64(true);

            /* ~~~~~~~~~ JWT Body ~~~~~~~~~*/
            String body = new String(base64Url.decode(base64EncodedBody));

            return new JSONObject(body);
        } catch (IndexOutOfBoundsException | IllegalArgumentException |
                 IllegalStateException | JSONException | NullPointerException n) {
            /*token is invalid or user is not found if hits here.*/
            log.error("Failed to get JSON from JWT: {}\tError: {} ", jwtToken, n);
            throw new CustomServiceException(400, INVALID_TOKEN);
        }
    }

}
