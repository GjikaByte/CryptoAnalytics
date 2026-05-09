package andi.cryptoanalytics.services;

import andi.cryptoanalytics.DTOs.CryptoDTO;
import andi.cryptoanalytics.entities.Crypto;
import andi.cryptoanalytics.exceptions.NotFoundException;
import andi.cryptoanalytics.repositories.CryptoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CryptoService {

    private final WebClient coinGeckoWebClient;
    private final CryptoRepository cryptoRepository;

    private static final int PER_PAGE = 250;
    private static final int TOTAL_COINS = 10000;
    private static final long DELAY_BETWEEN_REQUESTS_MS = 2000;
    private static final int SAVE_BATCH_SIZE = 500;

    private List<CryptoDTO> fetchMarketDataPage(int page) {
        return coinGeckoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/coins/markets")
                        .queryParam("vs_currency", "usd")
                        .queryParam("order", "market_cap_desc")
                        .queryParam("per_page", PER_PAGE)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToFlux(CryptoDTO.class)
                .collectList()
                .block(Duration.ofSeconds(30));
    }

    private List<CryptoDTO> fetchMarketDataPageWithRetry(int page) {
        int attempts = 0;
        while (attempts < 50) {
            try {
                return fetchMarketDataPage(page);
            } catch (WebClientResponseException.TooManyRequests e) {
                attempts++;
                System.out.println("429 Too Many Requests for page " + page + ", retry " + attempts);
                try {
                    Thread.sleep(10000);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                System.out.println("Error fetching page " + page + ": " + e.getMessage());
                return List.of();
            }
        }
        throw new RuntimeException("Failed to fetch page " + page + " after 50 retries");
    }

    private void upsertPage(List<CryptoDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return;

        Map<String, CryptoDTO> dedupedDtos = new LinkedHashMap<>();
        for (CryptoDTO dto : dtos) {
            if (dto.getSymbol() != null) dedupedDtos.putIfAbsent(dto.getSymbol(), dto);
        }

        Map<String, Crypto> existingBySymbol = cryptoRepository.findAllBySymbolIn(dedupedDtos.keySet())
                .stream()
                .collect(Collectors.toMap(Crypto::getSymbol, c -> c));

        List<Crypto> toSave = new ArrayList<>();
        for (CryptoDTO dto : dedupedDtos.values()) {
            Crypto existing = existingBySymbol.get(dto.getSymbol());
            if (existing != null) {
                updateEntityFromDto(existing, dto);
                toSave.add(existing);
            } else {
                toSave.add(mapToEntity(dto));
            }
        }

        cryptoRepository.saveAll(toSave);
    }

    private Crypto mapToEntity(CryptoDTO dto) {
        return Crypto.builder()
                .symbol(dto.getSymbol())
                .name(dto.getName())
                .currentPrice(dto.getCurrentPrice())
                .marketCap(dto.getMarketCap())
                .marketCapRank(dto.getMarketCapRank())
                .fullyDilutedValuation(dto.getFullyDilutedValuation())
                .totalVolume(dto.getTotalVolume())
                .high24h(dto.getHigh24h())
                .low24h(dto.getLow24h())
                .priceChange24h(dto.getPriceChange24h())
                .priceChangePercentage24h(dto.getPriceChangePercentage24h())
                .marketCapChange24h(dto.getMarketCapChange24h())
                .marketCapChangePercentage24h(dto.getMarketCapChangePercentage24h())
                .circulatingSupply(dto.getCirculatingSupply())
                .totalSupply(dto.getTotalSupply())
                .maxSupply(dto.getMaxSupply())
                .ath(dto.getAth())
                .athChangePercentage(dto.getAthChangePercentage())
                .athDate(dto.getAthDate())
                .atl(dto.getAtl())
                .atlChangePercentage(dto.getAtlChangePercentage())
                .atlDate(dto.getAtlDate())
                .lastUpdated(dto.getLastUpdated())
                .roiTimes(dto.getRoi() != null ? dto.getRoi().getTimes() : null)
                .roiCurrency(dto.getRoi() != null ? dto.getRoi().getCurrency() : null)
                .roiPercentage(dto.getRoi() != null ? dto.getRoi().getPercentage() : null)
                .build();
    }

    private void updateEntityFromDto(Crypto entity, CryptoDTO dto) {
        entity.setName(dto.getName());
        entity.setCurrentPrice(dto.getCurrentPrice());
        entity.setMarketCap(dto.getMarketCap());
        entity.setMarketCapRank(dto.getMarketCapRank());
        entity.setFullyDilutedValuation(dto.getFullyDilutedValuation());
        entity.setTotalVolume(dto.getTotalVolume());
        entity.setHigh24h(dto.getHigh24h());
        entity.setLow24h(dto.getLow24h());
        entity.setPriceChange24h(dto.getPriceChange24h());
        entity.setPriceChangePercentage24h(dto.getPriceChangePercentage24h());
        entity.setMarketCapChange24h(dto.getMarketCapChange24h());
        entity.setMarketCapChangePercentage24h(dto.getMarketCapChangePercentage24h());
        entity.setCirculatingSupply(dto.getCirculatingSupply());
        entity.setTotalSupply(dto.getTotalSupply());
        entity.setMaxSupply(dto.getMaxSupply());
        entity.setAth(dto.getAth());
        entity.setAthChangePercentage(dto.getAthChangePercentage());
        entity.setAthDate(dto.getAthDate());
        entity.setAtl(dto.getAtl());
        entity.setAtlChangePercentage(dto.getAtlChangePercentage());
        entity.setAtlDate(dto.getAtlDate());
        entity.setLastUpdated(dto.getLastUpdated());
        entity.setRoiTimes(dto.getRoi() != null ? dto.getRoi().getTimes() : null);
        entity.setRoiCurrency(dto.getRoi() != null ? dto.getRoi().getCurrency() : null);
        entity.setRoiPercentage(dto.getRoi() != null ? dto.getRoi().getPercentage() : null);
    }

    public Crypto findById(String id) {
        return this.cryptoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(new UUID(0, 0)));
    }

    public Page<Crypto> findAll(int page, int size, String orderBy, String sortCriteria) {
        if (size > 10000 || size < 0) size = 10000;
        if (page < 0) page = 0;

        Pageable pageable = PageRequest.of(page, size,
                sortCriteria.equals("desc") ? Sort.by(orderBy).descending() : Sort.by(orderBy));
        return this.cryptoRepository.findAll(pageable);
    }

    @Async
    public void init() {
        int totalPages = (int) Math.ceil((double) TOTAL_COINS / PER_PAGE);
        int totalSaved = 0;

        for (int page = 1; page <= totalPages; page++) {
            List<CryptoDTO> cryptos = fetchMarketDataPageWithRetry(page);
            upsertPage(cryptos);
            totalSaved += (cryptos != null ? cryptos.size() : 0);
            System.out.println("Fetched page " + page + "/" + totalPages + " | total processed: " + totalSaved);

            try {
                Thread.sleep(DELAY_BETWEEN_REQUESTS_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        System.out.println("Done! Total cryptos processed: " + totalSaved);
    }

    @Scheduled(fixedDelay = 60000)
    public void updateMarketData() {
        System.out.println("Starting scheduled market update...");

        int pagesToUpdate = 40;

        for (int page = 1; page <= pagesToUpdate; page++) {
            upsertPage(fetchMarketDataPageWithRetry(page));

            try {
                Thread.sleep(DELAY_BETWEEN_REQUESTS_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        System.out.println("Scheduled update completed.");
    }
}