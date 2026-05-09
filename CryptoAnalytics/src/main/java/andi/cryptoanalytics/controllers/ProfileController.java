package andi.cryptoanalytics.controllers;

import andi.cryptoanalytics.DTOs.ChangePasswordDTO;
import andi.cryptoanalytics.entities.Utente;
import andi.cryptoanalytics.exceptions.ValidationException;
import andi.cryptoanalytics.services.UtenteService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class ProfileController {

    private final UtenteService utenteService;

    @GetMapping
    public Utente getMe(@AuthenticationPrincipal Utente authUser) {
        return utenteService.findById(authUser.getId_utente());
    }

    @PutMapping("/password")
    public Utente changePassword(
            @AuthenticationPrincipal Utente authUser,
            @RequestBody @Validated ChangePasswordDTO body,
            BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            List<String> errors = validationResult.getFieldErrors().stream()
                    .map(e -> e.getDefaultMessage())
                    .toList();
            throw new ValidationException(errors);
        }
        return utenteService.changePassword(authUser, body.oldPassword(), body.newPassword());
    }
}
