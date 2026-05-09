package andi.cryptoanalytics.exceptions;

public class NotFoundEmailException extends RuntimeException {
    public NotFoundEmailException(String email) {
        super("La risorsa con email " + email + " non Ã¨ stata trovata!");
    }
}
