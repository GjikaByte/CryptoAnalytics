package andi.cryptoanalytics.controllers;

import andi.cryptoanalytics.entities.Crypto;
import andi.cryptoanalytics.entities.Utente;
import andi.cryptoanalytics.services.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public Set<Crypto> get(@AuthenticationPrincipal Utente authUser) {
        return watchlistService.getForUser(authUser);
    }

    @PostMapping("/{cryptoId}")
    public Set<Crypto> add(@AuthenticationPrincipal Utente authUser, @PathVariable String cryptoId) {
        return watchlistService.add(authUser, cryptoId);
    }

    @DeleteMapping("/{cryptoId}")
    public Set<Crypto> remove(@AuthenticationPrincipal Utente authUser, @PathVariable String cryptoId) {
        return watchlistService.remove(authUser, cryptoId);
    }
}
