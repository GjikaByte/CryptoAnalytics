package andi.cryptoanalytics.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UtenteDTO {
    @NotBlank(message = "Lo username Ã¨ un campo obbligatorio")
    @Size(min = 2, max = 10, message = "Lo username deve essere tra i 2 e i 10 caratteri")
    private String username;
    @NotBlank(message = "Il nome proprio Ã¨ un campo obbligatorio")
    @Size(min = 2, max = 30, message = "Il nome proprio deve essere tra i 2 e i 30 caratteri")
    private String nome;
    @NotBlank(message = "Il cognome Ã¨ un campo obbligatorio")
    @Size(min = 2, max = 30, message = "Il cognome deve essere tra i 2 e i 30 caratteri")
    private String cognome;
    @NotBlank(message = "L'email Ã¨ obbligatoria")
    @Email(message = "L'indirizzo email inserito non Ã¨ nel formato corretto!")
    private String email;
    @Size(min = 4, message = "La password deve avere almeno 4 caratteri")
    @Pattern(regexp = "^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{4,}$", message = "La password deve contenere una maiuscola, una minuscola ecc ecc ...")
    private String password;
}
