package com.jobportal.dto.common;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommonResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public CommonResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
