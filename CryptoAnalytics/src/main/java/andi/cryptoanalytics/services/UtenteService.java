package andi.cryptoanalytics.services;

import andi.cryptoanalytics.DTOs.UtenteDTO;
import andi.cryptoanalytics.entities.Role;
import andi.cryptoanalytics.entities.Utente;
import andi.cryptoanalytics.exceptions.BadRequestException;
import andi.cryptoanalytics.exceptions.NotFoundEmailException;
import andi.cryptoanalytics.exceptions.NotFoundException;
import andi.cryptoanalytics.repositories.UtenteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class UtenteService {

    private final UtenteRepository utenteRepository;
    private final PasswordEncoder bcrypt;


    @Autowired
    public UtenteService(UtenteRepository utenteRepository, PasswordEncoder bcrypt) {
        this.utenteRepository = utenteRepository;
        this.bcrypt=bcrypt;
    }

    public Utente save(UtenteDTO payload) {

        this.utenteRepository.findByEmail(payload.getEmail()).ifPresent(utente -> {
            throw new BadRequestException("L'email " + utente.getEmail() + " Ã¨ giÃ  in uso!");
        });
        Utente newUtente = new Utente(payload.getUsername(), payload.getNome(), payload.getCognome(), payload.getEmail(), bcrypt.encode(payload.getPassword()));
        Utente savedUtente = this.utenteRepository.save(newUtente);
        log.info("L'utente con Cognome " + savedUtente.getCognome() + " Ã¨ stato salvato correttamente!");
        return savedUtente;
    }
    public Utente saveOrganizer(UtenteDTO payload) {

        this.utenteRepository.findByEmail(payload.getEmail()).ifPresent(utente -> {
            throw new BadRequestException("L'email " + utente.getEmail() + " Ã¨ giÃ  in uso!");
        });

        Utente newUtente = new Utente(
                payload.getUsername(),
                payload.getNome(),
                payload.getCognome(),
                payload.getEmail(),
                bcrypt.encode(payload.getPassword())
        );

        newUtente.setRole(Role.ORGANIZER); 

        Utente savedUtente = this.utenteRepository.save(newUtente);

        log.info("L'organizzatore con Cognome " + savedUtente.getCognome() + " Ã¨ stato salvato correttamente!");

        return savedUtente;
    }

    public Page<Utente> findAll(int page, int size, String orderBy, String sortCriteria) {
        if (size > 100 || size < 0) size = 10;
        if (page < 0) page = 0;

        Pageable pageable = PageRequest.of(page, size,
                sortCriteria.equals("desc") ? Sort.by(orderBy).descending() : Sort.by(orderBy));
        return this.utenteRepository.findAll(pageable);
    }

    public Utente findById(UUID utenteId) {
        return this.utenteRepository.findById(utenteId)
                .orElseThrow(() -> new NotFoundException(utenteId));
    }

    public void findByIdAndDelete(UUID utenteId) {
        Utente found = this.findById(utenteId);
        this.utenteRepository.delete(found);
        log.info("L'utente con id " + utenteId + " Ã¨ stato eliminato correttamente");

    }

    public Utente findByEmail(String email) {
        return this.utenteRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundEmailException(email));
    }

    public Utente changePassword(Utente authUser, String oldPassword, String newPassword) {
        Utente fresh = this.findById(authUser.getId_utente());
        if (!bcrypt.matches(oldPassword, fresh.getPassword())) {
            throw new BadRequestException("La password attuale non è corretta");
        }
        fresh.setPassword(bcrypt.encode(newPassword));
        return this.utenteRepository.save(fresh);
    }
}

