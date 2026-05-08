package com.jobportal.exception.dto;

public class ErrorMessageResponse {

    private boolean success;
    private String message;
    private int code;

    public ErrorMessageResponse() {
    }

    public ErrorMessageResponse(boolean success, String message, int code) {
        this.success = success;
        this.message = message;
        this.code = code;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }
}
