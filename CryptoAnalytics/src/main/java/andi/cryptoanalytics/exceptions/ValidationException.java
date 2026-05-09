package andi.cryptoanalytics.exceptions;

import lombok.Getter;

import java.util.List;

@Getter
public class ValidationException extends RuntimeException {
	private List<String> errorsMessages;

	public ValidationException(List<String> errorsMessages) {

		super("Ci sono stati errori nel payload");
		this.errorsMessages = errorsMessages;
	}
}
