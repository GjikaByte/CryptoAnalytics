package andi.cryptoanalytics.services;

import andi.cryptoanalytics.entities.Crypto;
import andi.cryptoanalytics.entities.Utente;
import andi.cryptoanalytics.exceptions.NotFoundException;
import andi.cryptoanalytics.repositories.CryptoRepository;
import andi.cryptoanalytics.repositories.UtenteRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final UtenteRepository utenteRepository;
    private final CryptoRepository cryptoRepository;

    @Transactional
    public Set<Crypto> getForUser(Utente authUser) {
        Utente fresh = utenteRepository.findById(authUser.getId_utente())
                .orElseThrow(() -> new NotFoundException(authUser.getId_utente()));
        return new HashSet<>(fresh.getWatchlist());
    }

    @Transactional
    public Set<Crypto> add(Utente authUser, String cryptoId) {
        Utente fresh = utenteRepository.findById(authUser.getId_utente())
                .orElseThrow(() -> new NotFoundException(authUser.getId_utente()));
        Crypto crypto = cryptoRepository.findById(cryptoId)
                .orElseThrow(() -> new NotFoundException(toUuidOrZero(cryptoId)));
        fresh.getWatchlist().add(crypto);
        utenteRepository.save(fresh);
        return new HashSet<>(fresh.getWatchlist());
    }

    @Transactional
    public Set<Crypto> remove(Utente authUser, String cryptoId) {
        Utente fresh = utenteRepository.findById(authUser.getId_utente())
                .orElseThrow(() -> new NotFoundException(authUser.getId_utente()));
        fresh.getWatchlist().removeIf(c -> c.getId().equals(cryptoId));
        utenteRepository.save(fresh);
        return new HashSet<>(fresh.getWatchlist());
    }

    private UUID toUuidOrZero(String s) {
        try { return UUID.fromString(s); } catch (Exception e) { return new UUID(0, 0); }
    }
}
