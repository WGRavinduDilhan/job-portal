package com.jobportal.dto.common;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommonResponse<T> {
    private boolean success;
    private String message;
    private T data;
}
