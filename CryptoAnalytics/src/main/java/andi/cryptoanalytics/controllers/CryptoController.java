package andi.cryptoanalytics.controllers;

import andi.cryptoanalytics.entities.Crypto;
import andi.cryptoanalytics.services.CryptoService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cryptos")
public class CryptoController {

    private final CryptoService cryptoService;

    public CryptoController(CryptoService cryptoService) {
        this.cryptoService = cryptoService;
    }

    // GET http://localhost:3001/cryptos
    @GetMapping
    public Page<Crypto> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String orderBy,
            @RequestParam(defaultValue = "asc") String sortCriteria) {

        return this.cryptoService.findAll(page, size, orderBy, sortCriteria);
    }

    // GET http://localhost:3001/cryptos/{id}
    @GetMapping("/{id}")
    public Crypto findById(@PathVariable String id) {
        return this.cryptoService.findById(id);
    }
}