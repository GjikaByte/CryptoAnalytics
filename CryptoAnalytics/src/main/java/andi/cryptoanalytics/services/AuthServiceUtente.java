package andi.cryptoanalytics.services;

import andi.cryptoanalytics.DTOs.LoginDTO;
import andi.cryptoanalytics.entities.Utente;
import andi.cryptoanalytics.exceptions.UnauthorizedException;
import andi.cryptoanalytics.security.JWTToolsUtente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceUtente {

    private final UtenteService utenteService;
    private final JWTToolsUtente jwtTools;
    private final PasswordEncoder bcrypt;

    @Autowired
    public AuthServiceUtente(UtenteService utenteService, JWTToolsUtente jwtTools, PasswordEncoder bcrypt) {
        this.utenteService = utenteService;
        this.jwtTools = jwtTools;
        this.bcrypt = bcrypt;
    }

    public String checkCredentialsAndGenerateToken(LoginDTO body) {
        Utente found = this.utenteService.findByEmail(body.email());
        if (bcrypt.matches(body.password(), found.getPassword())) {
            String accessToken = jwtTools.generateToken(found);
            return accessToken;
        } else {
            throw new UnauthorizedException("Credenziali errate!");
        }
    }
}
