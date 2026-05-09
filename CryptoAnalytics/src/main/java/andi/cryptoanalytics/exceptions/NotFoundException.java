package andi.cryptoanalytics.exceptions;

import java.util.UUID;

public class NotFoundException extends RuntimeException {
    public NotFoundException(UUID id) {
        super("La risorsa con id " + id + " non Ã¨ stata trovata!");
    }
}
