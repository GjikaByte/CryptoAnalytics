package andi.cryptoanalytics.controllers;

import andi.cryptoanalytics.DTOs.*;

import andi.cryptoanalytics.entities.Utente;
import andi.cryptoanalytics.exceptions.ValidationException;
import andi.cryptoanalytics.services.*;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthControllerUtente {
    private final AuthServiceUtente authService;
    private final UtenteService utenteService;
    private final CryptoService cryptoService;


    public AuthControllerUtente(AuthServiceUtente authService, UtenteService utenteService, CryptoService cryptoService) {
        this.authService = authService;
        this.utenteService = utenteService;
        this.cryptoService= cryptoService;
    }
    // POST http://localhost:3001/auth/login
    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginDTO body) {

        return new LoginResponseDTO(this.authService.checkCredentialsAndGenerateToken(body));
    }

    // POST http://localhost:3001/auth/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Utente createUtente(@RequestBody @Validated UtenteDTO payload, BindingResult validationResult) {

        if (validationResult.hasErrors()) {
            List<String> errorsList = validationResult.getFieldErrors()
                    .stream()
                    .map(fieldError -> fieldError.getDefaultMessage())
                    .toList();

            throw new ValidationException(errorsList);
        } else {
            return this.utenteService.save(payload);
        }
    }
    // DELETE http://localhost:3001/auth/{utenteId}
    @DeleteMapping("/{utenteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void findByIdAndDelete(@PathVariable UUID utenteId) {
        this.utenteService.findByIdAndDelete(utenteId);
    }
}
