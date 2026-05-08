package com.jobportal.exception.dto;

import org.springframework.http.HttpStatus;

public class OtpValidException extends RuntimeException {

    private String message;
    private HttpStatus httpStatus;
    private int code;

    public OtpValidException(String message) {
        super(message);
        this.message = message;
    }

    public OtpValidException(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public OtpValidException(int code, String message, Throwable cause) {
        super(cause);
        this.message = message;
        this.code = code;
    }

    public OtpValidException(String message, Throwable cause) {
        super(message, cause);
        this.message = message;
    }

    public OtpValidException(String message, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.message = message;
        this.httpStatus = httpStatus;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }
}
