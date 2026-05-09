package andi.cryptoanalytics.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordDTO(
        @NotBlank(message = "La password attuale è obbligatoria")
        String oldPassword,

        @NotBlank(message = "La nuova password è obbligatoria")
        @Size(min = 4, message = "La nuova password deve avere almeno 4 caratteri")
        String newPassword
) {}
