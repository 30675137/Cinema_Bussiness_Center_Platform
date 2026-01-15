package com.cinema.common.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String message) {
        super("NOT_FOUND", message);
    }

    public ResourceNotFoundException(String resourceType, String id) {
        super("NOT_FOUND", String.format("%s with id %s not found", resourceType, id));
    }
}
