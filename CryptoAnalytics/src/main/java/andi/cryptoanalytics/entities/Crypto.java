package andi.cryptoanalytics.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "cryptos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crypto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String symbol;

    @Column(nullable = false)
    private String name;

    @Column(name = "current_price")
    private Double currentPrice;

    @Column(name = "market_cap")
    private Long marketCap;

    @Column(name = "market_cap_rank")
    private Integer marketCapRank;

    @Column(name = "fully_diluted_valuation")
    private Long fullyDilutedValuation;

    @Column(name = "total_volume")
    private Long totalVolume;

    @Column(name = "high_24h")
    private Double high24h;

    @Column(name = "low_24h")
    private Double low24h;

    @Column(name = "price_change_24h")
    private Double priceChange24h;

    @Column(name = "price_change_percentage_24h")
    private Double priceChangePercentage24h;

    @Column(name = "market_cap_change_24h")
    private Long marketCapChange24h;

    @Column(name = "market_cap_change_percentage_24h")
    private Double marketCapChangePercentage24h;

    @Column(name = "circulating_supply")
    private Double circulatingSupply;

    @Column(name = "total_supply")
    private Double totalSupply;

    @Column(name = "max_supply")
    private Double maxSupply;

    private Double ath;

    @Column(name = "ath_change_percentage")
    private Double athChangePercentage;

    @Column(name = "ath_date")
    private Instant athDate;

    private Double atl;

    @Column(name = "atl_change_percentage")
    private Double atlChangePercentage;

    @Column(name = "atl_date")
    private Instant atlDate;

    @Column(name = "last_updated")
    private Instant lastUpdated;

    private Double roiTimes;
    private String roiCurrency;
    private Double roiPercentage;
}